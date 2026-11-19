// Route calculation and corridor spatial query service

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface RouteData {
  origin: string;
  destination: string;
  originCoords: GeoPoint;
  destinationCoords: GeoPoint;
  distanceKm: number;
  durationMinutes: number;
  polyline: GeoPoint[];
  summary: string;
}

// Bangladeshi Major Cities and Hubs Geocache for instant and reliable coordinates
export const BD_LOCATIONS: Record<string, { lat: number; lng: number; bn: string }> = {
  // Dhaka Major Hubs & Micro-locations
  'mirpur 10': { lat: 23.8071, lng: 90.3685, bn: 'মিরপুর ১০' },
  'mirpur 11': { lat: 23.8189, lng: 90.3653, bn: 'মিরপুর ১১' },
  'mirpur 12': { lat: 23.8286, lng: 90.3642, bn: 'মিরপুর ১২' },
  'mirpur 1': { lat: 23.7956, lng: 90.3537, bn: 'মিরপুর ১' },
  'mirpur 2': { lat: 23.8047, lng: 90.3614, bn: 'মিরপুর ২' },
  'mirpur': { lat: 23.8069, lng: 90.3687, bn: 'মিরপুর' },
  'dhanmondi 27': { lat: 23.7538, lng: 90.3768, bn: 'ধানমন্ডি ২৭' },
  'dhanmondi 32': { lat: 23.7512, lng: 90.3775, bn: 'ধানমন্ডি ৩২' },
  'dhanmondi': { lat: 23.7465, lng: 90.3760, bn: 'ধানমন্ডি' },
  'farmgate': { lat: 23.7570, lng: 90.3905, bn: 'ফার্মগেট' },
  'uttara': { lat: 23.8759, lng: 90.3795, bn: 'উত্তরা' },
  'motijheel': { lat: 23.7330, lng: 90.4172, bn: 'মতিঝিল' },
  'gulshan 1': { lat: 23.7808, lng: 90.4165, bn: 'গুলশান ১' },
  'gulshan 2': { lat: 23.7947, lng: 90.4143, bn: 'গুলশান ২' },
  'gulshan': { lat: 23.7925, lng: 90.4078, bn: 'গুলশান' },
  'banani': { lat: 23.7937, lng: 90.4066, bn: 'বনানী' },
  'mohammadpur': { lat: 23.7658, lng: 90.3584, bn: 'মোহাম্মদপুর' },
  'mohakhali': { lat: 23.7776, lng: 90.4054, bn: 'মহাখালী' },
  'shahbag': { lat: 23.7388, lng: 90.3956, bn: 'শাহবাগ' },
  'chawkbazar': { lat: 23.7155, lng: 90.3976, bn: 'চকবাজার' },
  'old dhaka': { lat: 23.7104, lng: 90.4074, bn: 'পুরান ঢাকা' },
  'sadarghat': { lat: 23.7069, lng: 90.4106, bn: 'সদরঘাট' },
  'gulistan': { lat: 23.7259, lng: 90.4114, bn: 'গুলিস্তান' },
  'paltan': { lat: 23.7339, lng: 90.4102, bn: 'পল্টন' },
  'kamalapur': { lat: 23.7316, lng: 90.4262, bn: 'কমলাপুর' },
  'jatrabari': { lat: 23.7109, lng: 90.4349, bn: 'যাত্রাবাড়ী' },
  'gabtoli': { lat: 23.7842, lng: 90.3475, bn: 'গাবতলী' },
  'airport': { lat: 23.8510, lng: 90.4005, bn: 'বিমানবন্দর' },
  'bimanbandar': { lat: 23.8510, lng: 90.4005, bn: 'শাহজালাল বিমানবন্দর' },
  'rampura': { lat: 23.7612, lng: 90.4208, bn: 'রামপুরা' },
  'badda': { lat: 23.7806, lng: 90.4267, bn: 'বাড্ডা' },
  'bashundhara': { lat: 23.8191, lng: 90.4526, bn: 'বসুন্ধরা' },
  'khilkhet': { lat: 23.8298, lng: 90.4226, bn: 'খিলক্ষেত' },
  'shyamoli': { lat: 23.7725, lng: 90.3653, bn: 'শ্যামলী' },
  'tejgaon': { lat: 23.7598, lng: 90.3948, bn: 'তেজগাঁও' },
  'karwan bazar': { lat: 23.7510, lng: 90.3935, bn: 'কারওয়ান বাজার' },
  'science lab': { lat: 23.7389, lng: 90.3834, bn: 'সায়েন্স ল্যাব' },
  'new market': { lat: 23.7335, lng: 90.3838, bn: 'নিউ মার্কেট' },
  'azimpur': { lat: 23.7279, lng: 90.3854, bn: 'আজিমপুর' },
  'banashree': { lat: 23.7619, lng: 90.4331, bn: 'বনশ্রী' },
  'khilgaon': { lat: 23.7532, lng: 90.4268, bn: 'খিলগাঁও' },
  'mugda': { lat: 23.7322, lng: 90.4317, bn: 'মুগদা' },
  'savar': { lat: 23.8583, lng: 90.2667, bn: 'সাভার' },
  'tongi': { lat: 23.8975, lng: 90.4024, bn: 'টঙ্গী' },

  // Other Major Districts & Hubs
  'agrabad': { lat: 22.3259, lng: 91.8124, bn: 'আগ্রাবাদ, চট্টগ্রাম' },
  'gec': { lat: 22.3592, lng: 91.8219, bn: 'জিইসি মোড়, চট্টগ্রাম' },
  'chittagong': { lat: 22.3569, lng: 91.7832, bn: 'চট্টগ্রাম' },
  'chattogram': { lat: 22.3569, lng: 91.7832, bn: 'চট্টগ্রাম' },
  "cox's bazar": { lat: 21.4272, lng: 92.0058, bn: 'কক্সবাজার' },
  'sylhet': { lat: 24.8949, lng: 91.8687, bn: 'সিলেট' },
  'rajshahi': { lat: 24.3636, lng: 88.6241, bn: 'রাজশাহী' },
  'khulna': { lat: 22.8456, lng: 89.5403, bn: 'খুলনা' },
  'barishal': { lat: 22.7010, lng: 90.3535, bn: 'বরিশাল' },
  'rangpur': { lat: 25.7439, lng: 89.2752, bn: 'রংপুর' },
  'mymensingh': { lat: 24.7471, lng: 90.4203, bn: 'ময়মনসিংহ' },
  'comilla': { lat: 23.4607, lng: 91.1809, bn: 'কুমিল্লা' },
  'cumilla': { lat: 23.4607, lng: 91.1809, bn: 'কুমিল্লা' },
  'gazipur': { lat: 23.9999, lng: 90.4203, bn: 'গাজীপুর' },
  'narayanganj': { lat: 23.6238, lng: 90.5000, bn: 'নারায়ণগঞ্জ' },
  'bogura': { lat: 24.8465, lng: 89.3773, bn: 'বগুড়া' },
  'jessore': { lat: 23.1664, lng: 89.2081, bn: 'যশোর' },
  'tangail': { lat: 24.2513, lng: 89.9167, bn: 'টাঙ্গাইল' }
};

