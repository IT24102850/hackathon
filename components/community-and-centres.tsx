"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DISTRICTS } from "@/lib/districts";
import { SAFE_CENTRES, type Centre } from "@/lib/safe-centres";

type Depth = "ankle" | "knee" | "waist" | "chest";
type Report = { name: string; mobile: string; district: string; town: string; depth: Depth; description: string; createdAt: string };
type Booking = { name: string; mobile: string; places: string };

const DEPTHS: { value: Depth; label: string }[] = [
  { value: "ankle", label: "Ankle deep (under 30 cm)" },
  { value: "knee", label: "Knee deep (30-60 cm)" },
  { value: "waist", label: "Waist deep (60-100 cm)" },
  { value: "chest", label: "Chest deep (over 100 cm)" },
];

const emptyForm = { name: "", mobile: "", district: "", town: "", depth: "" as Depth | "", description: "" };
const emptyBooking: Booking = { name: "", mobile: "", places: "1" };
const controlClass = "mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

function validate(form: typeof emptyForm) {
  const errors: Record<string, string> = {};
  if (form.name.trim().length < 3) errors.name = "Enter your name (at least 3 characters).";
  const mobile = form.mobile.replace(/[\s-]/g, "");
  if (!/^(0\d{9}|\+94\d{9})$/.test(mobile)) errors.mobile = "Use 10 digits starting with 0, or +94 followed by 9 digits.";
  if (!form.district) errors.district = "Select a district.";
  if (!form.town.trim()) errors.town = "Enter the town or area.";
  if (!form.depth) errors.depth = "Select the observed water depth.";
  const descriptionLength = form.description.trim().length;
  if (descriptionLength < 10 || descriptionLength > 300) errors.description = `Description must be 10 to 300 characters (currently ${descriptionLength}).`;
  return errors;
}

