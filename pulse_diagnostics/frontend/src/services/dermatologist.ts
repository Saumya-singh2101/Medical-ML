// services/dermatologist.ts
//
// Finds a nearby dermatologist/skin clinic using OpenStreetMap's free Overpass API
// (no API key required). This is best-effort — OSM data coverage varies by area,
// so we always fall back gracefully if nothing is found nearby.

export interface DermatologistResult {
  name: string;
  phone: string | null;
  address: string | null;
  distanceKm: number | null;
  source: 'osm' | 'fallback';
  mapsUrl?: string | null;
}

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function findNearbyDermatologist(
  lat: number,
  lng: number,
  radiusMeters = 25000 // widened from 8km — OSM tagging for specialty clinics is sparse outside big metros
): Promise<DermatologistResult | null> {
  // Tier 1: anything explicitly tagged as a dermatology specialty (rare outside major cities).
  // Tier 2: any doctor/clinic/hospital whose NAME mentions skin/derma (much more common).
  // Tier 3: any general hospital/clinic nearby, so the report is never completely empty.
  const query = `
    [out:json][timeout:20];
    (
      node["healthcare:speciality"~"dermatology",i](around:${radiusMeters},${lat},${lng});
      way["healthcare:speciality"~"dermatology",i](around:${radiusMeters},${lat},${lng});
      node["name"~"derma|skin",i]["amenity"~"doctors|clinic|hospital"](around:${radiusMeters},${lat},${lng});
      way["name"~"derma|skin",i]["amenity"~"doctors|clinic|hospital"](around:${radiusMeters},${lat},${lng});
      node["amenity"~"doctors|clinic|hospital"](around:${radiusMeters},${lat},${lng});
      way["amenity"~"doctors|clinic|hospital"](around:${radiusMeters},${lat},${lng});
    );
    out center tags;
  `;

  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (!res.ok) throw new Error('Overpass request failed');
    const data = await res.json();
    const elements: any[] = data?.elements || [];
    if (!elements.length) return null;

    const ranked = elements
      .map((el) => {
        const tags = el.tags || {};
        const elLat = el.lat ?? el.center?.lat;
        const elLon = el.lon ?? el.center?.lon;
        if (elLat == null || elLon == null) return null;
        const distanceKm = haversineKm(lat, lng, elLat, elLon);
        const addrParts = [
          tags['addr:housenumber'],
          tags['addr:street'],
          tags['addr:suburb'],
          tags['addr:city'],
        ].filter(Boolean);

        const nameMatchesSkin = /derma|skin/i.test(tags.name || '');
        const isSpecialtyTagged = /dermatology/i.test(tags['healthcare:speciality'] || '');

        return {
          name: tags.name || 'Unnamed Clinic',
          phone: tags.phone || tags['contact:phone'] || null,
          address: addrParts.length ? addrParts.join(', ') : tags['addr:full'] || null,
          distanceKm,
          source: 'osm' as const,
          // priority: specialty-tagged > name mentions skin/derma > generic clinic (closest first within each tier)
          _priority: isSpecialtyTagged ? 0 : nameMatchesSkin ? 1 : 2,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => a._priority - b._priority || a.distanceKm - b.distanceKm);

    return ranked[0] || null;
  } catch (err) {
    console.error('Dermatologist lookup failed:', err);
    return null;
  }
}

// Used in the PDF / UI when OSM had no data at all for the area. Always gives the patient
// something actionable — a live Google Maps search centered on their exact coordinates.
export function fallbackDermatologistNote(lat?: number, lng?: number): DermatologistResult {
  const mapsUrl =
    lat != null && lng != null
      ? `https://www.google.com/maps/search/dermatologist/@${lat},${lng},13z`
      : null;
  return {
    name: mapsUrl
      ? 'No exact match in our database — search dermatologists near you on Google Maps'
      : 'No clinic found nearby — please consult a registered dermatologist',
    phone: null,
    address: null,
    distanceKm: null,
    source: 'fallback',
    mapsUrl,
  };
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  });
}
