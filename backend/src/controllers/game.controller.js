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

    const minPrice = Math.floor(originalPrice * 0.4);

    games[gameId] = {
        product,
        originalPrice,
        minPrice,
        messages: [],
        badOffers: 0
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

    game.messages.push({
        role: "user",
        content: message
    })

    const offer = extractPrice(message);

    if (offer !== null && offer >= game.minPrice) {
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
            reply: `Deal done at ₹${offer} 🤝`,
            status: "completed",
            scoreCard
        });
    }

    if(offer !== null) {
        const classification = classifyOffer(offer, game.minPrice);
        if(classification === "bad") {
            game.badOffers = (game.badOffers || 0) + 1;

            if(game.badOffers >= 3) {
                delete games[gameId];

                return res.json({
                    reply: "Bhai time waste mat karo 😑 deal cancelled",
                    status: "failed"
                });
            }
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
            Minimum acceptable price: ₹${game.minPrice}

            STRICT RULES:
            - Always negotiate like a human seller
            - NEVER ask for clarification
            - NEVER act like an assistant
            - NEVER explain things
            - ALWAYS respond with a counter price or reaction
            - If offer is too low → react (angry/funny/strict)
            - If offer is close → reduce price slightly
            - If offer >= minPrice → accept deal
            - If user wastes time or gives repeated low offers, cancel the deal

            STYLE:
            - Short responses
            - Natural bargaining tone
            - Example:
            "Too low bhai, at least ₹4500"
            "No chance, increase your offer"
            "Okay final ₹3000, last price"

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
