const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "https://perplexity-ky39.onrender.com";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");