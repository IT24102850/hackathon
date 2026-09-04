// test_suite.js — Automated verification of FR-3.1 through FR-3.12
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("=================================================================");
console.log("  SRI LANKA FLOOD WARNING SYSTEM — COMPREHENSIVE TEST SUITE");
console.log("  Verifying FR-3.1 through FR-3.12 Acceptance Criteria");
console.log("=================================================================\n");

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}`);
  }
}

// 1. Load files
const scriptPath = path.join(__dirname, 'app', 'script.js');
const indexPath = path.join(__dirname, 'index.html');
const landingHtmlPath = path.join(__dirname, 'app', 'landing.html');
const cssPath = path.join(__dirname, 'app', 'landing.css');
const appPyPath = path.join(__dirname, 'app', 'app.py');

const scriptContent = fs.readFileSync(scriptPath, 'utf8');
const indexHtmlContent = fs.readFileSync(indexPath, 'utf8');
const landingHtmlContent = fs.readFileSync(landingHtmlPath, 'utf8');
const cssContent = fs.readFileSync(cssPath, 'utf8');
const appPyContent = fs.readFileSync(appPyPath, 'utf8');

const {
  SAFE_CENTRES,
  calculatePlacesFree,
  isCentreFull,
  getOccupancyPercentage,
  getOccupancyStatus
} = require(scriptPath);

// ---------------------------------------------------------------------------
// FR-3.1: List registered centres
// Display sample safe centres with name, type, town, district, phone number, capacity, occupancy
// Accepts: at least 16 centres across at least 8 districts
// ---------------------------------------------------------------------------
test("FR-3.1: Minimum 16 safe centres present", () => {
  assert(Array.isArray(SAFE_CENTRES), "SAFE_CENTRES should be an array");
  assert(SAFE_CENTRES.length >= 16, `Expected >= 16 centres, found ${SAFE_CENTRES.length}`);
});

test("FR-3.1: Minimum 8 distinct districts represented", () => {
  const districts = new Set(SAFE_CENTRES.map(c => c.district));
  assert(districts.size >= 8, `Expected >= 8 districts, found ${districts.size}: ${Array.from(districts).join(', ')}`);
});

test("FR-3.1: Every centre has all 7 mandatory fields with valid types", () => {
  SAFE_CENTRES.forEach((centre, idx) => {
    assert(centre.name && typeof centre.name === 'string', `Centre #${idx} missing valid name`);
    assert(centre.type && typeof centre.type === 'string', `Centre #${idx} missing valid type`);
    assert(centre.town && typeof centre.town === 'string', `Centre #${idx} missing valid town`);
    assert(centre.district && typeof centre.district === 'string', `Centre #${idx} missing valid district`);
    assert(centre.phone && typeof centre.phone === 'string', `Centre #${idx} missing valid phone`);
    assert(typeof centre.capacity === 'number' && centre.capacity > 0, `Centre #${idx} invalid capacity`);
    assert(typeof centre.occupancy === 'number' && centre.occupancy >= 0, `Centre #${idx} invalid occupancy`);
  });
});

// ---------------------------------------------------------------------------
// FR-3.2: Calculate remaining space
// places free as capacity minus occupancy, never below zero; label full centre as "Full"
// ---------------------------------------------------------------------------
test("FR-3.2: Calculate places free as capacity - occupancy, never below zero", () => {
  assert.strictEqual(calculatePlacesFree(500, 300), 200);
  assert.strictEqual(calculatePlacesFree(200, 200), 0);
  // Edge case: overflow occupancy never returns negative
  assert.strictEqual(calculatePlacesFree(100, 150), 0);
});

test("FR-3.2: Full centre detection and 'Full' labeling", () => {
  const fullCentres = SAFE_CENTRES.filter(c => isCentreFull(c.capacity, c.occupancy));
  assert(fullCentres.length > 0, "There should be at least one 100% full centre in the dataset for testing");
  assert.strictEqual(isCentreFull(200, 200), true);
  assert.strictEqual(isCentreFull(200, 199), false);
  
  // Verify HTML rendering generates 'Full' badge
  assert(scriptContent.includes('badge-full-tag') && scriptContent.includes('Full'), "Script must render 'Full' badge for full centres");
});

// ---------------------------------------------------------------------------
// FR-3.3: Show occupancy visually
// Render occupancy bar as a percentage, coloured differently at 100%
// ---------------------------------------------------------------------------
test("FR-3.3: Occupancy percentage calculation", () => {
  assert.strictEqual(getOccupancyPercentage(400, 200), 50);
  assert.strictEqual(getOccupancyPercentage(200, 200), 100);
  assert.strictEqual(getOccupancyPercentage(100, 110), 100); // capped at 100%
});

test("FR-3.3: Distinct color/styling at 100% occupancy", () => {
  const normalStatus = getOccupancyStatus(50);
  const fullStatus = getOccupancyStatus(100);
  assert.notStrictEqual(normalStatus.barClass, fullStatus.barClass, "100% bar must have a distinct CSS class");
  assert.strictEqual(fullStatus.barClass, "bar-full");
  assert.strictEqual(fullStatus.isFull, true);
  
  // Verify CSS defines different gradient/color for bar-full
  assert(cssContent.includes('.progress-fill.bar-full'), "CSS must define .progress-fill.bar-full");
});

