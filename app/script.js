// script.js — Sri Lanka Flood Warning System (SLFWS)
// Implements FR-3.1 through FR-3.11 interactive logic

// ============================================================================
// FR-3.1: REGISTERED SAFE CENTRES DATASET
// 20 centres across 10 vulnerable districts (exceeds min 16 centres / 8 districts)
// Fields: name, type, town, district, phone, capacity, occupancy
// ============================================================================
const SAFE_CENTRES = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
    id: 4,
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
    id: 5,
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
    id: 6,
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
    id: 7,
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
    id: 8,
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
    id: 9,
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
    id: 10,
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
    id: 11,
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
    id: 12,
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
    id: 13,
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
    id: 14,
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
    id: 15,
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
    id: 16,
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
    id: 17,
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
    id: 18,
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
    id: 19,
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
    id: 20,
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

// ============================================================================
// FR-3.2: CALCULATE REMAINING SPACE
// Places free as capacity minus occupancy, never below zero.
// Full centre labeled as "Full".
// ============================================================================
function calculatePlacesFree(capacity, occupancy) {
  const diff = Number(capacity) - Number(occupancy);
  return Math.max(0, diff);
}

function isCentreFull(capacity, occupancy) {
  return calculatePlacesFree(capacity, occupancy) === 0;
}

// ============================================================================
// FR-3.3: SHOW OCCUPANCY VISUALLY
// Percentage bar, coloured differently at 100 percent.
// ============================================================================
function getOccupancyPercentage(capacity, occupancy) {
  if (!capacity || capacity <= 0) return 0;
  const pct = Math.round((occupancy / capacity) * 100);
  return Math.min(100, Math.max(0, pct));
}

function getOccupancyStatus(percentage) {
  if (percentage >= 100) {
    return {
      className: "status-full",
      barClass: "bar-full",
      label: "Full (100%)",
      isFull: true
    };
  } else if (percentage >= 80) {
    return {
      className: "status-high",
      barClass: "bar-high",
      label: `${percentage}% Occupied (High)`,
      isFull: false
    };
  } else if (percentage >= 50) {
    return {
      className: "status-moderate",
      barClass: "bar-moderate",
      label: `${percentage}% Occupied (Moderate)`,
      isFull: false
    };
  } else {
    return {
      className: "status-low",
      barClass: "bar-low",
      label: `${percentage}% Occupied (Available)`,
      isFull: false
    };
  }
}

// ============================================================================
// DOM ELEMENTS REFERENCE
// ============================================================================
let searchInput = null;
let districtSelect = null;
let spaceOnlyCheckbox = null;
let centresListContainer = null;
let centresSummaryContainer = null;
let navLinks = [];
let trackedSections = [];

// ============================================================================
// FR-3.5: POPULATE DISTRICT DROPDOWN DYNAMICALLY FROM DATA
// ============================================================================
function populateDistrictDropdown() {
  if (!districtSelect) return;

  // Extract unique sorted districts
  const districts = Array.from(new Set(SAFE_CENTRES.map((c) => c.district))).sort();

  districtSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "ALL";
  defaultOption.textContent = "All Districts (" + districts.length + " available)";
  districtSelect.appendChild(defaultOption);

  districts.forEach((district) => {
    const opt = document.createElement("option");
    opt.value = district;
    opt.textContent = district;
    districtSelect.appendChild(opt);
  });
}

// ============================================================================
// FR-3.4, FR-3.5, FR-3.6: FILTER COMBINATIONS
// Case-insensitive search on name, town, or type.
// District filter.
// Space-only checkbox (hides occupancy >= capacity).
// ============================================================================
function filterCentres() {
  const query = (searchInput ? searchInput.value : "").trim().toLowerCase();
  const selectedDistrict = districtSelect ? districtSelect.value : "ALL";
  const spaceOnly = spaceOnlyCheckbox ? spaceOnlyCheckbox.checked : false;

  return SAFE_CENTRES.filter((centre) => {
    // FR-3.4: Substring match on name, town, or type
    const matchesSearch =
      !query ||
      centre.name.toLowerCase().includes(query) ||
      centre.town.toLowerCase().includes(query) ||
      centre.type.toLowerCase().includes(query);

    // FR-3.5: District filter
    const matchesDistrict =
      selectedDistrict === "ALL" || centre.district === selectedDistrict;

    // FR-3.6: Space-only filter (hide full centres)
    const placesFree = calculatePlacesFree(centre.capacity, centre.occupancy);
    const matchesSpace = !spaceOnly || placesFree > 0;

    return matchesSearch && matchesDistrict && matchesSpace;
  });
}

