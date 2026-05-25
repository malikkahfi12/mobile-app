const config = {
  development: {
    apiUrl: `http://${process.env.EXPO_PUBLIC_API_HOST || "localhost"}:3000/api/v1`,
    apiKey: process.env.EXPO_PUBLIC_API_KEY || "dev_tly_api_7f3b9c2a8e1d4f6a",
  },
  production: {
    apiUrl: "https://api.patheo.app/api/v1",
    apiKey: process.env.EXPO_PUBLIC_API_KEY || "",
  },
} as const;

export const apiConfig = __DEV__ ? config.development : config.production;
