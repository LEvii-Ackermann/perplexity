import { mistralModel } from "../services/ai.service.js"
import scoreModel from "../models/score.model.js"
import { games } from "../store/game.store.js"
import { v4 as uuidv4 } from "uuid"
import { HumanMessage, AIMessage } from "langchain"
import { extractPrice, classifyOffer } from "../utils/game.utils.js"

/**
 * startGame: Initializes a new negotiation game with a specified product and original price.
 * generates a unique game ID and calculates a random minimum price for the product.
 * Stores the game state in an in-memory object and returns the game details to the client.
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
        maxRounds: 6,
        language: null
    }

    res.status(200).json({
        message: "Game started successfully",
        gameId,
        game: games[gameId]
    })
}


// function to get recent messages and format them for AI input
const getRecentMessages = (messages, limit = 6) => {
  return messages.slice(-limit).map((msg) => {
    if (msg.role === "user") return new HumanMessage(msg.content);
    if (msg.role === "ai") return new AIMessage(msg.content);
    return null;
  }).filter(Boolean);
};

// function to extract offer from user message
const isDealAccepted = (offer, aiPrice) => {
  if (!offer || !aiPrice) return false;
  return Math.abs(offer - aiPrice) <= aiPrice * 0.03; // 3% tolerance
};

// function to extract price from text and determine if it's an offer
const calculateScore = (originalPrice, finalPrice) => {
  return Math.floor(((originalPrice - finalPrice) / originalPrice) * 100);
};

// function to detect language (english or hinglish)
const isEnglish = (text) => {
  return /^[a-zA-Z0-9\s.,!?₹]+$/.test(text);
};

// function to update mood based on offer quality and history
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

// function to extract offer from AI reply
const getOffer = (text) => {
  const res = extractPrice(text);
  return res?.isOffer ? res.price : null;
};

// function to generate AI reply based on game state and recent messages
const generateAIReply = async (game) => {
  const recentMessages = getRecentMessages(game.messages);

  const response = await mistralModel.invoke([
    {
      role: "system",
      content: `
You are a street shopkeeper in India negotiating a product.

Product: ${game.product}
Original price: ₹${game.originalPrice}
Current round: ${game.rounds}/${game.maxRounds}
User's last offer: ₹${game.lastOffer || "none"}
Language: ${game.language}

BEHAVIOR RULES:

- Negotiate like a REAL human, not a bot
- Do NOT reduce price linearly
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

- Do NOT drop more than 20–30% in one step unless near final round

LANGUAGE RULE:

- If language = english → reply in English
- If language = hinglish → reply in Hinglish

STYLE:

- Short responses (1 line)
- Natural human tone

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

// Fallback reply if AI fails to generate a response
const getFallbackReply = (game) => {
  if (game.mood === "angry") {
    return "Bhai system busy hai, par itna low mat bolo 😑";
  }
  if (game.mood === "happy") {
    return "Thoda wait karo bhai, system slow hai 🙂";
  }
  return "Network issue hai bhai, thoda baad try karo";
};

const checkRounds = async (game, req, res, gameId) => {
  if (game.rounds >= game.maxRounds) {
    const finalPrice =
      game.lastAiPrice ?? Math.floor(game.originalPrice * 0.9);

    const score = calculateScore(game.originalPrice, finalPrice);

    const scoreCard = await scoreModel.create({
      user: req.user.id,
      product: game.product,
      originalPrice: game.originalPrice,
      finalPrice,
      attempts: game.rounds,
      score,
    });

    delete games[gameId];

    res.json({
      reply: game.language === "english"
        ? `Time's up! Seller sticks to ₹${finalPrice} 😄`
        : `Time khatam! Seller ₹${finalPrice} se niche nahi gaya 😄`,
      status: "completed",
      scoreCard,
    });

    return true; 
  }

  return false; 
};


/**
 * Full game flow:
 * 1. User sends message with offer
 * 2. Validate offer and update game state
 * 3. Check for deal acceptance 
 * 4. Update mood based on offer quality
 * 5. If game continues, generate AI reply based on recent messages and game state
 * 6. Extract offer from AI reply and update game state
 * 7. Check for deal acceptance again
 * 8. Return AI reply and updated game state to user
 * 
 * Edge cases:
 * - If user doesn't send an offer → prompt them to send an offer
 * - If user sends a very low offer → react emotionally
 * - If AI fails to generate a response → send fallback reply based on mood
 * - If user tries to drop price too much in one step → reject and warn
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { gameId, message, offer } = req.body;

    if (!gameId || !message) {
      return res.status(400).json({ error: "gameId and message required" });
    }

    const game = games[gameId];

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // language detection
    if (!game.language) {
      game.language = isEnglish(message) ? "english" : "hinglish";
    }

    // 1. Add user message
    game.messages.push({ role: "user", content: message });
    game.rounds++;

    if (game.rounds > game.maxRounds) {
      return await checkRounds(game, req, res, gameId);
    }

    //  OFFER COMPULSORY
    if (offer === null || isNaN(offer)) {
      return res.json({
        reply: game.language === "english"
          ? "Please give a price offer to continue."
          : "Bhai price toh bol 😄",
        status: "ongoing"
      });
    }

    game.lastOffer = offer;

    // 3. Deal accepted
    if (isDealAccepted(offer, game.lastAiPrice)) {
      const score = calculateScore(game.originalPrice, offer);

      const scoreCard = await scoreModel.create({
        user: req.user.id,
        product: game.product,
        originalPrice: game.originalPrice,
        finalPrice: offer,
        attempts: game.rounds,
        score
      });

      delete games[gameId];

      return res.json({
        reply: `Theek hai bhai, ₹${offer} mein deal done 🤝`,
        status: "completed",
        scoreCard
      });
    }

    // 4. Mood
    updateMood(game, offer);

    // 5. Cancel
    if (game.badOffers >= 3) {
      delete games[gameId];
      return res.json({
        reply: "Bhai time waste mat karo 😑 deal cancelled",
        status: "failed"
      });
    }

    // 6. AI reply
    let aiReply;

    try {
        aiReply = await generateAIReply(game);
    } catch (error) {
        aiReply = getFallbackReply(game);
    }

    // 7. unrealistic drop check
    const aiPriceCheck = getOffer(aiReply);

    if (
      game.rounds < game.maxRounds &&  
      aiPriceCheck !== null &&
      game.lastAiPrice !== null
    ) {
      const maxDrop = game.lastAiPrice * 0.3;

      if (game.lastAiPrice - aiPriceCheck > maxDrop) {
        return res.json({
          reply: "Arey itna bhi nahi girta bhai 😅",
          status: "ongoing"
        });
      }
    }

    // 8. save AI
    game.messages.push({ role: "ai", content: aiReply });

    // 9. extract AI price
    const aiExtracted = await extractPrice(aiReply);
    const aiPrice = aiExtracted?.isOffer ? aiExtracted.price : null;

    if (aiPrice !== null) {
      game.lastAiPrice = aiPrice;
    }

    // 10. AI deal done
    if (aiReply.toLowerCase().includes("deal done")) {
      const finalPrice = game.lastOffer;

      const score = calculateScore(game.originalPrice, finalPrice);

      const scoreCard = await scoreModel.create({
        user: req.user.id,
        product: game.product,
        originalPrice: game.originalPrice,
        finalPrice: finalPrice,
        attempts: game.rounds,
        score
      });

      delete games[gameId];

      return res.json({
        reply: aiReply,
        status: "completed",
        scoreCard
      });
    }

    //  END AFTER MAX ROUNDS
    const roundCheck = await checkRounds(game, req, res, gameId);
    if (roundCheck) return;

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


// Leaderboard controller to fetch top scores
export const leaderboardController = async (req, res, next) => {
  try {
    const topscores = await scoreModel.find().sort({ score: -1}).limit(10).populate("user")
    console.log("Leaderboard", topscores[0]);
    res.status(200).json({
      leaderboard: topscores.map(score => ({
        user: score.user.username,
        product: score.product, 
        attemps: score.attempts,
        score: score.score,
      }))
    })
  } 
  catch (error) {
    console.error("leaderboardController error:", error);
    return res.status(500).json({
      error: "Internal server error"
    })
  }
}


// Controller to fetch score and details of the deal
export const scoreController = async (req, res, next) => {
  try {
    const latestScore = await scoreModel.findOne({ user: req.user.id}).sort({ createdAt: -1 }).populate("user")
    if (!latestScore) {
      return res.status(404).json({
        message: "No scores found for user"
      })
    }

    res.status(200).json({
      score: latestScore.score,
      product: latestScore.product,
      originalPrice: latestScore.originalPrice,
      finalPrice: latestScore.finalPrice,
      attempts: latestScore.attempts,
      user: latestScore.user.username
    })
  }
  catch (error) {
    console.error("scoreController error:", error);
    return res.status(500).json({
      error: "Internal server error"
    })
  }
}


// Controller to get user's current rank based on latest score
export const getUserRankController = async (req, res, next) => {
  try {
    const scores = await scoreModel.find().sort({ score: -1 }).populate("user")

    const latestScore = await scoreModel.findOne({ user: req.user.id}).sort({ createdAt: -1 })
    if (!latestScore) {
      return res.status(200).json({
        message: "No games played yet",
        rank: null
      });
    }

    const userIndex = scores.findIndex((score) => {
      return score._id.toString() === latestScore._id.toString();
    });

    const userRank = userIndex !== -1 ? userIndex + 1 : null;

    res.status(200).json({
      rank: userRank,
      score: latestScore.score,
      totalPlayers: scores.length
    })
  }
  catch (error) {
    console.error("getUserRankController error:", error);
    return res.status(500).json({
      error: "Internal server error"
    })
  }
}