// ============================================================================
// FR-3.1, FR-3.2, FR-3.3, FR-3.7, FR-3.8: RENDER CENTRES LIST & SUMMARY
// ============================================================================
function renderCentres() {
  if (!centresListContainer) return;

  const filtered = filterCentres();

  // FR-3.7: Summarise availability
  const totalFree = filtered.reduce((acc, c) => acc + calculatePlacesFree(c.capacity, c.occupancy), 0);
  const totalCapacity = filtered.reduce((acc, c) => acc + c.capacity, 0);

  if (centresSummaryContainer) {
    centresSummaryContainer.innerHTML = `
      <div class="summary-card">
        <div class="summary-metric">
          <span class="summary-number">${filtered.length}</span>
          <span class="summary-label">Centres Matching</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-metric">
          <span class="summary-number accent-free">${totalFree.toLocaleString()}</span>
          <span class="summary-label">Total Places Free</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-metric">
          <span class="summary-number">${totalCapacity.toLocaleString()}</span>
          <span class="summary-label">Total Capacity</span>
        </div>
      </div>
    `;
  }

  // Render list cards
  if (filtered.length === 0) {
    centresListContainer.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; color: #ffcc00; margin-bottom: 1rem;"></i>
        <h3>No centres found matching your criteria</h3>
        <p>Try clearing your search query or enabling full centres.</p>
        <button type="button" class="btn-primary" onclick="resetFilters()" style="margin-top: 1rem;">Reset All Filters</button>
      </div>
    `;
    return;
  }

  centresListContainer.innerHTML = filtered
    .map((centre) => {
      const placesFree = calculatePlacesFree(centre.capacity, centre.occupancy);
      const isFull = placesFree === 0;
      const pct = getOccupancyPercentage(centre.capacity, centre.occupancy);
      const status = getOccupancyStatus(pct);

      // FR-3.8: tel: link with sanitized phone
      const cleanPhone = centre.phone.replace(/[^0-9+]/g, "");

      return `
        <article class="centre-card ${isFull ? 'centre-card-full' : ''}" data-centre-id="${centre.id}">
          <header class="centre-header">
            <div class="centre-title-group">
              <h3 class="centre-name">${escapeHtml(centre.name)}</h3>
              <div class="centre-meta-tags">
                <span class="badge badge-type">${escapeHtml(centre.type)}</span>
                <span class="badge badge-district"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(centre.district)}</span>
                <span class="badge badge-town">${escapeHtml(centre.town)}</span>
              </div>
            </div>
            ${
              isFull
                ? `<span class="badge badge-full-tag animate-pulse">Full</span>`
                : `<span class="badge badge-places-free"><strong>${placesFree}</strong> places free</span>`
            }
          </header>

          <div class="centre-body">
            <!-- FR-3.3 Visual Occupancy Bar -->
            <div class="occupancy-section">
              <div class="occupancy-labels">
                <span class="occupancy-text">
                  Occupancy: <strong>${centre.occupancy}</strong> / ${centre.capacity}
                </span>
                <span class="occupancy-percentage ${status.className}">
                  ${pct}% ${isFull ? '— FULL' : ''}
                </span>
              </div>
              <div class="progress-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Occupancy for ${escapeHtml(centre.name)}">
                <div class="progress-fill ${status.barClass}" style="width: ${pct}%;"></div>
              </div>
            </div>

            <div class="centre-details-grid">
              <div class="detail-item">
                <span class="detail-label">Places Free</span>
                <span class="detail-value ${isFull ? 'text-full' : 'text-free'}">
                  ${isFull ? '<strong class="full-label">Full (0 free)</strong>' : `<strong>${placesFree}</strong> available`}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">River Basin</span>
                <span class="detail-value text-basin">${escapeHtml(centre.riverBasin || 'General Basin')}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Direct Contact</span>
                <span class="detail-value">
                  <!-- FR-3.8 tel: link -->
                  <a href="tel:${cleanPhone}" class="phone-link" title="Call ${escapeHtml(centre.name)} directly">
                    <i class="fa-solid fa-phone"></i> ${escapeHtml(centre.phone)}
                  </a>
                </span>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function resetFilters() {
  if (searchInput) searchInput.value = "";
  if (districtSelect) districtSelect.value = "ALL";
  if (spaceOnlyCheckbox) spaceOnlyCheckbox.checked = false;
  renderCentres();
}

// Safe HTML escape helper
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================================================
// FR-3.11: PERSISTENT NAVIGATION & ARIA-CURRENT
// 4 sections reachable from persistent nav.
// Active section visually marked and exposed via aria-current="page".
// ============================================================================
function setupNavigation() {
  navLinks = Array.from(document.querySelectorAll("nav a[data-section]"));
  const sectionIds = ["overview", "safe-centres", "problem-methodology", "preparedness"];
  trackedSections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function setActiveNavLink(targetId) {
    navLinks.forEach((link) => {
      const sectionAttr = link.getAttribute("data-section");
      if (sectionAttr === targetId) {
        link.classList.add("nav-active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("nav-active");
        link.removeAttribute("aria-current");
      }
    });
  }

  // Click handler with smooth scrolling
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("data-section");
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const navHeight = document.querySelector(".navbar")?.offsetHeight || 70;
        const targetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: "smooth"
        });
        setActiveNavLink(targetId);
        // Update URL hash without jump
        if (history.pushState) {
          history.pushState(null, null, "#" + targetId);
        }
      }
    });
  });

  // Scroll spy via IntersectionObserver
  if ("IntersectionObserver" in window && trackedSections.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveNavLink(entry.target.id);
        }
      });
    }, observerOptions);

    trackedSections.forEach((sec) => observer.observe(sec));
  }

  // Initial check based on hash or default to overview
  const initialHash = window.location.hash ? window.location.hash.replace("#", "") : "overview";
  setActiveNavLink(initialHash);
}

