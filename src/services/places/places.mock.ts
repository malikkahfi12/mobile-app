import type {
  ExplorePlaceItem,
  PlaceCategory,
  PlaceDetailResponse,
  PlaceSearchParams,
  PlaceExploreParams,
} from "./places.types";

const MOCK_PLACES: ExplorePlaceItem[] = [
  {
    id: "osm:venue:way/1001",
    source: "openstreetmap",
    name: "Café Batavia",
    address: "Jl. Pintu Besar Utara No.14, Kota Tua, Jakarta Barat",
    lat: -6.1352,
    lng: 106.8133,
  },
  {
    id: "osm:venue:way/1002",
    source: "openstreetmap",
    name: "Grand Indonesia",
    address: "Jl. MH Thamrin No.1, Jakarta Pusat",
    lat: -6.1950,
    lng: 106.8223,
  },
  {
    id: "osm:venue:way/1003",
    source: "openstreetmap",
    name: "Monas",
    address: "Jl. Medan Merdeka, Jakarta Pusat",
    lat: -6.1754,
    lng: 106.8272,
  },
  {
    id: "osm:venue:way/1004",
    source: "foursquare",
    name: "Sate Khas Senayan",
    address: "Jl. Kebon Sirih No.31, Jakarta Pusat",
    lat: -6.1815,
    lng: 106.8290,
  },
  {
    id: "osm:venue:way/1005",
    source: "openstreetmap",
    name: "Taman Suropati",
    address: "Jl. Taman Suropati, Menteng, Jakarta Pusat",
    lat: -6.2020,
    lng: 106.8330,
  },
  {
    id: "osm:venue:way/1006",
    source: "openstreetmap",
    name: "Hotel Indonesia Kempinski",
    address: "Jl. MH Thamrin No.1, Jakarta Pusat",
    lat: -6.1940,
    lng: 106.8228,
  },
  {
    id: "osm:venue:way/1007",
    source: "foursquare",
    name: "Anomali Coffee",
    address: "Jl. Senopati No.45, Kebayoran Baru, Jakarta Selatan",
    lat: -6.2370,
    lng: 106.8010,
  },
  {
    id: "osm:venue:way/1008",
    source: "openstreetmap",
    name: "Plaza Indonesia",
    address: "Jl. MH Thamrin No.28, Jakarta Pusat",
    lat: -6.1935,
    lng: 106.8235,
  },
  {
    id: "osm:venue:way/1009",
    source: "openstreetmap",
    name: "Museum Nasional",
    address: "Jl. Medan Merdeka Barat No.12, Jakarta Pusat",
    lat: -6.1765,
    lng: 106.8230,
  },
  {
    id: "osm:venue:way/1010",
    source: "foursquare",
    name: "Nasi Padang Sederhana",
    address: "Jl. Bendungan Hilir No.45, Jakarta Pusat",
    lat: -6.2050,
    lng: 106.8100,
  },
  {
    id: "osm:venue:way/1011",
    source: "openstreetmap",
    name: "Tebet Eco Park",
    address: "Jl. Tebet Barat Raya, Tebet, Jakarta Selatan",
    lat: -6.2380,
    lng: 106.8520,
  },
  {
    id: "osm:venue:way/1012",
    source: "openstreetmap",
    name: "Fairmont Jakarta",
    address: "Jl. Asia Afrika No.8, Senayan, Jakarta Pusat",
    lat: -6.2230,
    lng: 106.7950,
  },
  {
    id: "osm:venue:way/1013",
    source: "openstreetmap",
    name: "Giyanti Coffee Roastery",
    address: "Jl. Surabaya No.20, Menteng, Jakarta Pusat",
    lat: -6.1950,
    lng: 106.8370,
  },
  {
    id: "osm:venue:way/1014",
    source: "foursquare",
    name: "Pondok Laguna",
    address: "Jl. Batu Tulis No.45, Jakarta Pusat",
    lat: -6.1700,
    lng: 106.8350,
  },
  {
    id: "osm:venue:way/1015",
    source: "openstreetmap",
    name: "Kota Tua Jakarta",
    address: "Jl. Taman Fatahillah No.1, Jakarta Barat",
    lat: -6.1352,
    lng: 106.8133,
  },
  {
    id: "osm:venue:way/1016",
    source: "openstreetmap",
    name: "Senayan City",
    address: "Jl. Asia Afrika No.19, Senayan, Jakarta Pusat",
    lat: -6.2250,
    lng: 106.7960,
  },
  {
    id: "osm:venue:way/1017",
    source: "openstreetmap",
    name: "Taman Menteng",
    address: "Jl. HOS Cokroaminoto, Menteng, Jakarta Pusat",
    lat: -6.1970,
    lng: 106.8335,
  },
  {
    id: "osm:venue:way/1018",
    source: "foursquare",
    name: "Mandarin Oriental Jakarta",
    address: "Jl. MH Thamrin, Jakarta Pusat",
    lat: -6.1945,
    lng: 106.8230,
  },
  {
    id: "osm:venue:way/1019",
    source: "openstreetmap",
    name: "Tanamera Coffee",
    address: "Jl. Wolter Monginsidi No.33, Jakarta Selatan",
    lat: -6.2400,
    lng: 106.7980,
  },
  {
    id: "osm:venue:way/1020",
    source: "foursquare",
    name: "Lara Djonggrang",
    address: "Jl. Teuku Cik Ditiro No.4, Menteng, Jakarta Pusat",
    lat: -6.1980,
    lng: 106.8350,
  },
  {
    id: "osm:venue:way/1021",
    source: "openstreetmap",
    name: "Taman Mini Indonesia Indah",
    address: "Jl. Raya TMII, Jakarta Timur",
    lat: -6.3020,
    lng: 106.8950,
  },
  {
    id: "osm:venue:way/1022",
    source: "openstreetmap",
    name: "Mall Kelapa Gading",
    address: "Jl. Kelapa Gading Boulevard, Jakarta Utara",
    lat: -6.1580,
    lng: 106.9030,
  },
  {
    id: "osm:venue:way/1023",
    source: "openstreetmap",
    name: "Taman Ayodya",
    address: "Jl. Barito, Kebayoran Baru, Jakarta Selatan",
    lat: -6.2350,
    lng: 106.8000,
  },
  {
    id: "osm:venue:way/1024",
    source: "foursquare",
    name: "The Hermitage Hotel",
    address: "Jl. Cilacap No.1, Menteng, Jakarta Pusat",
    lat: -6.2000,
    lng: 106.8360,
  },
  {
    id: "osm:venue:way/1025",
    source: "openstreetmap",
    name: "Djournal Coffee",
    address: "Jl. Kemang Raya No.17, Jakarta Selatan",
    lat: -6.2600,
    lng: 106.8100,
  },
  {
    id: "osm:venue:way/1026",
    source: "foursquare",
    name: "Plataran Menteng",
    address: "Jl. Teuku Cik Ditiro No.41, Menteng, Jakarta Pusat",
    lat: -6.1950,
    lng: 106.8355,
  },
  {
    id: "osm:venue:way/1027",
    source: "openstreetmap",
    name: "Dunia Fantasi",
    address: "Jl. Lodan Timur No.7, Ancol, Jakarta Utara",
    lat: -6.1260,
    lng: 106.8360,
  },
  {
    id: "osm:venue:way/1028",
    source: "openstreetmap",
    name: "Pacific Place",
    address: "Jl. Jend. Sudirman No.52, SCBD, Jakarta Selatan",
    lat: -6.2280,
    lng: 106.8080,
  },
  {
    id: "osm:venue:way/1029",
    source: "openstreetmap",
    name: "Hutan Kota GBK",
    address: "Komplek Gelora Bung Karno, Senayan, Jakarta Pusat",
    lat: -6.2180,
    lng: 106.8010,
  },
  {
    id: "osm:venue:way/1030",
    source: "foursquare",
    name: "Hotel Mulia Senayan",
    address: "Jl. Asia Afrika, Senayan, Jakarta Pusat",
    lat: -6.2210,
    lng: 106.7980,
  },
  {
    id: "osm:venue:way/1031",
    source: "openstreetmap",
    name: "Kopi Kalyan",
    address: "Jl. Melawai Raya No.8, Kebayoran Baru, Jakarta Selatan",
    lat: -6.2420,
    lng: 106.7990,
  },
  {
    id: "osm:venue:way/1032",
    source: "foursquare",
    name: "Warung Bu Kris",
    address: "Jl. Dr. Kusuma Atmaja No.64, Menteng, Jakarta Pusat",
    lat: -6.1960,
    lng: 106.8340,
  },
  {
    id: "osm:venue:way/1033",
    source: "openstreetmap",
    name: "Ragunan Zoo",
    address: "Jl. Harsono RM No.1, Ragunan, Jakarta Selatan",
    lat: -6.3015,
    lng: 106.8200,
  },
  {
    id: "osm:venue:way/1034",
    source: "openstreetmap",
    name: "Pasar Santa",
    address: "Jl. Cisanggiri No.2, Kebayoran Baru, Jakarta Selatan",
    lat: -6.2360,
    lng: 106.7955,
  },
  {
    id: "osm:venue:way/1035",
    source: "openstreetmap",
    name: "Taman Langsat",
    address: "Jl. Langsat, Kebayoran Baru, Jakarta Selatan",
    lat: -6.2375,
    lng: 106.7970,
  },
];

