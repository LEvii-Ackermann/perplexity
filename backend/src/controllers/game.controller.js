import { geminiModel } from "../services/ai.service.js"
import scoreModel from "../models/score.model.js"
import { games } from "../store/game.store.js"
import { v4 as uuidv4 } from "uuid"
import { HumanMessage, AIMessage } from "langchain"
import { extractPrice, classifyOffer } from "../utils/game.utils.js"


export const startGame = (req, res, next) => {
    const { product, originalPrice } = req.body
    
    const gameId = uuidv4()

    if (!product || !originalPrice) {
        return res.status(400).json({
            message: "Product and originalPrice are required"
        })
    }

    const minPrice = Math.floor(originalPrice * (0.4 + Math.random() * 0.2));

    games[gameId] = {
        product,
        originalPrice,
        minPrice,
        messages: [],
        badOffers: 0,
        rounds: 0,
        mood: "neutral",
        lastOffer: null,
        lastAiPrice: null
    }

    res.status(200).json({
        message: "Game started successfully",
        gameId,
        game: games[gameId]
    })

}


/**
    * Game flow:        
    1. User sends message with gameId and their offer
    2. Append user message to game history
    3. Extract price offer from user message using AI
    4. Check if offer is valid and meets conditions to close the deal
    5. If deal closed → calculate score, save scoreCard, return completed status
    6. If deal not closed → generate AI response based on conversation history and game state, append to history, return ongoing status with AI reply
 */
