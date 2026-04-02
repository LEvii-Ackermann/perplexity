export function extractPrice(text) {
  if (!text) return null;

  text = text.toLowerCase().replace(/,/g, "");

  // 🔹 Match all numbers (global)
  const matches = text.match(/\d+(\.\d+)?/g);
  if (!matches) return null;

  let numbers = matches.map(Number);

  // 🔹 Handle "k" properly (only when attached to number)
  const kMatch = text.match(/(\d+(\.\d+)?)\s*k\b/);
  if (kMatch) {
    return Math.floor(Number(kMatch[1]) * 1000);
  }

  // 🔹 Heuristic: pick most likely offer
  if (
    text.includes("only") ||
    text.includes("just") ||
    text.includes("have") ||
    text.includes("budget")
  ) {
    return Math.min(...numbers); // user is saying max they have
  }

  if (
    text.includes("max") ||
    text.includes("final") ||
    text.includes("last")
  ) {
    return Math.max(...numbers); // strong offer
  }

  // 🔹 Default: take last number (usually the offer in sentence)
  return Math.floor(numbers[numbers.length - 1]);
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