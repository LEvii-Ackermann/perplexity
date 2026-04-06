import { mistralModel } from "../services/ai.service.js"
import scoreModel from "../models/score.model.js"
import { games } from "../store/game.store.js"
import { v4 as uuidv4 } from "uuid"
import { HumanMessage, AIMessage } from "langchain"
import { extractPrice, classifyOffer } from "../utils/game.utils.js"


/**
 * Starts a new game
 * 1. Validate input
 * 2. Create unique game ID
 * 3. Calculate random minimum price (40-60% of original)
 * 4. Initialize game state in memory
 * 5. Return game ID and initial state
 */
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
        lastAiPrice: null,
        maxRounds: 6
    }

    res.status(200).json({
        message: "Game started successfully",
        gameId,
        game: games[gameId]
    })

}


// funtion to get last N messages in HumanMessage/AIMessage format for langchain context
const getRecentMessages = (messages, limit = 6) => {
  return messages.slice(-limit).map((msg) => {
    if (msg.role === "user") return new HumanMessage(msg.content);
    if (msg.role === "ai") return new AIMessage(msg.content);
    return null;
  }).filter(Boolean);
};

// function to check if offer is accepted (exact match with last AI price)
const isDealAccepted = (offer, lastAiPrice) => {
  return offer !== null && lastAiPrice !== null && offer === lastAiPrice;
};

// function to calculate score based on original price and final price
const calculateScore = (originalPrice, finalPrice) => {
  return Math.floor(((originalPrice - finalPrice) / originalPrice) * 100);
};

// function to update mood based on offer classification and previous offer
const updateMood = (game, offer) => {
  const prev = game.lastOffer;

  if (offer === null) return;

  const classification = classifyOffer(offer, game.minPrice, game.originalPrice);

  if (classification === "bad") game.badOffers++;
  else game.badOffers = 0;

  if (classification === "bad") game.mood = "angry";
  else if (classification === "low") game.mood = "annoyed";
  else if (classification === "close") game.mood = "neutral";
  else if (classification === "good") game.mood = "happy";

  if (prev !== null && offer <= prev) {
    game.mood = "angry";
  }
};

// function to extract offer from AI reply (used to check if AI closed deal or made unrealistic drop)
const getOffer =(text) => {
  const res = extractPrice(text);
  return res?.isOffer ? res.price : null;
};

// function to generate AI reply based on recent messages and game state
const generateAIReply = async (game) => {
  const recentMessages = getRecentMessages(game.messages);

  const response = await mistralModel.invoke([
    {
      role: "system",
      systemPrompt: `
You are a street shopkeeper in India negotiating a product.

Product: ${game.product}
Original price: ₹${game.originalPrice}
Current round: ${game.rounds}/${game.maxRounds}
Your internal target price (hidden): ₹${game.targetPrice}
User's last offer: ₹${game.lastOffer || "none"}

BEHAVIOR RULES:

- Negotiate like a REAL human, not a bot
- You do NOT reduce price linearly
- Sometimes reduce a lot, sometimes very little
- Early rounds → resist strongly
- Middle rounds → negotiate seriously
- Final rounds → become flexible

IMPORTANT STRATEGY:

- If user offer is VERY LOW → react emotionally (anger, sarcasm)
- If user improves → reward slightly
- If user is close → try to close deal
- Do NOT drop too close to user instantly
- Never accept immediately in first 2 rounds

PRICE LOGIC:

- You decide your price naturally
- But try to stay above your internal target price
- Do NOT drop more than 20–30% in one step unless near final round

STYLE:

- Short responses (1 line)
- Hinglish tone (bhai, yaar, etc.)
- Natural human reactions

EXAMPLES:
"Arey bhai mazak kar rahe ho kya?"
"Thoda toh badhao, ₹42000 bol raha hu"
"Close hai, ₹35000 kar do"
"Theek hai ₹30000 deal done"

ONLY reply as shopkeeper.
`
    },
    ...recentMessages
  ]);

  return response.content;
};


