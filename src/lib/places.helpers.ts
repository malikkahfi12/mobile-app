export function buildBbox(lat: number, lng: number, radiusKm: number): string {
  const kmPerDeg = 111.32;
  const dLat = radiusKm / kmPerDeg;
  const dLng = radiusKm / (kmPerDeg * Math.cos((lat * Math.PI) / 180));
  return `${(lng - dLng).toFixed(4)},${(lat - dLat).toFixed(4)},${(lng + dLng).toFixed(4)},${(lat + dLat).toFixed(4)}`;
}