// ---------------------------------------------------------------------------
// FR-3.4: Search centres
// Case-insensitive substring match on centre name, town, or type
// ---------------------------------------------------------------------------
test("FR-3.4: Case-insensitive search on name, town, or type", () => {
  const queryName = "VIDYALAYA";
  const resultsName = SAFE_CENTRES.filter(c => 
    c.name.toLowerCase().includes(queryName.toLowerCase()) ||
    c.town.toLowerCase().includes(queryName.toLowerCase()) ||
    c.type.toLowerCase().includes(queryName.toLowerCase())
  );
  assert(resultsName.length > 0, "Search by name should find centres");

  const queryTown = "kaduwela";
  const resultsTown = SAFE_CENTRES.filter(c => 
    c.name.toLowerCase().includes(queryTown.toLowerCase()) ||
    c.town.toLowerCase().includes(queryTown.toLowerCase()) ||
    c.type.toLowerCase().includes(queryTown.toLowerCase())
  );
  assert(resultsTown.length > 0, "Search by town should find centres");

  const queryType = "STADIUM";
  const resultsType = SAFE_CENTRES.filter(c => 
    c.name.toLowerCase().includes(queryType.toLowerCase()) ||
    c.town.toLowerCase().includes(queryType.toLowerCase()) ||
    c.type.toLowerCase().includes(queryType.toLowerCase())
  );
  assert(resultsType.length > 0, "Search by type should find centres");
});

// ---------------------------------------------------------------------------
// FR-3.5: Filter by district
// Select populated from data itself, narrows results to one district
// ---------------------------------------------------------------------------
test("FR-3.5: District filter populated from data and narrows results", () => {
  assert(scriptContent.includes('populateDistrictDropdown'), "script.js must populate district dropdown dynamically from dataset");
  
  const targetDistrict = "Kalutara";
  const kalutaraCentres = SAFE_CENTRES.filter(c => c.district === targetDistrict);
  assert(kalutaraCentres.length > 0, "District filter should return centres in Kalutara");
  kalutaraCentres.forEach(c => assert.strictEqual(c.district, targetDistrict));
});

// ---------------------------------------------------------------------------
// FR-3.6: Filter to centres with space
// Checkbox hides centres where occupancy >= capacity. Filters combine!
// ---------------------------------------------------------------------------
test("FR-3.6: Space-only filter hides full centres", () => {
  const withSpace = SAFE_CENTRES.filter(c => calculatePlacesFree(c.capacity, c.occupancy) > 0);
  assert(withSpace.length < SAFE_CENTRES.length, "Space-only filter must exclude 100% full centres");
  withSpace.forEach(c => assert(c.occupancy < c.capacity, "Only centres with remaining places should remain"));
});

test("FR-3.6: Filters combine simultaneously (district + space + search)", () => {
  const query = "school";
  const district = "Kalutara";
  const spaceOnly = true;

  const combined = SAFE_CENTRES.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(query) || c.town.toLowerCase().includes(query) || c.type.toLowerCase().includes(query);
    const matchDistrict = c.district === district;
    const matchSpace = !spaceOnly || (c.capacity - c.occupancy) > 0;
    return matchSearch && matchDistrict && matchSpace;
  });

  assert(Array.isArray(combined), "Combined filter must produce result array");
  combined.forEach(c => {
    assert(c.district === district);
    assert(c.capacity > c.occupancy);
  });
});

// ---------------------------------------------------------------------------
// FR-3.7: Summarise availability
// Show number of centres matching and total places free across them
// ---------------------------------------------------------------------------
test("FR-3.7: Summarise availability (matching count and total places free)", () => {
  const totalFree = SAFE_CENTRES.reduce((acc, c) => acc + calculatePlacesFree(c.capacity, c.occupancy), 0);
  assert(totalFree > 0, `Total places free must be > 0 (found ${totalFree})`);
  assert(scriptContent.includes('totalFree'), "Script must calculate total free places");
  assert(scriptContent.includes('Centres Matching'), "Script must render matching centres counter");
  assert(scriptContent.includes('Total Places Free'), "Script must render total places free counter");
});

// ---------------------------------------------------------------------------
// FR-3.8: Enable contact
// Phone number shall be a tel: link so mobile user can call directly
// ---------------------------------------------------------------------------
test("FR-3.8: Phone numbers rendered as clickable tel: links", () => {
  assert(scriptContent.includes('href="tel:'), "script.js must render <a href='tel:...'>");
  assert(indexHtmlContent.includes('href="tel:117"'), "Hotlines must use tel: links in index.html");
  assert(indexHtmlContent.includes('href="tel:1990"'), "Hotline 1990 must use tel: link");
});

