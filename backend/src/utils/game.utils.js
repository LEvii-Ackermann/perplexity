export function extractPrice(text) {
  if (!text) return { isOffer: false, price: null };

  // 🔹 Normalize text (lowercase + remove commas)
  const cleaned = text.toLowerCase().replace(/,/g, "").trim();

  // 🔹 Split words (used later for intent rules)
  const words = cleaned.split(/\s+/);

  // =========================
  // 🧠 STEP 1: Extract number
  // =========================

  let price = null;

  // Handle "12k" → 12000
  const kMatch = cleaned.match(/(\d+)\s*k/);
  if (kMatch) {
    price = parseInt(kMatch[1], 10) * 1000;
  } else {
    // Normal numbers like 10000, 50000
    const match = cleaned.match(/\b\d{3,6}\b/);
    if (match) {
      price = parseInt(match[0], 10);
    }
  }

  // If no number found → not an offer
  if (!price) {
    return { isOffer: false, price: null };
  }

  // =========================
  // 🧠 STEP 2: Reject obvious NON-offers
  // =========================

  // Question or disbelief → not an offer
  const rejectPatterns = [
    /\?/,
    /\b(seriously|really|sach|kya|why|kaise)\b/,
    /\b(too much|mehenga|expensive)\b/
  ];

  if (rejectPatterns.some((pattern) => pattern.test(cleaned))) {
    return { isOffer: false, price: null };
  }

  // =========================
  // 🧠 STEP 3: Strong offer intent
  // =========================

  const strongOfferPatterns = [
    /\b(final|last|done|deal)\b/,
    /\b(i can give|i will give|i'll give)\b/,
    /\b(de deta hu|de dunga|le lo|mera budget|max)\b/
  ];

  if (strongOfferPatterns.some((pattern) => pattern.test(cleaned))) {
    return { isOffer: true, price };
  }

  // =========================
  // 🧠 STEP 4: Weak intent (short + direct)
  // =========================

  // Example: "50000", "bhai 20000", "20000 bhai"
  if (words.length <= 3) {
    return { isOffer: true, price };
  }

  // =========================
  // 🧠 STEP 5: Default fallback
  // =========================

  return { isOffer: false, price: null };
}


export function classifyOffer(offer, minPrice, originalPrice) {
  const minRatio = offer / minPrice;
  const originalRatio = offer / originalPrice;

  if (offer >= minPrice && originalRatio >= 0.7) {
    return "good"; // strong deal
  }

  if (offer >= minPrice) {
    return "close"; // acceptable but not great
  }

  if (originalRatio >= 0.5) {
    return "low"; // somewhat reasonable
  }

  return "bad"; // insultingly low
}
