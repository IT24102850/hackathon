import type { SafeCentre, CentreOccupancyInfo } from "@/lib/types";

/**
 * FR-3.1: Registered Safe Evacuation Centres Dataset
 * 20 centres across 10 vulnerable districts (exceeds min 16 centres / 8 districts).
 * Attributes: name, type, town, district, phone number, capacity, occupancy.
 */
export const SAFE_CENTRES: SafeCentre[] = [
  {
    id: "kal-01",
    name: "Kalutara Vidyalaya National Relief Shelter",
    type: "School",
    town: "Kalutara North",
    district: "Kalutara",
    phone: "+94 34 222 2244",
    capacity: 450,
    occupancy: 380,
    riverBasin: "Kalu Ganga"
  },
  {
    id: "kal-02",
    name: "Nagoda Community Disaster Centre",
    type: "Community Center",
    town: "Nagoda",
    district: "Kalutara",
    phone: "+94 34 223 1188",
    capacity: 200,
    occupancy: 200, // 100% Full for testing FR-3.2, FR-3.3, FR-3.6
    riverBasin: "Kalu Ganga"
  },
  {
    id: "rat-01",
    name: "Ferguson High School Evacuation Shelter",
    type: "School",
    town: "Ratnapura Central",
    district: "Ratnapura",
    phone: "+94 45 222 2315",
    capacity: 500,
    occupancy: 320,
    riverBasin: "Kalu Ganga"
  },
  {
    id: "rat-02",
    name: "Kuruwita Town Hall Safe Haven",
    type: "Municipal Hall",
    town: "Kuruwita",
    district: "Ratnapura",
    phone: "+94 45 226 2110",
    capacity: 300,
    occupancy: 150,
    riverBasin: "Kalu Ganga"
  },
  {
    id: "rat-03",
    name: "Nivithigala Pradeshiya Sabha Relief Hall",
    type: "Community Center",
    town: "Nivithigala",
    district: "Ratnapura",
    phone: "+94 45 227 9400",
    capacity: 250,
    occupancy: 250, // 100% Full
    riverBasin: "Kalu Ganga"
  },
  {
    id: "col-01",
    name: "Kaduwela Mahaweli Cultural Center",
    type: "Community Center",
    town: "Kaduwela",
    district: "Colombo",
    phone: "+94 11 253 6780",
    capacity: 350,
    occupancy: 290,
    riverBasin: "Kelani Ganga"
  },
  {
    id: "col-02",
    name: "Kolonnawa Balika Vidyalaya Shelter",
    type: "School",
    town: "Kolonnawa",
    district: "Colombo",
    phone: "+94 11 257 2341",
    capacity: 400,
    occupancy: 400, // 100% Full
    riverBasin: "Kelani Ganga"
  },
  {
    id: "col-03",
    name: "Wellampitiya Youth Vocational Center",
    type: "Youth Center",
    town: "Wellampitiya",
    district: "Colombo",
    phone: "+94 11 254 8899",
    capacity: 220,
    occupancy: 140,
    riverBasin: "Kelani Ganga"
  },
  {
    id: "gam-01",
    name: "Biyagama Central College Emergency Camp",
    type: "School",
    town: "Biyagama",
    district: "Gampaha",
    phone: "+94 11 248 8122",
    capacity: 380,
    occupancy: 210,
    riverBasin: "Kelani Ganga"
  },
  {
    id: "gam-02",
    name: "Kelaniya Raja Maha Vihara Pilgrim Rest",
    type: "Religious Shelter",
    town: "Kelaniya",
    district: "Gampaha",
    phone: "+94 11 291 1255",
    capacity: 600,
    occupancy: 410,
    riverBasin: "Kelani Ganga"
  },
  {
    id: "gal-01",
    name: "Galle Municipal Indoor Stadium Complex",
    type: "Stadium",
    town: "Galle Fort",
    district: "Galle",
    phone: "+94 91 223 4567",
    capacity: 750,
    occupancy: 490,
    riverBasin: "Gin Ganga"
  },
  {
    id: "gal-02",
    name: "Baddegama Central College Shelter",
    type: "School",
    town: "Baddegama",
    district: "Galle",
    phone: "+94 91 229 2340",
    capacity: 320,
    occupancy: 320, // 100% Full
    riverBasin: "Gin Ganga"
  },
  {
    id: "mat-01",
    name: "St. Thomas' College Flood Evacuation Hall",
    type: "School",
    town: "Matara Town",
    district: "Matara",
    phone: "+94 41 222 2580",
    capacity: 500,
    occupancy: 275,
    riverBasin: "Nilwala Ganga"
  },
  {
    id: "mat-02",
    name: "Thihagoda Agrarian Service Center",
    type: "Community Center",
    town: "Thihagoda",
    district: "Matara",
    phone: "+94 41 224 5120",
    capacity: 180,
    occupancy: 95,
    riverBasin: "Nilwala Ganga"
  },
  {
    id: "keg-01",
    name: "Kegalu Vidyalaya Disaster Relief Base",
    type: "School",
    town: "Kegalle Town",
    district: "Kegalle",
    phone: "+94 35 222 2355",
    capacity: 420,
    occupancy: 290,
    riverBasin: "Kelani Ganga"
  },
  {
    id: "keg-02",
    name: "Aranayaka Community Landslide Shelter",
    type: "Community Center",
    town: "Aranayaka",
    district: "Kegalle",
    phone: "+94 35 225 8100",
    capacity: 260,
    occupancy: 180,
    riverBasin: "Kelani Ganga"
  },
  {
    id: "kur-01",
    name: "Kurunegala Town Hall Assembly Auditorium",
    type: "Municipal Hall",
    town: "Kurunegala City",
    district: "Kurunegala",
    phone: "+94 37 222 2275",
    capacity: 650,
    occupancy: 380,
    riverBasin: "Deduru Oya"
  },
  {
    id: "kur-02",
    name: "Ibbagamuwa Central College Hall",
    type: "School",
    town: "Ibbagamuwa",
    district: "Kurunegala",
    phone: "+94 37 225 9411",
    capacity: 350,
    occupancy: 350, // 100% Full
    riverBasin: "Deduru Oya"
  },
  {
    id: "kan-01",
    name: "Peradeniya Community Recreation Hall",
    type: "Community Center",
    town: "Peradeniya",
    district: "Kandy",
    phone: "+94 81 238 8200",
    capacity: 300,
    occupancy: 120,
    riverBasin: "Mahaweli Ganga"
  },
  {
    id: "ham-01",
    name: "Tangalle Municipal Cultural Center",
    type: "Community Center",
    town: "Tangalle",
    district: "Hambantota",
    phone: "+94 47 224 0244",
    capacity: 280,
    occupancy: 110,
    riverBasin: "Walawe Ganga"
  }
];

