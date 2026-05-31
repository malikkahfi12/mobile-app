export const MAP_STYLE = `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.EXPO_PUBLIC_MAPTILER_KEY}`;

export const INITIAL_CENTER: [number, number] = [106.8272, -6.1754];

export const INITIAL_ZOOM = 15;

export const ZOOM = {
  street: 16,
  city: 15,
  region: 8,
} as const;

export const FALLBACK_CENTER: [number, number] = [106.8272, -6.1754];