// ============================================================================
// INITIALIZATION
// ============================================================================
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    searchInput = document.getElementById("centre-search");
  districtSelect = document.getElementById("district-filter");
  spaceOnlyCheckbox = document.getElementById("space-only-filter");
  centresListContainer = document.getElementById("centres-list");
  centresSummaryContainer = document.getElementById("centres-summary");

  if (districtSelect) {
    populateDistrictDropdown();
  }

  // Attach search and filter event listeners
  if (searchInput) {
    searchInput.addEventListener("input", renderCentres);
  }
  if (districtSelect) {
    districtSelect.addEventListener("change", renderCentres);
  }
  if (spaceOnlyCheckbox) {
    spaceOnlyCheckbox.addEventListener("change", renderCentres);
  }

  // Initial render
  renderCentres();

  // Setup navigation
  setupNavigation();

  // Particle background
  const container = document.getElementById("particles-container");
  if (container && container.children.length === 0) {
    for (let i = 0; i < 40; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      const size = Math.random() * 4 + 2;
      particle.style.width = size + "px";
      particle.style.height = size + "px";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.animationDuration = Math.random() * 20 + 10 + "s";
      particle.style.animationDelay = Math.random() * 10 + "s";
      container.appendChild(particle);
    }
  }
});
}

// Export for testing environments if available
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SAFE_CENTRES,
    calculatePlacesFree,
    isCentreFull,
    getOccupancyPercentage,
    getOccupancyStatus,
    filterCentres
  };
}
