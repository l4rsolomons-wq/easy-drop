/** South African localisation helpers — ZAR, 24-hour time, km/kg/litres/kWh. */
export const zar = (n, decimals = 0) => "R" +
    (Math.round(n * 100) / 100).toLocaleString("en-ZA", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
export const zarCompact = (n) => {
    if (Math.abs(n) >= 1_000_000)
        return "R" + (n / 1_000_000).toFixed(2) + "m";
    if (Math.abs(n) >= 10_000)
        return "R" + Math.round(n / 1000) + "k";
    return zar(n);
};
export const num = (n, decimals = 0) => n.toLocaleString("en-ZA", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
export const pct = (n, decimals = 0) => `${n.toFixed(decimals)}%`;
export const km = (n, decimals = 0) => `${num(n, decimals)} km`;
export const kg = (n, decimals = 1) => `${num(n, decimals)} kg`;
/** 24-hour clock, e.g. 14:35 */
export const time24 = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return iso;
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
export const dateSA = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return iso;
    return d.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
};
export const dateShort = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return iso;
    return d.toLocaleDateString("en-ZA", { day: "2-digit", month: "short" });
};
export const dateTimeSA = (iso) => `${dateSA(iso)} · ${time24(iso)}`;
export const relTime = (iso, now = new Date()) => {
    const d = new Date(iso).getTime();
    const diff = Math.round((now.getTime() - d) / 60000);
    if (Number.isNaN(diff))
        return iso;
    if (diff < 1)
        return "just now";
    if (diff < 60)
        return `${diff} min ago`;
    const hrs = Math.round(diff / 60);
    if (hrs < 24)
        return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
    const days = Math.round(hrs / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
};
export const todayISO = () => new Date().toISOString().slice(0, 10);
export const addDays = (isoDate, days) => {
    const d = new Date(isoDate + "T00:00:00");
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
};
export const daysUntil = (isoDate) => {
    const d = new Date(isoDate + "T00:00:00").getTime();
    const t = new Date(todayISO() + "T00:00:00").getTime();
    return Math.round((d - t) / 86400000);
};
export const initials = (name) => name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
/** Deterministic pseudo-random generator so the demo seeds identically each load. */
export const mulberry32 = (seed) => {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};
export const pick = (rand, arr) => arr[Math.floor(rand() * arr.length)];
export const randInt = (rand, min, max) => Math.floor(rand() * (max - min + 1)) + min;
export const csvEscape = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export const downloadCSV = (filename, rows) => {
    if (!rows.length)
        return;
    const headers = Object.keys(rows[0]);
    const csv = [
        headers.join(","),
        ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};
