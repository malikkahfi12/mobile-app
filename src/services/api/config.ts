const config = {
  development: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    apiKey: process.env.EXPO_PUBLIC_API_KEY,
  },
  production: {
    apiUrl: process.env.EXPO_PUBLIC_PROD_API_URL,
    apiKey: process.env.EXPO_PUBLIC_API_KEY,
  },
} as const;

export const apiConfig = __DEV__ ? config.development : config.production;
