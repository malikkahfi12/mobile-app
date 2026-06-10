export const apiConfig = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL,
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
} as const;

console.log("[CONFIG] apiUrl:", apiConfig.apiUrl);
console.log("[CONFIG] apiKey:", apiConfig.apiKey ? "PRESENT" : "MISSING");