export function CommunityAndCentres() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reports, setReports] = useState<Report[]>([]);
  const [reportSearch, setReportSearch] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [centreQuery, setCentreQuery] = useState("");
  const [centreDistrict, setCentreDistrict] = useState("All districts");
  const [spaceOnly, setSpaceOnly] = useState(false);
  const [centres, setCentres] = useState(SAFE_CENTRES);
  const [bookingCentre, setBookingCentre] = useState<string | null>(null);
  const [booking, setBooking] = useState(emptyBooking);
  const [bookingNotice, setBookingNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    try {
      const savedReports = JSON.parse(localStorage.getItem("floodwatch-water-reports") || "[]") as Report[];
      if (Array.isArray(savedReports)) setReports(savedReports);
    } catch {
      setMessage({ type: "error", text: "Saved reports on this device could not be read." });
    }
    void fetch("/api/water-reports", { cache: "no-store" }).then(async (response) => {
      if (response.ok) {
        const remoteReports = await response.json() as Report[];
        if (remoteReports.length) setReports(remoteReports);
      }
      setMessage({ type: "error", text: "Reports could not be loaded from the database. Showing saved reports from this device." });
    }).catch(() => setMessage({ type: "error", text: "Reports could not be loaded from the database. Showing saved reports from this device." }));
    void fetch("/api/centres", { cache: "no-store" }).then(async (response) => {
      if (response.ok) setCentres(await response.json() as Centre[]);
      else setBookingNotice({ type: "error", text: "Safe centre availability could not be loaded from the database. Showing the latest available list." });
    }).catch(() => setBookingNotice({ type: "error", text: "Safe centre availability could not be loaded from the database. Showing the latest available list." }));
  }, []);

  const visibleReports = useMemo(() => {
    const query = reportSearch.trim().toLowerCase();
    if (!query) return reports;
    return reports.filter((report) => [report.town, report.district, report.name].some((value) => value.toLowerCase().includes(query)));
  }, [reportSearch, reports]);

  const filteredCentres = useMemo(() => centres.filter((centre) => {
    const query = centreQuery.trim().toLowerCase();
    return (!query || [centre.name, centre.town, centre.type].some((value) => value.toLowerCase().includes(query))) &&
      (centreDistrict === "All districts" || centre.district === centreDistrict) &&
      (!spaceOnly || centre.capacity - centre.occupancy > 0);
  }), [centreDistrict, centreQuery, centres, spaceOnly]);

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => { const next = { ...current }; delete next[field]; return next; });
    setMessage(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const report: Report = { ...form, depth: form.depth as Depth, createdAt: new Date().toISOString() };
    const nextReports = [report, ...reports];
    setReports(nextReports);
    localStorage.setItem("floodwatch-water-reports", JSON.stringify(nextReports));
    setForm(emptyForm);
    try {
      const response = await fetch("/api/water-reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(report) });
      if (!response.ok) throw new Error("The report could not be saved to the database.");
      setMessage({ type: "success", text: "Report submitted successfully and saved to the database." });
    } catch {
      setMessage({ type: "error", text: "Report saved on this device, but the database is unavailable. Please try again later." });
    }
  }

  function submitBooking(event: FormEvent, centre: Centre) {
    event.preventDefault();
    const places = Number(booking.places);
    const mobile = booking.mobile.replace(/[\s-]/g, "");
    if (booking.name.trim().length < 3) {
      setBookingNotice({ type: "error", text: "Enter a name with at least 3 characters." });
      return;
    }
    if (!/^(0\d{9}|\+94\d{9})$/.test(mobile)) {
      setBookingNotice({ type: "error", text: "Enter a valid Sri Lankan mobile number." });
      return;
    }
    if (!Number.isInteger(places) || places < 1) {
      setBookingNotice({ type: "error", text: "Request at least one place." });
      return;
    }
    const free = Math.max(0, centre.capacity - centre.occupancy);
    if (places > free) {
      setBookingNotice({ type: "error", text: `${centre.name} has only ${free} place${free === 1 ? "" : "s"} available.` });
      return;
    }
    void fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...booking, centreName: centre.name, places }) }).then(async (response) => {
      if (!response.ok) throw new Error((await response.json()).error || "Booking could not be saved.");
      setCentres((current) => current.map((item) => item.name === centre.name ? { ...item, occupancy: item.occupancy + places } : item));
      setBookingCentre(null);
      setBooking(emptyBooking);
      setBookingNotice({ type: "success", text: `${places} place${places === 1 ? "" : "s"} booked at ${centre.name}.` });
    }).catch((error: unknown) => setBookingNotice({ type: "error", text: error instanceof Error ? error.message : "Booking could not be saved." }));
  }

  return <>
    <section id="water-reports" className="mt-16 scroll-mt-24">
      <h2 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-slate-50">Community water reports</h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">Share what you can see on the ground so neighbours and responders have a clearer picture.</p>
      <form onSubmit={submit} noValidate className="mt-5 grid gap-5 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <Field label="Reporter name" id="report-name" error={errors.name}><input className={controlClass} id="report-name" value={form.name} onChange={(e) => updateField("name", e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? "report-name-error" : undefined} /></Field>
        <Field label="Mobile number" id="report-mobile" error={errors.mobile}><input className={controlClass} id="report-mobile" inputMode="tel" placeholder="077 123 4567" value={form.mobile} onChange={(e) => updateField("mobile", e.target.value)} aria-invalid={!!errors.mobile} aria-describedby={errors.mobile ? "report-mobile-error" : undefined} /></Field>
        <Field label="District" id="report-district" error={errors.district}><select className={controlClass} id="report-district" value={form.district} onChange={(e) => updateField("district", e.target.value)} aria-invalid={!!errors.district} aria-describedby={errors.district ? "report-district-error" : undefined}><option value="">Select district</option>{DISTRICTS.map((district) => <option key={district.id}>{district.name}</option>)}</select></Field>
        <Field label="Town or area" id="report-town" error={errors.town}><input className={controlClass} id="report-town" placeholder="e.g. Kelaniya" value={form.town} onChange={(e) => updateField("town", e.target.value)} aria-invalid={!!errors.town} aria-describedby={errors.town ? "report-town-error" : undefined} /></Field>
        <Field label="Observed water depth" id="report-depth" error={errors.depth}><select className={controlClass} id="report-depth" value={form.depth} onChange={(e) => updateField("depth", e.target.value)} aria-invalid={!!errors.depth} aria-describedby={errors.depth ? "report-depth-error" : undefined}><option value="">Select depth</option>{DEPTHS.map((depth) => <option key={depth.value} value={depth.value}>{depth.label}</option>)}</select></Field>
        <div className="sm:col-span-2"><Field label={`Description (${form.description.length}/300)`} id="report-description" error={errors.description}><textarea className={`${controlClass} min-h-28 resize-y`} id="report-description" placeholder="Describe where the water is and how deep it is..." value={form.description} onChange={(e) => updateField("description", e.target.value)} aria-invalid={!!errors.description} aria-describedby={errors.description ? "report-description-error" : undefined} /></Field></div>
        <div className="flex flex-wrap items-center gap-4 sm:col-span-2"><button type="submit" className="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40">Submit report</button>{message && <p role={message.type === "error" ? "alert" : "status"} className={`text-sm font-medium ${message.type === "error" ? "text-red-700 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}`}>{message.text}</p>}</div>
      </form>
      <div className="mt-5"><label htmlFor="report-search" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Search submitted reports</label><input id="report-search" type="search" value={reportSearch} onChange={(event) => setReportSearch(event.target.value)} placeholder="Search by town, district, or reporter name..." className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" /><p className="mt-2 text-xs text-slate-500" aria-live="polite">Showing {visibleReports.length} report{visibleReports.length === 1 ? "" : "s"}</p></div>
      <div className="mt-3 space-y-3">{visibleReports.length ? visibleReports.map((report) => <article key={report.createdAt} className="rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex flex-wrap justify-between gap-2 font-semibold text-slate-900 dark:text-slate-100"><span>{report.town}, {report.district} · {DEPTHS.find((depth) => depth.value === report.depth)?.label}</span><time dateTime={report.createdAt}>{new Intl.DateTimeFormat("en-LK", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Colombo" }).format(new Date(report.createdAt))}</time></div><p className="mt-1 text-slate-600 dark:text-slate-300">{report.description}</p><p className="mt-2 text-xs text-slate-500">Reported by {report.name}</p></article>) : reportSearch.trim() ? <p className="text-sm text-slate-500">No reports found matching your search.</p> : <p className="text-sm text-slate-500">No community reports yet.</p>}</div>
    </section>
    <section id="safe-centres" className="mt-16 scroll-mt-24">
      <h2 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-slate-50">Safe centre availability</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_12rem_auto]"><input aria-label="Search safe centres" placeholder="Search name, town or type" value={centreQuery} onChange={(e) => setCentreQuery(e.target.value)} /><select aria-label="Filter by district" value={centreDistrict} onChange={(e) => setCentreDistrict(e.target.value)}><option>All districts</option>{[...new Set(centres.map((centre) => centre.district))].map((district) => <option key={district}>{district}</option>)}</select><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={spaceOnly} onChange={(e) => setSpaceOnly(e.target.checked)} /> Has space</label></div>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{filteredCentres.length} centres matching · {filteredCentres.reduce((total, centre) => total + Math.max(0, centre.capacity - centre.occupancy), 0)} places free</p>
      {bookingNotice && <div role="alert" className={`mt-4 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${bookingNotice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}><span>{bookingNotice.text}</span><button type="button" aria-label="Dismiss booking notification" onClick={() => setBookingNotice(null)} className="font-bold">×</button></div>}
      <div className="mt-4 grid gap-4 md:grid-cols-2">{filteredCentres.length ? filteredCentres.map((centre) => { const free = Math.max(0, centre.capacity - centre.occupancy); const percentage = Math.min(100, Math.round((centre.occupancy / centre.capacity) * 100)); return <article key={centre.name} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex justify-between gap-3"><div><h3 className="font-semibold text-slate-900 dark:text-slate-100">{centre.name}</h3><p className="text-sm text-slate-500">{centre.type} · {centre.town}, {centre.district}</p></div><a className="text-sm font-medium text-sky-700" href={`tel:${centre.phone}`}>{centre.phone}</a></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200"><div className={`h-full ${percentage === 100 ? "bg-red-600" : "bg-emerald-500"}`} style={{ width: `${percentage}%` }} /></div><div className="mt-2 flex justify-between text-xs text-slate-500"><span>{percentage}% occupied</span><strong className={free ? "text-emerald-700" : "text-red-700"}>{free ? `${free} places free` : "Full"}</strong></div>{free > 0 && <>{bookingCentre === centre.name ? <form onSubmit={(event) => submitBooking(event, centre)} className="mt-4 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2 dark:border-slate-700"><label className="block text-xs font-medium text-slate-700 dark:text-slate-200">Booking name<input className={controlClass} required placeholder="Full name" value={booking.name} onChange={(event) => setBooking({ ...booking, name: event.target.value })} /></label><label className="block text-xs font-medium text-slate-700 dark:text-slate-200">Mobile number<input className={controlClass} required inputMode="tel" placeholder="077 123 4567" value={booking.mobile} onChange={(event) => setBooking({ ...booking, mobile: event.target.value })} /></label><label className="block text-xs font-medium text-slate-700 dark:text-slate-200">Places requested<input className={controlClass} required min="1" max={free} type="number" value={booking.places} onChange={(event) => setBooking({ ...booking, places: event.target.value })} /></label><div className="flex items-end gap-2 sm:col-span-2"><button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">Confirm booking</button><button type="button" onClick={() => { setBookingCentre(null); setBookingNotice(null); }} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</button></div></form> : <button type="button" onClick={() => { setBookingCentre(centre.name); setBookingNotice(null); }} className="mt-4 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700">Book a place</button>}</>}</article>; }) : <p className="text-sm text-slate-500">No safe centres match these filters.</p>}</div>
    </section>
  </>;
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) { return <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">{label}{children}{error && <span id={`${id}-error`} className="mt-1.5 block text-xs font-normal leading-5 text-red-600 dark:text-red-400">{error}</span>}</label>; }