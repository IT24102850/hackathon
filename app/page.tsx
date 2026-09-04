"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  SAFE_CENTRES,
  calculatePlacesFree,
  getOccupancyInfo,
  getUniqueDistricts,
  summariseAvailability
} from "@/lib/safe-centres";

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("ALL");
  const [spaceOnly, setSpaceOnly] = useState<boolean>(false);
  const [centres, setCentres] = useState(SAFE_CENTRES);
  const [bookedSpots, setBookedSpots] = useState<Record<string, number>>({});
  const [bookingCentreId, setBookingCentreId] = useState<string | number | null>(null);
  const [bookingName, setBookingName] = useState<string>("");
  const [bookingGuests, setBookingGuests] = useState<number>(1);
  const [bookingSubmitting, setBookingSubmitting] = useState<boolean>(false);
  const [bookingNotification, setBookingNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [pendingBooking, setPendingBooking] = useState<{
    centreId: string | number;
    guests: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/centres")
      .then(async (response) => {
        if (!response.ok) throw new Error("Centre data unavailable");
        const data = (await response.json()) as { centres: typeof SAFE_CENTRES };
        setCentres(data.centres);
      })
      .catch(() => {
        setBookingNotification({
          type: "error",
          message: "Live centre data is unavailable. Showing the saved sample catalogue."
        });
      });
  }, []);

  useEffect(() => {
    if (!bookingNotification) return;

    const timeoutId = window.setTimeout(() => {
      setBookingNotification(null);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [bookingNotification]);

  useEffect(() => {
    fetch("/api/bookings")
      .then(async (response) => {
        if (!response.ok) throw new Error("Booking data unavailable");
        const data = (await response.json()) as { bookings: Record<string, number> };
        setBookedSpots(data.bookings || {});
      })
      .catch(() => {
        setBookingNotification({
          type: "error",
          message: "Live booking data is unavailable. Please try again shortly."
        });
      });
  }, []);

  // Dynamic unique districts extracted from data (FR-3.5)
  const districts = useMemo(() => getUniqueDistricts(centres), [centres]);

  // Combined multi-filtering (FR-3.4, FR-3.5, FR-3.6)
  const centresWithBookings = useMemo(
    () =>
      centres.map((centre) => ({
        ...centre,
        occupancy: Math.min(
          centre.capacity,
          centre.occupancy + (bookedSpots[String(centre.id)] || 0)
        )
      })),
    [bookedSpots, centres]
  );

  const filteredCentres = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return centresWithBookings.filter((centre) => {
      // FR-3.4 Search
      const matchesSearch =
        !q ||
        centre.name.toLowerCase().includes(q) ||
        centre.town.toLowerCase().includes(q) ||
        centre.type.toLowerCase().includes(q);

      // FR-3.5 District
      const matchesDistrict =
        selectedDistrict === "ALL" || centre.district === selectedDistrict;

      // FR-3.6 Space-only
      const placesFree = calculatePlacesFree(centre.capacity, centre.occupancy);
      const matchesSpace = !spaceOnly || placesFree > 0;

      return matchesSearch && matchesDistrict && matchesSpace;
    });
  }, [searchQuery, selectedDistrict, spaceOnly, centresWithBookings]);

  // FR-3.7 Summary metrics
  const summary = useMemo(
    () => summariseAvailability(filteredCentres),
    [filteredCentres]
  );

  // Scroll spy & nav active state (FR-3.11)
  useEffect(() => {
    const sections = ["overview", "safe-centres", "problem-methodology", "preparedness"];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const navOffset = 70;
      const targetTop = el.getBoundingClientRect().top + window.pageYOffset - navOffset;
      window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    }
  };

  const selectedBookingCentre = bookingCentreId === null
    ? null
    : centresWithBookings.find((centre) => centre.id === bookingCentreId) || null;

  const submitBooking = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedBookingCentre) return;

    const placesFree = calculatePlacesFree(
      selectedBookingCentre.capacity,
      selectedBookingCentre.occupancy
    );
    const requestedGuests = Math.floor(Number(bookingGuests));

    if (!bookingName.trim() || requestedGuests < 1 || requestedGuests > placesFree) {
      setBookingNotification({
        type: "error",
        message:
          !bookingName.trim()
            ? "Enter a contact name before confirming your reservation."
            : placesFree === 0
            ? "This centre is full. Please choose another centre."
            : `Enter between 1 and ${placesFree} available spot${placesFree === 1 ? "" : "s"}.`
      });
      return;
    }

    setPendingBooking({ centreId: selectedBookingCentre.id, guests: requestedGuests });
  };

  const confirmBooking = async () => {
    if (!pendingBooking || !selectedBookingCentre) return;

    setBookingSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          centreId: pendingBooking.centreId,
          contactName: bookingName,
          guests: pendingBooking.guests
        })
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setBookingNotification({
          type: "error",
          message: data.error || "Unable to confirm the booking."
        });
        return;
      }

      setBookedSpots((current) => ({
        ...current,
        [String(pendingBooking.centreId)]:
          (current[String(pendingBooking.centreId)] || 0) + pendingBooking.guests
      }));
      setBookingNotification({
        type: "success",
        message: `${pendingBooking.guests} spot${pendingBooking.guests === 1 ? "" : "s"} reserved at ${selectedBookingCentre.name}.`
      });
      setPendingBooking(null);
      setBookingName("");
      setBookingGuests(1);
      setBookingCentreId(null);
    } catch {
      setBookingNotification({
        type: "error",
        message: "Unable to reach the booking service. Please try again."
      });
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0f1623] to-[#1a1f2f] text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {pendingBooking && selectedBookingCentre && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-confirmation-title"
            className="w-full max-w-md rounded-2xl border border-emerald-400/40 bg-[#101827] p-6 shadow-[0_0_40px_rgba(16,185,129,0.3)]"
          >
            <h2 id="booking-confirmation-title" className="text-xl font-bold text-white">
              Confirm your reservation
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Are you sure you want to reserve{" "}
              <strong className="text-emerald-300">{pendingBooking.guests} spot{pendingBooking.guests === 1 ? "" : "s"}</strong>{" "}
              at <strong className="text-white">{selectedBookingCentre.name}</strong> for{" "}
              <strong className="text-white">{bookingName.trim()}</strong>?
            </p>
            <p className="mt-2 text-xs text-amber-300">
              This prototype reservation updates the displayed availability for this session.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPendingBooking(null)}
                className="px-4 py-2.5 rounded-xl border border-white/20 text-slate-200 hover:bg-white/10 text-sm font-semibold cursor-pointer"
              >
                No, go back
              </button>
              <button
                type="button"
                onClick={confirmBooking}
                disabled={bookingSubmitting}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 text-[#06130e] hover:bg-emerald-400 text-sm font-extrabold cursor-pointer"
              >
                {bookingSubmitting ? "Saving reservation..." : "Yes, confirm reservation"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ====================================================================
          FR-3.11: PERSISTENT NAVIGATION BAR & ARIA-CURRENT
          4 sections reachable from persistent nav, active section marked
          visually and exposed via aria-current="page".
          ==================================================================== */}
      <header className="sticky top-0 z-50 bg-[#0a0f1a]/95 backdrop-blur-md border-b border-cyan-500/20 px-4 sm:px-8 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <a
            href="#overview"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("overview");
            }}
            className="flex items-center gap-2 text-lg sm:text-xl font-bold tracking-tight text-white hover:text-cyan-400 transition-colors"
          >
            <span className="text-2xl">🌊</span>
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              SL-FloodWarning
            </span>
          </a>

          <nav aria-label="Main Navigation" className="flex flex-wrap items-center gap-1 sm:gap-2">
            {[
              { id: "overview", label: "Overview", icon: "🏠" },
              { id: "safe-centres", label: "Safe Centres", icon: "🛡️" },
              { id: "problem-methodology", label: "Problem & AI", icon: "📊" },
              { id: "preparedness", label: "Preparedness", icon: "🚨" }
            ].map((tab) => {
              const isActive = activeSection === tab.id;
              return (
                <a
                  key={tab.id}
                  href={`#${tab.id}`}
                  data-section={tab.id}
                  aria-current={isActive ? "page" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(tab.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/25 to-emerald-500/15 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,201,255,0.25)] font-semibold"
                      : "text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </a>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-20">
        {/* ==================================================================
            SECTION 1: OVERVIEW (#overview)
            ================================================================== */}
        <section id="overview" className="pt-4 scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide">
                <span>🛰️</span> NASA GPM IMERG + XGBoost Early Warning
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
                Sri Lanka Flood &amp; Landslide{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  Early Warning System
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                A real-time geospatial intelligence system predicting flood and landslide risks
                24–48 hours in advance across all 25 districts, paired with a live safe evacuation
                shelter availability network.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => scrollToSection("safe-centres")}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-[0_0_20px_rgba(0,201,255,0.3)] transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
                >
                  <span>🛡️</span> Find Safe Centres
                </button>
                <button
                  onClick={() => scrollToSection("problem-methodology")}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 text-sm font-medium transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>ℹ️</span> How It Works
                </button>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                <div className="p-3 rounded-xl bg-[#141928]/60 border border-white/5">
                  <div className="text-2xl font-bold text-cyan-400">25</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Districts Monitored</div>
                </div>
                <div className="p-3 rounded-xl bg-[#141928]/60 border border-white/5">
                  <div className="text-2xl font-bold text-emerald-400">24-48h</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Early Warning</div>
                </div>
                <div className="p-3 rounded-xl bg-[#141928]/60 border border-white/5">
                  <div className="text-2xl font-bold text-amber-400">20+</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Safe Shelters</div>
                </div>
                <div className="p-3 rounded-xl bg-[#141928]/60 border border-white/5">
                  <div className="text-2xl font-bold text-cyan-400">100%</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Public Access</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-cyan-500/20 shadow-2xl bg-[#0f1623]">
                <div className="relative h-64 sm:h-72 w-full bg-slate-900">
                  <Image
                    src="/images/response.jpg"
                    alt="Disaster Response"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f1623] via-transparent to-transparent"></div>
                </div>
                <div className="p-4 bg-[#0f1623]">
                  <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                    <span>🚨</span> Proactive Evacuation &amp; Shelter Management
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Continuous monitoring of rainfall, elevation, and river basins to guide citizens to unoccupied relief centres.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            SECTION 2: SAFE CENTRES DIRECTORY (#safe-centres)
            Implements FR-3.1 through FR-3.8
            ================================================================== */}
        <section id="safe-centres" className="scroll-mt-24 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Emergency Shelter Registry
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Registered Safe Centres &amp; Space Tracker
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Live capacity and vacancy metrics for designated disaster shelters across high-risk districts.
            </p>
          </div>

          {/* Filter Controls Toolbar (FR-3.4, FR-3.5, FR-3.6) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#141928]/80 backdrop-blur border border-white/10 shadow-xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* FR-3.4 Search Input */}
              <div className="md:col-span-5 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  🔍
                </span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search centres by name, town, or type (e.g. School, Kaduwela)..."
                  aria-label="Search safe centres by name, town, or type"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0a0f1a] border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
              </div>

              {/* FR-3.5 District Filter Dropdown */}
              <div className="md:col-span-4">
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  aria-label="Filter centres by district"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0a0f1a] border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400 transition-all cursor-pointer"
                >
                  <option value="ALL">All Districts ({districts.length} available)</option>
                  {districts.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              {/* FR-3.6 Filter to Centres with Space Only */}
              <div className="md:col-span-3 flex items-center">
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-slate-300 hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={spaceOnly}
                    onChange={(e) => setSpaceOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 bg-[#0a0f1a] border-white/20 focus:ring-cyan-400 cursor-pointer accent-cyan-500"
                  />
                  <span>Only centres with space</span>
                </label>
              </div>
            </div>
          </div>

          {/* FR-3.7 Availability Summary */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 via-emerald-500/5 to-transparent border border-cyan-500/20 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {summary.matchingCount} <span className="text-xs text-slate-400 font-normal">of {centres.length}</span>
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Centres Matching</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-400">
                {summary.totalPlacesFree.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Total Places Free</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-cyan-400">
                {summary.totalCapacity.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Total Capacity</div>
            </div>
          </div>
          {bookingNotification && (
            <div
              role={bookingNotification.type === "error" ? "alert" : "status"}
              aria-live="assertive"
              className={`fixed top-4 left-1/2 z-[120] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 p-5 rounded-2xl border-2 text-base font-semibold shadow-[0_0_30px_rgba(0,0,0,0.45)] flex items-center gap-3 animate-[pulse_2s_ease-in-out_1] ${
                bookingNotification.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/25 text-rose-300"
              }`}
            >
              <span aria-hidden="true">
                {bookingNotification.type === "success" ? "✅" : "⚠️"}
              </span>
              <span>{bookingNotification.message}</span>
              <button
                type="button"
                onClick={() => setBookingNotification(null)}
                aria-label="Dismiss booking notification"
                className="text-current/70 hover:text-current font-bold cursor-pointer"
              >
                ×
              </button>
            </div>
          )}

          {/* FR-3.1, FR-3.2, FR-3.3, FR-3.8 Centres Grid */}
          {filteredCentres.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#141928]/40 border border-dashed border-white/15 space-y-3">
              <span className="text-3xl">⚠️</span>
              <h3 className="text-lg font-semibold text-white">No centres match your filter criteria</h3>
              <p className="text-sm text-slate-400">Try clearing your search keyword or showing full centres.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDistrict("ALL");
                  setSpaceOnly(false);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold hover:bg-cyan-500/30 transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filteredCentres.map((centre) => {
                const info = getOccupancyInfo(centre);
                const cleanPhone = centre.phone.replace(/[^0-9+]/g, "");
                const isBookingCentre = bookingCentreId === centre.id;

                return (
                  <article
                    key={centre.id}
                    className={`p-5 rounded-2xl bg-[#141928]/70 backdrop-blur border transition-all duration-300 flex flex-col justify-between space-y-4 hover:-translate-y-0.5 ${
                      info.isFull
                        ? "border-rose-500/30 hover:border-rose-500/50 shadow-[0_4px_20px_rgba(239,68,68,0.1)]"
                        : "border-white/10 hover:border-cyan-500/40 shadow-lg"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                          {centre.name}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 text-xs">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                            {centre.type}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-medium">
                            📍 {centre.district}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10 font-medium">
                            {centre.town}
                          </span>
                        </div>
                      </div>

                      {/* FR-3.2 "Full" label or Places Free */}
                      {info.isFull ? (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-extrabold tracking-wide uppercase shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse">
                          Full
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold whitespace-nowrap">
                          <strong>{info.placesFree}</strong> free
                        </span>
                      )}
                    </div>

                    {/* FR-3.3 Visual Occupancy Progress Bar */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-[#0a0f1a]/60 border border-white/5">
                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <span>
                          Occupancy: <strong className="text-white">{centre.occupancy}</strong> / {centre.capacity}
                        </span>
                        <span className={`font-bold ${info.isFull ? "text-rose-400" : "text-cyan-400"}`}>
                          {info.statusLabel}
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-valuenow={info.percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Occupancy for ${centre.name}`}
                        className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden"
                      >
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${info.barColorClass}`}
                          style={{ width: `${info.percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Bottom Metadata & Contact */}
                    <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="space-y-0.5">
                        <div className="text-slate-400">
                          River Basin: <span className="text-cyan-300 font-medium">{centre.riverBasin}</span>
                        </div>
                        <div className="text-slate-400">
                          Status:{" "}
                          <span className={info.isFull ? "text-rose-400 font-semibold" : "text-emerald-400 font-semibold"}>
                            {info.isFull ? "Full (0 free)" : `${info.placesFree} available`}
                          </span>
                        </div>
                      </div>

                      {/* FR-3.8 Contact tel: link */}
                      <a
                        href={`tel:${cleanPhone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/30 text-xs font-semibold transition-colors"
                        title={`Call ${centre.name}`}
                      >
                        <span>📞</span> {centre.phone}
                      </a>
                    </div>

                    <div className="pt-1">
                      {info.isFull ? (
                        <span className="text-xs text-rose-300">Booking unavailable — centre is full.</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setBookingCentreId(isBookingCentre ? null : centre.id);
                            setBookingNotification(null);
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-bold transition-colors cursor-pointer"
                        >
                          {isBookingCentre ? "Close booking form" : "Reserve available spots"}
                        </button>
                      )}
                    </div>

                    {isBookingCentre && !info.isFull && (
                      <form onSubmit={submitBooking} className="p-3 rounded-xl bg-[#0a0f1a]/80 border border-emerald-500/25 space-y-2">
                        <p className="text-xs text-slate-300">
                          Reserve up to <strong className="text-emerald-300">{info.placesFree}</strong> currently available spot{info.placesFree === 1 ? "" : "s"}.
                        </p>
                        <label className="block text-xs text-slate-400">
                          Contact name
                          <input
                            value={bookingName}
                            onChange={(event) => setBookingName(event.target.value)}
                            placeholder="Your name"
                            className="mt-1 w-full px-3 py-2 rounded-lg bg-[#141928] border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                          />
                        </label>
                        <label className="block text-xs text-slate-400">
                          Number of people
                          <input
                            type="number"
                            min={1}
                            value={bookingGuests}
                            onChange={(event) => setBookingGuests(Number(event.target.value))}
                            className="mt-1 w-full px-3 py-2 rounded-lg bg-[#141928] border border-white/15 text-white focus:outline-none focus:border-emerald-400"
                          />
                        </label>
                        <button
                          type="submit"
                          className="w-full px-3 py-2 rounded-lg bg-emerald-500 text-[#06130e] text-xs font-extrabold hover:bg-emerald-400 transition-colors cursor-pointer"
                        >
                          Confirm reservation
                        </button>
                      </form>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ==================================================================
            SECTION 3: PROBLEM & METHODOLOGY (#problem-methodology)
            Implements FR-3.9: States Sri Lankan problem, who is affected,
            what fails, risk calculation formula, limitations, naming specific
            districts and river basins.
            ================================================================== */}
        <section id="problem-methodology" className="scroll-mt-24 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Disaster Context &amp; Machine Learning
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Understanding the Crisis &amp; AI Framework
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Why Sri Lanka experiences recurring devastating flood &amp; landslide hazards, and how our machine learning models forecast them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. The Sri Lankan Problem */}
            <div className="md:col-span-2 p-6 rounded-2xl bg-[#141928]/80 border border-white/10 space-y-3">
              <div className="flex items-center gap-3 text-rose-400 font-bold text-lg">
                <span>🌧️</span>
                <h3>1. The Sri Lankan Problem</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Sri Lanka faces recurrent extreme hydro-meteorological catastrophes governed by a bimodal monsoon system—the{" "}
                <strong className="text-cyan-300">Southwest Monsoon (May to September)</strong> and the{" "}
                <strong className="text-emerald-300">Northeast Monsoon (December to February)</strong>—compounded by severe
                tropical cyclones such as <strong>Cyclone Ditwah</strong> in November 2025. This historic event caused{" "}
                <strong>$4.1 billion in damage</strong>, displaced over 2 million individuals across all 25 districts, and
                devastated essential transportation and power lines.
              </p>
              <div className="p-4 rounded-xl bg-[#0a0f1a]/80 border border-cyan-500/20 space-y-2">
                <span className="text-xs font-semibold text-cyan-400 uppercase">Critical Flood-Prone River Basins:</span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {["Kelani Ganga Basin", "Kalu Ganga Basin", "Gin Ganga Basin", "Nilwala Ganga Basin", "Mahaweli Ganga Basin", "Deduru Oya Basin"].map((basin) => (
                    <span key={basin} className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                      🌊 {basin}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Who is Affected */}
            <div className="p-6 rounded-2xl bg-[#141928]/80 border border-white/10 space-y-3">
              <div className="flex items-center gap-3 text-cyan-400 font-bold text-base sm:text-lg">
                <span>👥</span>
                <h3>2. Who is Affected</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Over <strong>2 million citizens</strong> are repeatedly jeopardized, particularly agricultural families
                whose farmlands are submerged (over <strong>58,000 hectares of paddy fields</strong> destroyed during recent floods).
                Dense urban communities residing on low-lying floodplains experience water contamination and destruction of sanitary facilities.
              </p>
              <div className="space-y-1 pt-1">
                <span className="text-xs font-semibold text-slate-400">High-Risk Districts Directly Evaluated:</span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {["Kalutara", "Ratnapura", "Galle", "Matara", "Colombo", "Gampaha", "Kegalle", "Badulla", "Nuwara Eliya"].map((d) => (
                    <span key={d} className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/25 font-medium">
                      📍 {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. What Currently Fails */}
            <div className="p-6 rounded-2xl bg-[#141928]/80 border border-white/10 space-y-3">
              <div className="flex items-center gap-3 text-amber-400 font-bold text-base sm:text-lg">
                <span>⚠️</span>
                <h3>3. What Currently Fails</h3>
              </div>
              <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
                <li>
                  <strong className="text-white">Static Threshold Flaws:</strong> Traditional alerts rely solely on fixed 24-hour rainfall quantities without evaluating ground saturation from previous storms.
                </li>
                <li>
                  <strong className="text-white">Disjointed Evacuations:</strong> Evacuees are instructed to find safety without live occupancy tracking, resulting in crowded or closed centres while nearby sites stand empty.
                </li>
                <li>
                  <strong className="text-white">Delayed Administrative Warnings:</strong> Manual alert hierarchies take hours to disperse, frequently reaching communities after water levels have already crested.
                </li>
              </ul>
            </div>

            {/* 4. How Risk Score is Calculated */}
            <div className="p-6 rounded-2xl bg-[#141928]/80 border border-white/10 space-y-3">
              <div className="flex items-center gap-3 text-purple-400 font-bold text-base sm:text-lg">
                <span>🧠</span>
                <h3>4. How Risk Score is Calculated</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                The model uses an <strong>XGBoost classifier</strong> trained on 50 years (1974–2024) of DesInventar disaster records,
                evaluated using 5-fold TimeSeriesCV to avoid future-to-past data leakage:
              </p>
              <div className="p-3 rounded-xl bg-[#0a0f1a] border border-purple-500/30 text-purple-300 font-mono text-xs">
                RiskScore = σ( Σ w_i · f_i ) ∈ [0, 100]
                <br />
                Features: [Rainfall_Now, Antecedent_30d, Rain_3mo_Sum, Elevation_SRTM, Slope_Mean, Monsoon_SinCos]
              </div>
            </div>

            {/* 5. Prototype Limitations */}
            <div className="p-6 rounded-2xl bg-[#141928]/80 border border-white/10 space-y-3">
              <div className="flex items-center gap-3 text-rose-400 font-bold text-base sm:text-lg">
                <span>🔬</span>
                <h3>5. Prototype Limitations</h3>
              </div>
              <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
                <li>
                  <strong className="text-white">Satellite Latency:</strong> NASA GPM IMERG early data runs have a 3-4 hour satellite product ingestion delay.
                </li>
                <li>
                  <strong className="text-white">Spatial Resolution:</strong> Predictions are computed at District level rather than Grama Niladhari (GN) micro-divisions.
                </li>
                <li>
                  <strong className="text-white">Simulated Telemetry:</strong> Shelter vacancies and occupancy currently ingest sample coordination figures until nationwide DMC sensor links go live.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ==================================================================
            SECTION 4: EMERGENCY PREPAREDNESS (#preparedness)
            ================================================================== */}
        <section id="preparedness" className="scroll-mt-24 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Community Action Protocol
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Emergency Preparedness &amp; Hotlines
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Immediate response contacts and evacuation procedures when flood or landslide alerts are triggered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#141928]/80 border border-white/10 space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-cyan-400 flex items-center gap-2">
                <span>📞</span> 24/7 National Emergency Hotlines
              </h3>
              <div className="space-y-3">
                {[
                  { name: "Disaster Management Centre (DMC)", tel: "117", desc: "National Disaster Coordination & Relief" },
                  { name: "Suwa Seriya Pre-Hospital Care", tel: "1990", desc: "Toll-Free Emergency Medical Response" },
                  { name: "Sri Lanka Police Emergency Division", tel: "119", desc: "Search, Rescue & Law Enforcement" },
                  { name: "Sri Lanka Red Cross Society", tel: "+94112691095", desc: "Evacuation Support & First Aid" }
                ].map((item) => (
                  <div key={item.tel} className="p-3 rounded-xl bg-[#0a0f1a] border border-white/5 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{item.name}</div>
                      <div className="text-xs text-slate-400">{item.desc}</div>
                    </div>
                    <a
                      href={`tel:${item.tel}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition-colors whitespace-nowrap"
                    >
                      Dial {item.tel}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#141928]/80 border border-white/10 space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-emerald-400 flex items-center gap-2">
                <span>🛡️</span> Household Evacuation Checklist
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Assemble waterproof pouch containing National IDs, property deeds, and medical prescriptions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Store 3 days of non-perishable food, water purification tablets, and battery-powered flashlights.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Shut off domestic main circuit breakers and disconnect LP gas regulators.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Review the Safe Centres section above to check vacancy before departing.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/10 bg-[#0a0f1a]/80 py-8 text-center text-xs text-slate-500">
        <p>Sri Lanka Flood &amp; Landslide Early Warning System — Open Source Initiative.</p>
        <p className="mt-1">Satellite data provided by NASA GPM IMERG | Open-Meteo API | DesInventar Disaster Archives.</p>
      </footer>
    </div>
  );
}