// fallback reply if AI fails to generate valid response or extract price
const getFallbackReply = (game) => {
  if (game.mood === "angry") {
    return "Bhai system busy hai, par itna low mat bolo 😑";
  }
  if (game.mood === "happy") {
    return "Thoda wait karo bhai, system slow hai 🙂";
  }
  return "Network issue hai bhai, thoda baad try karo";
};


/**
 * Complete game flow:
 * 1. User sends message with offer
 * 2. Extract offer and classify
 * 3. Check if deal accepted
 * 4. Update mood and bad offer count
 * 5. If too many bad offers → cancel game
 * 6. Generate AI reply based on recent messages and mood
 * 7. Extract AI offer and check if AI closed deal
 * 8. Return AI reply and updated game state
 * 9. If deal completed → calculate score and save scorecard
 */
export const sendMessage = async (req, res) => {
  try {
    const { gameId, message } = req.body;

    if (!gameId || !message) {
      return res.status(400).json({ error: "gameId and message required" });
    }

    const game = games[gameId];

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // 1. Add user message
    game.messages.push({ role: "user", content: message });
    game.rounds++;

    // 2. Extract user offer and classify
    const extraction = await extractPrice(message);
    const offer = extraction?.isOffer ? extraction.price : null;

    if (offer !== null) {
      game.lastOffer = offer;
    }

    // 3. Check deal acceptance
    if (isDealAccepted(offer, game.lastAiPrice)) {
      const score = calculateScore(game.originalPrice, offer);

      const scoreCard = await scoreModel.create({
        user: req.user.id,
        product: game.product,
        originalPrice: game.originalPrice,
        finalPrice: offer,
        score
      });

      delete games[gameId];

      return res.json({
        reply: `Theek hai bhai, ₹${offer} mein deal done 🤝`,
        status: "completed",
        scoreCard
      });
    }

    // 4. Update mood
    updateMood(game, offer);

    // 5. Cancel if too many bad offers
    if (game.badOffers >= 3) {
      delete games[gameId];
      return res.json({
        reply: "Bhai time waste mat karo 😑 deal cancelled",
        status: "failed"
      });
    }

    // 6. Generate AI reply
    let aiReply;

    try {
        aiReply = await generateAIReply(game);
    } catch (error) {
        console.error("AI Error:", error.message);

        // Fallback reply (VERY IMPORTANT)
        aiReply = getFallbackReply(game);
    }

    // 7. Checking unrealistic drops (to prevent AI from dropping price too fast)
    const aiPriceCheck = await getOffer(aiReply);
    if (aiPriceCheck && game.lastAiPrice) {
        const maxDrop = game.lastAiPrice * 0.3;

        if (game.lastAiPrice - aiPriceCheck > maxDrop) {
            // reject unrealistic drop
            return res.json({
            reply: "Arey itna bhi nahi girta bhai, thoda realistic bolo",
            status: "ongoing"
            });
        }
    }

    // 8. Save AI message
    game.messages.push({ role: "ai", content: aiReply });

    // 9. Extract AI price
    const aiExtracted = extractPrice(aiReply);
    const aiPrice = aiExtracted?.isOffer ? aiExtracted.price : null;

    if (aiPrice !== null) {
      game.lastAiPrice = aiPrice;
    }

    // 10. Check if AI closed deal
    if (aiReply.toLowerCase().includes("deal done")) {
      const finalPrice = aiPrice || game.lastOffer;
      const score = calculateScore(game.originalPrice, finalPrice);

      const scoreCard = await scoreModel.create({
        user: req.user.id,
        product: game.product,
        originalPrice: game.originalPrice,
        finalPrice,
        score
      });

      delete games[gameId];

      return res.json({
        reply: aiReply,
        status: "completed",
        scoreCard
      });
    }

    // 11. Return ongoing state
    return res.json({
      reply: aiReply,
      status: "ongoing",
      game
    });

  } catch (error) {
    console.error("sendMessage error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

