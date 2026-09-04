import type { District } from "@/lib/types";

/**
 * All 25 administrative districts of Sri Lanka.
 *
 * Coordinates are the district capital, which is what we send to Open-Meteo.
 * `vulnerability` is our own 0-1 weighting of standing flood and landslide
 * exposure, set from three things that do not change day to day:
 *
 *   - terrain: steep, landslide-prone hill country scores higher than the
 *     dry-zone plains (Nuwara Eliya, Kegalle, Ratnapura, Badulla);
 *   - drainage: dense urban catchments that flood before the river does
 *     (Colombo, Gampaha);
 *   - history: districts repeatedly hit in past events, notably the Kalu and
 *     Kelani basin floods and the 2016 Aranayake landslide in Kegalle.
 *
 * Only the rainfall half of the score moves between refreshes. This value is
 * the reason a dry Ratnapura still ranks above a dry Vavuniya.
 */
export const DISTRICTS: District[] = [
  // Western
  { id: "colombo", name: "Colombo", province: "Western", basin: "Kelani Ganga", latitude: 6.9271, longitude: 79.8612, vulnerability: 0.88 },
  { id: "gampaha", name: "Gampaha", province: "Western", basin: "Kelani Ganga", latitude: 7.0917, longitude: 79.9997, vulnerability: 0.82 },
  { id: "kalutara", name: "Kalutara", province: "Western", basin: "Kalu Ganga", latitude: 6.5854, longitude: 79.9607, vulnerability: 0.86 },

  // Central
  { id: "kandy", name: "Kandy", province: "Central", basin: "Mahaweli Ganga", latitude: 7.2906, longitude: 80.6337, vulnerability: 0.74 },
  { id: "matale", name: "Matale", province: "Central", basin: "Mahaweli Ganga", latitude: 7.4675, longitude: 80.6234, vulnerability: 0.66 },
  { id: "nuwara-eliya", name: "Nuwara Eliya", province: "Central", basin: "Mahaweli Ganga", latitude: 6.9497, longitude: 80.7891, vulnerability: 0.9 },

  // Southern
  { id: "galle", name: "Galle", province: "Southern", basin: "Gin Ganga", latitude: 6.0535, longitude: 80.221, vulnerability: 0.78 },
  { id: "matara", name: "Matara", province: "Southern", basin: "Nilwala Ganga", latitude: 5.9549, longitude: 80.555, vulnerability: 0.84 },
  { id: "hambantota", name: "Hambantota", province: "Southern", basin: "Walawe Ganga", latitude: 6.1241, longitude: 81.1185, vulnerability: 0.52 },

  // Northern
  { id: "jaffna", name: "Jaffna", province: "Northern", basin: "Thondamanaru Lagoon", latitude: 9.6615, longitude: 80.0255, vulnerability: 0.48 },
  { id: "kilinochchi", name: "Kilinochchi", province: "Northern", basin: "Kanakarayan Aru", latitude: 9.3961, longitude: 80.3982, vulnerability: 0.44 },
  { id: "mannar", name: "Mannar", province: "Northern", basin: "Aruvi Aru", latitude: 8.981, longitude: 79.9044, vulnerability: 0.46 },
  { id: "vavuniya", name: "Vavuniya", province: "Northern", basin: "Pali Aru", latitude: 8.7514, longitude: 80.4971, vulnerability: 0.42 },
  { id: "mullaitivu", name: "Mullaitivu", province: "Northern", basin: "Per Aru", latitude: 9.2671, longitude: 80.8142, vulnerability: 0.5 },

  // Eastern
  { id: "batticaloa", name: "Batticaloa", province: "Eastern", basin: "Maduru Oya", latitude: 7.717, longitude: 81.7, vulnerability: 0.72 },
  { id: "ampara", name: "Ampara", province: "Eastern", basin: "Gal Oya", latitude: 7.2914, longitude: 81.6725, vulnerability: 0.62 },
  { id: "trincomalee", name: "Trincomalee", province: "Eastern", basin: "Mahaweli Ganga", latitude: 8.5874, longitude: 81.2152, vulnerability: 0.64 },

  // North Western
  { id: "kurunegala", name: "Kurunegala", province: "North Western", basin: "Deduru Oya", latitude: 7.4863, longitude: 80.3647, vulnerability: 0.58 },
  { id: "puttalam", name: "Puttalam", province: "North Western", basin: "Kala Oya", latitude: 8.0362, longitude: 79.8283, vulnerability: 0.54 },

  // North Central
  { id: "anuradhapura", name: "Anuradhapura", province: "North Central", basin: "Malwathu Oya", latitude: 8.3114, longitude: 80.4037, vulnerability: 0.5 },
  { id: "polonnaruwa", name: "Polonnaruwa", province: "North Central", basin: "Mahaweli Ganga", latitude: 7.9403, longitude: 81.0188, vulnerability: 0.56 },

  // Uva
  { id: "badulla", name: "Badulla", province: "Uva", basin: "Mahaweli Ganga", latitude: 6.9934, longitude: 81.055, vulnerability: 0.8 },
  { id: "monaragala", name: "Monaragala", province: "Uva", basin: "Kumbukkan Oya", latitude: 6.8728, longitude: 81.351, vulnerability: 0.48 },

  // Sabaragamuwa
  { id: "ratnapura", name: "Ratnapura", province: "Sabaragamuwa", basin: "Kalu Ganga", latitude: 6.7056, longitude: 80.3847, vulnerability: 0.92 },
  { id: "kegalle", name: "Kegalle", province: "Sabaragamuwa", basin: "Kelani Ganga", latitude: 7.2513, longitude: 80.3464, vulnerability: 0.87 },
];

/** Total districts monitored. Used for the "showing X of N" counter. */
export const DISTRICT_COUNT = DISTRICTS.length;