/**
 * FR-3.2: Calculate remaining space
 * Capacity minus occupancy, never below zero.
 */
export function calculatePlacesFree(capacity: number, occupancy: number): number {
  return Math.max(0, capacity - occupancy);
}

/**
 * FR-3.2: Label a full centre as "Full"
 */
export function isCentreFull(capacity: number, occupancy: number): boolean {
  return calculatePlacesFree(capacity, occupancy) === 0;
}

/**
 * FR-3.3: Occupancy percentage (capped at 100)
 */
export function getOccupancyPercentage(capacity: number, occupancy: number): number {
  if (!capacity || capacity <= 0) return 0;
  const pct = Math.round((occupancy / capacity) * 100);
  return Math.min(100, Math.max(0, pct));
}

/**
 * FR-3.3: Visual occupancy metadata and styling
 * Coloured differently at 100% (crimson/red vs amber vs cyan/emerald).
 */
export function getOccupancyInfo(centre: SafeCentre): CentreOccupancyInfo {
  const placesFree = calculatePlacesFree(centre.capacity, centre.occupancy);
  const isFull = placesFree === 0;
  const percentage = getOccupancyPercentage(centre.capacity, centre.occupancy);

  let statusLabel = `${percentage}% Occupied`;
  let barColorClass = "bg-gradient-to-r from-emerald-400 to-cyan-400";

  if (percentage >= 100) {
    statusLabel = "Full (100%)";
    barColorClass = "bg-gradient-to-r from-rose-500 to-red-600 shadow-[0_0_12px_rgba(239,68,68,0.6)]";
  } else if (percentage >= 80) {
    statusLabel = `${percentage}% Occupied (High)`;
    barColorClass = "bg-gradient-to-r from-amber-400 to-orange-500";
  } else if (percentage >= 50) {
    statusLabel = `${percentage}% Occupied (Moderate)`;
    barColorClass = "bg-gradient-to-r from-cyan-400 to-blue-500";
  }

  return {
    placesFree,
    isFull,
    percentage,
    statusLabel,
    barColorClass
  };
}

/**
 * FR-3.5: Dynamic unique districts list for select filter
 */
export function getUniqueDistricts(centres: SafeCentre[] = SAFE_CENTRES): string[] {
  return Array.from(new Set(centres.map((c) => c.district))).sort();
}

/**
 * FR-3.4, FR-3.5, FR-3.6: Multi-filter combination
 * Search (substring on name, town, type) + District filter + Space-only filter.
 */
export function filterSafeCentres(
  centres: SafeCentre[] = SAFE_CENTRES,
  searchQuery: string = "",
  selectedDistrict: string = "ALL",
  spaceOnly: boolean = false
): SafeCentre[] {
  const query = searchQuery.trim().toLowerCase();

  return centres.filter((centre) => {
    // FR-3.4 Search
    const matchesSearch =
      !query ||
      centre.name.toLowerCase().includes(query) ||
      centre.town.toLowerCase().includes(query) ||
      centre.type.toLowerCase().includes(query);

    // FR-3.5 District
    const matchesDistrict =
      selectedDistrict === "ALL" || centre.district === selectedDistrict;

    // FR-3.6 Space only
    const placesFree = calculatePlacesFree(centre.capacity, centre.occupancy);
    const matchesSpace = !spaceOnly || placesFree > 0;

    return matchesSearch && matchesDistrict && matchesSpace;
  });
}

/**
 * FR-3.7: Summarise availability
 */
export function summariseAvailability(centres: SafeCentre[]) {
  const matchingCount = centres.length;
  const totalPlacesFree = centres.reduce(
    (acc, c) => acc + calculatePlacesFree(c.capacity, c.occupancy),
    0
  );
  const totalCapacity = centres.reduce((acc, c) => acc + c.capacity, 0);

  return {
    matchingCount,
    totalPlacesFree,
    totalCapacity
  };
}