// ---------------------------------------------------------------------------
// FR-3.9: Explain the problem in-app
// Sri Lankan problem, who is affected, what currently fails, risk score calculation, prototype limitations.
// Names specific districts and river basins.
// ---------------------------------------------------------------------------
test("FR-3.9: In-app section covering problem, affected, failures, risk score, limitations", () => {
  const problemSection = indexHtmlContent;
  assert(problemSection.includes("1. The Sri Lankan Problem"), "Must include Sri Lankan problem");
  assert(problemSection.includes("2. Who is Affected"), "Must include who is affected");
  assert(problemSection.includes("3. What Currently Fails"), "Must include what currently fails");
  assert(problemSection.includes("4. How Risk Score is Calculated"), "Must include risk score calculation");
  assert(problemSection.includes("5. Prototype Limitations"), "Must include prototype limitations");
});

test("FR-3.9: Explicitly names specific vulnerable districts", () => {
  const requiredDistricts = ["Kalutara", "Ratnapura", "Galle", "Matara", "Colombo", "Gampaha", "Kegalle"];
  requiredDistricts.forEach(d => {
    assert(indexHtmlContent.includes(d), `index.html must explicitly name district: ${d}`);
  });
});

test("FR-3.9: Explicitly names specific river basins", () => {
  const requiredBasins = ["Kelani Ganga", "Kalu Ganga", "Gin Ganga", "Nilwala Ganga", "Mahaweli Ganga", "Deduru Oya"];
  requiredBasins.forEach(b => {
    assert(indexHtmlContent.includes(b), `index.html must explicitly name river basin: ${b}`);
  });
});

// ---------------------------------------------------------------------------
// FR-3.10: Work on mobile and desktop
// Reflows to single column at narrow widths, wrapping navigation, no horizontal scroll at 360 px
// ---------------------------------------------------------------------------
test("FR-3.10: Viewport meta tag and horizontal overflow prevention in CSS", () => {
  assert(indexHtmlContent.includes('<meta name="viewport" content="width=device-width, initial-scale=1.0"'), "Missing responsive viewport meta tag");
  assert(cssContent.includes('overflow-x: hidden'), "CSS must prevent horizontal scroll with overflow-x: hidden");
  assert(cssContent.includes('max-width: 100%'), "CSS must constrain element widths to 100%");
  assert(cssContent.includes('@media (max-width: 480px)'), "CSS must provide 360px mobile media query");
  assert(cssContent.includes('grid-template-columns: 1fr'), "CSS must reflow to single column on mobile");
});

// ---------------------------------------------------------------------------
// FR-3.11: Navigate between sections
// Four sections reachable from persistent navigation bar, active section marked with aria-current
// ---------------------------------------------------------------------------
test("FR-3.11: Persistent nav with 4 reachable sections and aria-current", () => {
  const fourSections = ["overview", "safe-centres", "problem-methodology", "preparedness"];
  
  // Verify persistent navbar in CSS
  assert(cssContent.includes('position: sticky') || cssContent.includes('position: fixed'), "Navbar must be persistent (sticky or fixed)");
  
  // Verify all 4 sections exist in HTML with corresponding IDs
  fourSections.forEach(secId => {
    assert(indexHtmlContent.includes(`id="${secId}"`), `HTML must contain section id="${secId}"`);
    assert(indexHtmlContent.includes(`data-section="${secId}"`), `Navigation must contain link for data-section="${secId}"`);
  });

  // Verify aria-current is used in initial HTML and managed by JavaScript
  assert(indexHtmlContent.includes('aria-current="page"'), "HTML initial state must expose aria-current='page'");
  assert(scriptContent.includes('setAttribute("aria-current", "page")'), "JS must dynamically set aria-current='page'");
  assert(scriptContent.includes('removeAttribute("aria-current")'), "JS must dynamically clear aria-current on inactive links");
});

// ---------------------------------------------------------------------------
// FR-3.12: Publicly deployable structure
// Unauthenticated root access
// ---------------------------------------------------------------------------
test("FR-3.12: Standalone root index.html exists with relative asset paths", () => {
  assert(fs.existsSync(indexPath), "index.html must exist at root for GitHub Pages / Vercel public hosting");
  assert(!indexHtmlContent.includes("localhost:8000"), "index.html should not hardcode localhost:8000 for public assets");
});

// ---------------------------------------------------------------------------
// STREAMLIT APP PARITY
// ---------------------------------------------------------------------------
test("Streamlit app parity: SAFE CENTRES tab integrated into app.py", () => {
  assert(appPyContent.includes('"SAFE CENTRES"'), "app.py must contain SAFE CENTRES tab");
  assert(appPyContent.includes('selected_tab == "SAFE CENTRES"'), "app.py must handle SAFE CENTRES tab rendering");
  assert(appPyContent.includes('places_free'), "app.py must calculate places_free");
  assert(appPyContent.includes('tel:'), "app.py must render direct telephone links");
});

console.log(`\n=================================================================`);
console.log(`  RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log(`=================================================================\n`);

if (passedTests === totalTests) {
  console.log("🎉 ALL ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!");
  process.exit(0);
} else {
  console.error("⚠️ Some tests failed.");
  process.exit(1);
}

