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
  // Dhaka Major Hubs
  'mirpur': { lat: 23.8069, lng: 90.3687, bn: 'মিরপুর' },
  'mirpur 10': { lat: 23.8071, lng: 90.3685, bn: 'মিরপুর ১০' },
  'farmgate': { lat: 23.7570, lng: 90.3905, bn: 'ফার্মগেট' },
  'dhanmondi': { lat: 23.7465, lng: 90.3760, bn: 'ধানমন্ডি' },
  'uttara': { lat: 23.8759, lng: 90.3795, bn: 'উত্তরা' },
  'motijheel': { lat: 23.7330, lng: 90.4172, bn: 'মতিঝিল' },
  'gulshan': { lat: 23.7925, lng: 90.4078, bn: 'গুলশান' },
  'banani': { lat: 23.7937, lng: 90.4066, bn: 'বনানী' },
  'mohammadpur': { lat: 23.7658, lng: 90.3584, bn: 'মোহাম্মদপুর' },
  'mohakhali': { lat: 23.7776, lng: 90.4054, bn: 'মহাখালী' },
  'shahbag': { lat: 23.7388, lng: 90.3956, bn: 'শাহবাগ' },
  'old dhaka': { lat: 23.7104, lng: 90.4074, bn: 'পুরান ঢাকা' },
  'jatrabari': { lat: 23.7109, lng: 90.4349, bn: 'যাত্রাবাড়ী' },
  'gabtoli': { lat: 23.7842, lng: 90.3475, bn: 'গাবতলী' },
  'airport': { lat: 23.8510, lng: 90.4005, bn: 'শাহজালাল বিমানবন্দর' },
  'rampura': { lat: 23.7612, lng: 90.4208, bn: 'রামপুরা' },
  'badda': { lat: 23.7806, lng: 90.4267, bn: 'বাড্ডা' },
  'khilkhet': { lat: 23.8298, lng: 90.4226, bn: 'খিলক্ষেত' },
  'shyamoli': { lat: 23.7725, lng: 90.3653, bn: 'শ্যামলী' },

  // Other Major Districts
  'chittagong': { lat: 22.3569, lng: 91.7832, bn: 'চট্টগ্রাম' },
  'agrabad': { lat: 22.3259, lng: 91.8124, bn: 'আগ্রাবাদ, চট্টগ্রাম' },
  'gec': { lat: 22.3592, lng: 91.8219, bn: 'জিইসি মোড়, চট্টগ্রাম' },
  'sylhet': { lat: 24.8949, lng: 91.8687, bn: 'সিলেট' },
  'rajshahi': { lat: 24.3636, lng: 88.6241, bn: 'রাজশাহী' },
  'khulna': { lat: 22.8456, lng: 89.5403, bn: 'খুলনা' },
  'barishal': { lat: 22.7010, lng: 90.3535, bn: 'বরিশাল' },
  'rangpur': { lat: 25.7439, lng: 89.2752, bn: 'রংপুর' },
  'mymensingh': { lat: 24.7471, lng: 90.4203, bn: 'ময়মনসিংহ' },
  'comilla': { lat: 23.4607, lng: 91.1809, bn: 'কুমিল্লা' },
  'gazipur': { lat: 23.9999, lng: 90.4203, bn: 'গাজীপুর' },
  'narayanganj': { lat: 23.6238, lng: 90.5000, bn: 'নারায়ণগঞ্জ' }
};

/**
 * Resolves query text or coords to GeoPoint
 */
export async function resolveLocation(input: string | { lat: number; lng: number }): Promise<{ coords: GeoPoint; displayName: string }> {
  if (typeof input === 'object' && input.lat && input.lng) {
    return {
      coords: { lat: input.lat, lng: input.lng },
      displayName: `স্থানাঙ্ক (${input.lat.toFixed(4)}, ${input.lng.toFixed(4)})`
    };
  }

  const query = (input as string).toLowerCase().trim();

  // Check direct BD_LOCATIONS cache
  for (const [key, val] of Object.entries(BD_LOCATIONS)) {
    if (query.includes(key) || query.includes(val.bn.toLowerCase())) {
      return {
        coords: { lat: val.lat, lng: val.lng },
        displayName: val.bn
      };
    }
  }

  // Try OpenStreetMap Nominatim geocoding with timeout
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Bangladesh')}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ProblemGraph-CivicApp/1.0' },
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          coords: { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) },
          displayName: data[0].display_name.split(',')[0] || input.toString()
        };
      }
    }
  } catch (e) {
    // Graceful fallback to default center (Dhaka)
  }

  // Fallback defaults to Mirpur 10 or Farmgate
  return {
    coords: { lat: 23.8071, lng: 90.3685 },
    displayName: input.toString() || 'ঢাকা'
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

  // Approximate flat-earth projection for small distance
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
 * Calculates route polyline using OSRM or fallback interpolation
 */
export async function getRoute(originCoords: GeoPoint, destCoords: GeoPoint, originName: string, destName: string): Promise<RouteData> {
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(osrmUrl, {
      signal: AbortSignal.timeout(4000),
      headers: { 'User-Agent': 'ProblemGraph-CivicApp/1.0' }
    });

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates: [number, number][] = route.geometry.coordinates;
        const polyline: GeoPoint[] = coordinates.map(c => ({ lng: c[0], lat: c[1] }));
        const distanceKm = +(route.distance / 1000).toFixed(1);
        const durationMinutes = Math.round(route.duration / 60);

        return {
          origin: originName,
          destination: destName,
          originCoords,
          destinationCoords: destCoords,
          distanceKm,
          durationMinutes,
          polyline,
          summary: `${originName} থেকে ${destName} পর্যন্ত সড়ক রুট`
        };
      }
    }
  } catch (e) {
    console.warn('OSRM route fetch failed, using realistic geographic interpolation:', e);
  }

  // Fallback: interpolate points between origin and destination with slight curve
  const steps = 25;
  const polyline: GeoPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // create slight realistic curve
    const lat = originCoords.lat + (destCoords.lat - originCoords.lat) * t + Math.sin(t * Math.PI) * 0.005;
    const lng = originCoords.lng + (destCoords.lng - originCoords.lng) * t - Math.sin(t * Math.PI) * 0.004;
    polyline.push({ lat, lng });
  }

  const directDist = haversineDistanceMeters(originCoords, destCoords);
  const distanceKm = +(directDist * 1.3 / 1000).toFixed(1); // 30% road winding factor
  const durationMinutes = Math.max(10, Math.round(distanceKm * 3.5)); // average 20-30 km/h in BD urban/suburban

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

  // Sort by distance from route
  return matched.sort((a, b) => a.distanceFromRouteMeters - b.distanceFromRouteMeters);
}
