export function extractPrice(text) {
  if (!text) return { isOffer: false, price: null };

  const cleaned = text.toLowerCase().replace(/,/g, "");

  // handle "12k"
  const kMatch = cleaned.match(/(\d+)\s*k/);
  if (kMatch) {
    return { isOffer: true, price: Number(kMatch[1]) * 1000 };
  }

  // normal numbers
  const match = cleaned.match(/\d{3,6}/);
  if (match) {
    return { isOffer: true, price: Number(match[0]) };
  }

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
