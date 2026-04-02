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
        mood: "neutral"
    }

    res.status(200).json({
        message: "Game started successfully",
        gameId,
        game: games[gameId]
    })

}


/**
    * Game flow:        
    * 1. User starts game by providing product and original price
    * 2. User sends offer as message
    * 3. If offer >= minPrice → accept deal, calculate score and end game
    * 4. If offer < minPrice → classify offer (good/close/low/bad)
    * 5. If offer is bad, increment badOffers count
    * 6. If badOffers >= 3, cancel deal and end game
    * 7. Otherwise, respond with AI message and continue game
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

    const offer = extractPrice(message);


    // Check if offer is valid and meets conditions to close the deal
    if (
        offer !== null &&
        offer >= game.minPrice &&
        game.rounds >= 4
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
            reply: `Theek hai bhai, deal done at ₹${offer} 🤝`,
            status: "completed",
            scoreCard
        });
    }


    // It is to set the mood of the shopkeeper based on the offer.
    if(offer !== null) {
        const classification = classifyOffer(offer, game.minPrice, game.originalPrice);
        if(classification === "bad") {
            game.badOffers = (game.badOffers || 0) + 1;
            game.mood = "angry";   
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

        if(game.badOffers >= 3) {
            delete games[gameId];

            return res.json({
                reply: "Bhai time waste mat karo 😑 deal cancelled",
                status: "failed"
            });
        }
    }

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

                STRICT RULES:
                - Always negotiate like a real human seller
                - NEVER ask questions like an assistant
                - NEVER explain reasoning
                - NEVER ask unnecessary questions
                - ALWAYS reply with a counter price or reaction
                - When you accept a deal, ALWAYS include the phrase "deal done"

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

                DO NOT break character.
            `
        },
        ...formattedMessages
    ])

    game.messages.push({
        role: "ai",
        content: response.content
    })

    return res.json({
        reply: response.content,
        status: "ongoing",
        game: games[gameId]
    });

}
