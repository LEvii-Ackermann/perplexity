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



export function classifyOffer(offer, minPrice) {
    const diff = minPrice - offer;
    const percent = diff / minPrice;

    if (offer >= minPrice) return "good";
    if (percent <= 0.1) return "close";     
    if (percent <= 0.4) return "low";       
    return "bad";                         
}