const STOP_NAMES = [
  "Halte Monas",
  "Halte Bundaran HI",
  "Halte Kota Tua",
  "Halte Senayan",
  "Halte Dukuh Atas",
  "Halte Tebet",
  "Halte Manggarai",
  "Halte Cikini",
  "Halte Blok M",
  "Halte Sudirman",
  "Halte Gondangdia",
  "Halte Juanda",
  "Halte Pasar Senen",
  "Halte Tanah Abang",
  "Halte Grogol",
];

function seedRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function getNearestStop(id: string): PlaceDetailResponse["nearestStop"] {
  const rng = seedRandom(id.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
  if (rng() > 0.85) return null;
  const stopIndex = Math.floor(rng() * STOP_NAMES.length);
  return {
    id: `stop-${stopIndex}`,
    name: STOP_NAMES[stopIndex],
    distanceMeters: Math.round(rng() * 900 + 50),
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function getDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function mockSearch(
  params: PlaceSearchParams,
): Promise<{ data: ExplorePlaceItem[]; meta: { query: string; count: number } }> {
  await delay(400 + Math.random() * 300);

  const q = params.q.toLowerCase();
  let results = MOCK_PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q),
  );

  if (params.lat != null && params.lng != null) {
    results = results.sort((a, b) => {
      const dA = getDistanceMeters(params.lat!, params.lng!, a.lat, a.lng);
      const dB = getDistanceMeters(params.lat!, params.lng!, b.lat, b.lng);
      return dA - dB;
    });
  }

  const limit = params.limit ?? 20;
  results = results.slice(0, limit);

  return { data: results, meta: { query: params.q, count: results.length } };
}

export async function mockExplore(
  params: PlaceExploreParams,
): Promise<{ data: ExplorePlaceItem[]; meta: { bbox: string; count: number } }> {
  await delay(300 + Math.random() * 300);

  const [minLng, minLat, maxLng, maxLat] = params.bbox.split(",").map(Number);

  let results = MOCK_PLACES.filter(
    (p) =>
      p.lat >= minLat &&
      p.lat <= maxLat &&
      p.lng >= minLng &&
      p.lng <= maxLng,
  );

  const limit = params.limit ?? 20;
  results = results.slice(0, limit);

  return { data: results, meta: { bbox: params.bbox, count: results.length } };
}

export async function mockDetail(
  idOrName: string,
  lat?: number,
  lng?: number,
): Promise<{ data: PlaceDetailResponse }> {
  await delay(200 + Math.random() * 300);

  let place: ExplorePlaceItem | undefined;

  if (lat != null && lng != null) {
    place = MOCK_PLACES.find(
      (p) => p.name.toLowerCase() === idOrName.toLowerCase(),
    );
  } else {
    place = MOCK_PLACES.find((p) => p.id === idOrName);
  }

  place = place ?? MOCK_PLACES[0];

  const nearestStop = getNearestStop(place.id);

  return {
    data: {
      ...place,
      nearestStop,
      actions: { canRoute: nearestStop !== null },
    },
  };
}

export async function mockReverse(
  lat: number,
  lng: number,
): Promise<{ data: string }> {
  await delay(200 + Math.random() * 200);

  let closest = MOCK_PLACES[0];
  let minDist = Infinity;

  for (const p of MOCK_PLACES) {
    const d = getDistanceMeters(lat, lng, p.lat, p.lng);
    if (d < minDist) {
      minDist = d;
      closest = p;
    }
  }

  return { data: closest.address };
}

export const CATEGORIES: { key: PlaceCategory; icon: string; labelKey: string }[] = [
  { key: "place", icon: "grid-outline", labelKey: "explorer.categories.all" },
  { key: "coffee", icon: "cafe-outline", labelKey: "explorer.categories.coffee" },
  { key: "food", icon: "restaurant-outline", labelKey: "explorer.categories.food" },
  { key: "shopping", icon: "cart-outline", labelKey: "explorer.categories.shopping" },
  { key: "parks", icon: "leaf-outline", labelKey: "explorer.categories.parks" },
  { key: "hotels", icon: "bed-outline", labelKey: "explorer.categories.hotels" },
];