export const sendMessage = async (req, res, next) => {
    const { gameId, message } = req.body

    if (!gameId || !message) {
        return res.status(400).json({ error: "gameId and message required" });
    }

    const game = games[gameId]

    if(!game) {
        return res.status(404).json({
            message: "Game not found"
        })
    }

    // Append user message to game history
    game.messages.push({
        role: "user",
        content: message
    })

    // Increment round count
    game.rounds = (game.rounds || 0) + 1;

    // Combine price extraction and response generation in one AI call
    const formattedMessages = game.messages.map((msg) => {
        if (msg.role === "user") return new HumanMessage(msg.content);
        if (msg.role === "ai") return new AIMessage(msg.content);
        return null;
      }).filter(Boolean);
    
    const response = await geminiModel.invoke([
        {
            role: "system",
            content: `
                You are a street shopkeeper in India selling a product.

                Product: ${game.product}
                Original price: ₹${game.originalPrice}
                Your hidden minimum price: ₹${game.minPrice}
                Current negotiation round: ${game.rounds}
                Current mood: ${game.mood}
                User's last offer: ₹${game.lastOffer || "none"}

                FIRST: Analyze the user's message and extract their price offer.
                - If they made a clear price offer, set extractedPrice to that number
                - If not (just reacting, questioning, etc.), set extractedPrice to null

                THEN: Respond as the shopkeeper based on the extracted price and game state.

                STRICT RULES:
                - Always negotiate like a real human seller
                - NEVER ask questions like an assistant
                - NEVER explain reasoning
                - NEVER ask unnecessary questions
                - ALWAYS reply with a counter price or reaction
                - When you accept a deal, ALWAYS include the phrase "deal done"
                - Your next price should be slightly lower than your previous price
                - Reduce your price slowly and independently
                - Do NOT jump close to the user's offer in one step
                - Maximum drop per step should be small (₹200-₹500)

                NEGOTIATION BEHAVIOR:
                - Start from a high price and reduce gradually
                - Never drop price too quickly
                - Never accept a deal in the first 2-3 rounds
                - Try to maximize profit but still close the deal
                - If user repeats low offers, get frustrated
                - If user wastes time, cancel the deal

                MOOD BEHAVIOR:
                - If mood is angry → be rude, sarcastic, or strict
                - If mood is annoyed → slightly irritated tone
                - If mood is neutral → normal negotiation tone
                - If mood is happy → friendly and a bit flexible

                LANGUAGE:
                - Use the same language as the customer
                - If user speaks English → reply in English
                - If user speaks Hindi/Hinglish → reply similarly

                STYLE:
                - Very short responses (1 line preferred)
                - Use Indian street tone (bhai, yaar, etc.)
                - Sound natural, not robotic

                EXAMPLES:
                "Too low bhai, at least ₹4500"
                "Arey seriously?"
                "Close hai, ₹3500 kar do"
                "Final bol raha hu ₹3200"
                "Time waste mat karo, deal cancel"

                OUTPUT FORMAT: Return ONLY valid JSON with no extra text:
                {
                  "extractedPrice": number or null,
                  "response": "your shopkeeper reply"
                }
            `
        },
        ...formattedMessages
    ])

    // Parse the AI response as JSON
    let parsedResponse;
    try {
        parsedResponse = JSON.parse(response.content);
    } catch (error) {
        // Fallback if JSON parsing fails
        parsedResponse = { extractedPrice: null, response: response.content };
    }

    const { extractedPrice, response: aiReply } = parsedResponse;
    const offer = extractedPrice;

    const previousOffer = game.lastOffer;
    if(offer !== null) {
        game.lastOffer = offer;
    }


    // Check if Ai offer is equal to user's offer. If yes, it means AI accepted the deal. So we can calculate score and end the game.
    if (
        offer !== null &&
        game.lastAiPrice !== null &&
        offer === game.lastAiPrice
    ) {
        const score = Math.floor(
            ((game.originalPrice - offer) / game.originalPrice) * 100
        );

        const scoreCard = await scoreModel.create({
            user: req.user.id,
            product: game.product,
            originalPrice: game.originalPrice,
            finalPrice: offer,
            score,
        });

        delete games[gameId];

        return res.json({
            reply: `Theek hai bhai, ₹${offer} mein deal done 🤝`,
            status: "completed",
            scoreCard
        });
    }

    // It is to set the mood of the shopkeeper based on the offer.
    if(offer !== null) {
        const classification = classifyOffer(offer, game.minPrice, game.originalPrice);
        if(classification === "bad") {
            game.badOffers = (game.badOffers || 0) + 1;  
        } else {
            game.badOffers = 0;
        }

        // Mood system
        if (classification === "bad") {
            game.mood = "angry";
        } 
        else if (classification === "low") {
            game.mood = "annoyed";
        } 
        else if (classification === "close") {
            game.mood = "neutral";
        } 
        else if (classification === "good") {
            game.mood = "happy";
        } 
        
        if (previousOffer !== null && offer === previousOffer) {
            game.mood = "angry";
        }

        if (previousOffer !== null && offer < previousOffer) {
            game.mood = "angry"; // going backward
        }

        if(game.badOffers >= 3) {
            delete games[gameId];

            return res.json({
                reply: "Bhai time waste mat karo 😑 deal cancelled",
                status: "failed"
            });
        }
    }

    // Append AI response to game history
    game.messages.push({
        role: "ai",
        content: aiReply
    })
    

    // Extract price from AI response to check if deal is closed
    const aiExtracted = await extractPrice(aiReply);
    const aiPrice = aiExtracted?.isOffer ? aiExtracted.price : null;

    if (aiPrice !== null) {
        game.lastAiPrice = aiPrice;
    }



    // Check if AI accepted the deal by looking for "deal done" phrase in the response
    const aiReplyLower = aiReply.toLowerCase();
    if (aiReplyLower.includes("deal done" )) {
        const extracted = await extractPrice(aiReply);
        const finalPrice = extracted?.price || game.lastOffer;

        const score = Math.floor(
            ((game.originalPrice - finalPrice) / game.originalPrice) * 100
        );

        const scoreCard = await scoreModel.create({
            user: req.user.id,
            product: game.product,
            originalPrice: game.originalPrice,
            finalPrice,
            score,
        });

        delete games[gameId];

        return res.json({
            reply: aiReply,
            status: "completed",
            scoreCard
        });
    }

    // If deal not closed, return ongoing status with AI response and updated game state
    return res.json({
        reply: aiReply,
        status: "ongoing",
        game: games[gameId]
    });

}