// Pre-sorted entries by longest matching key/bn first so "mirpur 10" beats "mirpur"
const SORTED_BD_LOCATIONS = Object.entries(BD_LOCATIONS).sort(
  (a, b) => Math.max(b[0].length, b[1].bn.length) - Math.max(a[0].length, a[1].bn.length)
);

// In-memory caches for fast repeated queries
const geocodeCache = new Map<string, { coords: GeoPoint; displayName: string }>();
const reverseCache = new Map<string, string>();
const routeCache = new Map<string, { data: RouteData; ts: number }>();
const ROUTE_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Reverse geocodes lat/lng to a clean Bangla/readable location name
 */
export async function reverseGeocodeLocation(lat: number, lng: number): Promise<string> {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  const cached = reverseCache.get(key);
  if (cached) return cached;

  // Check nearest known BD hub within 1.5km for instant resolution
  let nearestName = '';
  let minDist = Infinity;
  for (const [, val] of SORTED_BD_LOCATIONS) {
    const dist = haversineDistanceMeters({ lat, lng }, { lat: val.lat, lng: val.lng });
    if (dist < minDist) {
      minDist = dist;
      nearestName = val.bn;
    }
  }
  if (minDist <= 1200 && nearestName) {
    const label = minDist <= 350 ? nearestName : `${nearestName} সংলগ্ন এলাকা`;
    reverseCache.set(key, label);
    return label;
  }

  // Try OSM Nominatim reverse geocoding (1.8s fast timeout)
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=bn,en`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ProblemGraph-CivicApp/1.0' },
      signal: AbortSignal.timeout(1800),
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data?.address;
      const parts = [
        addr?.road || addr?.neighbourhood || addr?.suburb,
        addr?.city_district || addr?.town || addr?.city || addr?.district
      ].filter(Boolean);
      const display = parts.length > 0 ? parts.slice(0, 2).join(', ') : (data?.display_name?.split(',').slice(0, 2).join(', ') || '');
      if (display) {
        reverseCache.set(key, display);
        return display;
      }
    }
  } catch {
    // Fallback below
  }

  const fallbackLabel = nearestName && minDist <= 5000
    ? `${nearestName} এলাকা (${lat.toFixed(4)}, ${lng.toFixed(4)})`
    : `নির্বাচিত অবস্থান (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  reverseCache.set(key, fallbackLabel);
  return fallbackLabel;
}

/**
 * Resolves query text or coords to GeoPoint
 */
export async function resolveLocation(
  input: string | { lat: number; lng: number; label?: string }
): Promise<{ coords: GeoPoint; displayName: string }> {
  if (typeof input === 'object' && input !== null && typeof input.lat === 'number' && typeof input.lng === 'number') {
    const coords = { lat: input.lat, lng: input.lng };
    const cleanLabel = input.label?.trim();
    const displayName = cleanLabel && !cleanLabel.startsWith('স্থানাঙ্ক')
      ? cleanLabel
      : await reverseGeocodeLocation(coords.lat, coords.lng);
    return { coords, displayName };
  }

  const rawText = (input || '').toString().trim();

  // Support direct "lat, lng" string input
  const coordMatch = rawText.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      const displayName = await reverseGeocodeLocation(lat, lng);
      return { coords: { lat, lng }, displayName };
    }
  }

  const query = rawText.toLowerCase();

  // Check in-memory geocode cache
  const cached = geocodeCache.get(query);
  if (cached) return cached;

  // Check exact / longest match in BD_LOCATIONS cache
  for (const [key, val] of SORTED_BD_LOCATIONS) {
    const bnLower = val.bn.toLowerCase();
    if (query === key || query === bnLower || query.includes(key) || query.includes(bnLower)) {
      const resolved = {
        coords: { lat: val.lat, lng: val.lng },
        displayName: val.bn
      };
      geocodeCache.set(query, resolved);
      return resolved;
    }
  }

  // Try OpenStreetMap Nominatim geocoding with fast timeout (2s)
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(rawText + ', Bangladesh')}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ProblemGraph-CivicApp/1.0' },
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const resolved = {
          coords: { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) },
          displayName: data[0].display_name.split(',')[0] || rawText
        };
        geocodeCache.set(query, resolved);
        return resolved;
      }
    }
  } catch (e) {
    // Graceful fallback to default center (Dhaka)
  }

  // Fallback defaults to Dhaka center
  return {
    coords: { lat: 23.7808, lng: 90.4054 },
    displayName: rawText || 'ঢাকা'
  };
}

/**
 * Calculates Great-circle distance between two points in meters
 */
export function haversineDistanceMeters(p1: GeoPoint, p2: GeoPoint): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (p2.lat - p1.lat) * (Math.PI / 180);
  const dLng = (p2.lng - p1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat * (Math.PI / 180)) *
      Math.cos(p2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate distance from point P to line segment AB in meters
 */
export function distancePointToSegment(p: GeoPoint, a: GeoPoint, b: GeoPoint): number {
  const l2 = haversineDistanceMeters(a, b);
  if (l2 === 0) return haversineDistanceMeters(p, a);

  const cosLat = Math.cos((p.lat * Math.PI) / 180);
  const px = (p.lng - a.lng) * cosLat;
  const py = p.lat - a.lat;
  const bx = (b.lng - a.lng) * cosLat;
  const by = b.lat - a.lat;

  const dot = px * bx + py * by;
  const lenSq = bx * bx + by * by;
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;

  let xx: number, yy: number;
  if (param < 0) {
    xx = a.lng;
    yy = a.lat;
  } else if (param > 1) {
    xx = b.lng;
    yy = b.lat;
  } else {
    xx = a.lng + (param * bx) / cosLat;
    yy = a.lat + param * by;
  }

  return haversineDistanceMeters(p, { lat: yy, lng: xx });
}

/**
 * Calculates route polyline using OSRM (with cache & fast timeout) or realistic fallback interpolation
 */
export async function getRoute(
  originCoords: GeoPoint,
  destCoords: GeoPoint,
  originName: string,
  destName: string
): Promise<RouteData> {
  const cacheKey = `${originCoords.lat.toFixed(4)},${originCoords.lng.toFixed(4)}->${destCoords.lat.toFixed(4)},${destCoords.lng.toFixed(4)}`;
  const cached = routeCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < ROUTE_CACHE_TTL_MS) {
    return {
      ...cached.data,
      origin: originName,
      destination: destName,
      summary: `${originName} থেকে ${destName} পর্যন্ত সড়ক রুট`
    };
  }

  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}?overview=simplified&geometries=geojson`;

  try {
    const res = await fetch(osrmUrl, {
      signal: AbortSignal.timeout(2500),
      headers: { 'User-Agent': 'ProblemGraph-CivicApp/1.0' }
    });

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates: [number, number][] = route.geometry.coordinates;
        const polyline: GeoPoint[] = coordinates.map(c => ({ lng: c[0], lat: c[1] }));
        const distanceKm = +(route.distance / 1000).toFixed(1);
        const durationMinutes = Math.max(5, Math.round(route.duration / 60));

        const result: RouteData = {
          origin: originName,
          destination: destName,
          originCoords,
          destinationCoords: destCoords,
          distanceKm,
          durationMinutes,
          polyline,
          summary: `${originName} থেকে ${destName} পর্যন্ত সড়ক রুট`
        };

        routeCache.set(cacheKey, { data: result, ts: Date.now() });
        return result;
      }
    }
  } catch (e) {
    console.warn('OSRM route fetch fast fallback used:', (e as any)?.message || e);
  }

  // Fallback: interpolate points between origin and destination with slight curve
  const steps = 25;
  const polyline: GeoPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = originCoords.lat + (destCoords.lat - originCoords.lat) * t + Math.sin(t * Math.PI) * 0.005;
    const lng = originCoords.lng + (destCoords.lng - originCoords.lng) * t - Math.sin(t * Math.PI) * 0.004;
    polyline.push({ lat, lng });
  }

  const directDist = haversineDistanceMeters(originCoords, destCoords);
  const distanceKm = +(directDist * 1.3 / 1000).toFixed(1);
  const durationMinutes = Math.max(10, Math.round(distanceKm * 3.5));

  return {
    origin: originName,
    destination: destName,
    originCoords,
    destinationCoords: destCoords,
    distanceKm,
    durationMinutes,
    polyline,
    summary: `${originName} হতে ${destName} পর্যন্ত সংযোগ সড়ক`
  };
}

/**
 * Filter problems that fall within corridor buffer of route polyline
 */
export function findReportsInRouteCorridor(
  reports: any[],
  polyline: GeoPoint[],
  corridorRadiusMeters: number = 800
) {
  const matched: Array<any & { distanceFromRouteMeters: number }> = [];

  for (const report of reports) {
    if (!report.latitude || !report.longitude) continue;
    const reportPoint: GeoPoint = { lat: report.latitude, lng: report.longitude };

    let minDistance = Infinity;

    for (let i = 0; i < polyline.length - 1; i++) {
      const p1 = polyline[i];
      const p2 = polyline[i + 1];
      const dist = distancePointToSegment(reportPoint, p1, p2);
      if (dist < minDistance) {
        minDistance = dist;
      }
    }

    if (minDistance <= corridorRadiusMeters) {
      matched.push({
        ...report,
        distanceFromRouteMeters: Math.round(minDistance)
      });
    }
  }

  return matched.sort((a, b) => a.distanceFromRouteMeters - b.distanceFromRouteMeters);
}
