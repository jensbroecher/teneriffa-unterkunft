"use client";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useEffect, useMemo, useState } from "react";
import { eachDayOfInterval } from "date-fns";
import { useEditMode } from "@/components/EditModeContext";
import ModalDialog from "@/components/ModalDialog";

type Range = { start: string; end: string };
type Booking = {
  name: string;
  email?: string;
  phone?: string;
  persons: number;
  start: string;
  end: string;
};
type Contact = {
  name: string;
  email: string;
  message: string;
  date?: string;
};
type Pricing = {
  basePerNight: number;
  includedPersons: number;
  extraPersonPerNight: number;
  cleaningFee: number;
};

function toDate(v: string) {
  return new Date(v);
}

export default function AdminPage() {
  const { isAuthenticated, authenticate, setEditMode, logout } = useEditMode();
  const [password, setPassword] = useState("");
  const [unavailable, setUnavailable] = useState<Range[]>([]);
  const [selection, setSelection] = useState<Date | [Date, Date] | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [dialog, setDialog] = useState<{ open: boolean; kind?: "info" | "success" | "error" | "warning"; title?: string; message?: string }>({ open: false, kind: "info" });

  useEffect(() => {
    // Load unavailable from server JSON
    fetch("/api/admin/unavailable")
      .then((r) => r.json())
      .then((d) => setUnavailable(d?.unavailable ?? []))
      .catch(() => {});
    // Load bookings from server JSON
    fetch("/api/admin/bookings")
      .then((r) => r.json())
      .then((d) => setBookings(d?.bookings ?? []))
      .catch(() => {});
    // Load contacts from server JSON
    fetch("/api/admin/contacts")
      .then((r) => r.json())
      .then((d) => setContacts(d?.contacts ?? []))
      .catch(() => {});
    // Load pricing from server JSON
    fetch("/api/admin/pricing")
      .then((r) => r.json())
      .then((d) => setPricing(d?.pricing ?? null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    // keep UI reactive only; server storage happens via API calls
  }, [unavailable]);

  const unavailableDates = useMemo(() => {
    return unavailable.flatMap((r) =>
      eachDayOfInterval({ start: toDate(r.start), end: toDate(r.end) })
    );
  }, [unavailable]);

  const tileDisabled = ({ date }: { date: Date }) => {
    const dstr = date.toDateString();
    return unavailableDates.some((d) => d.toDateString() === dstr);
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const dstr = date.toDateString();
    if (unavailableDates.some((d) => d.toDateString() === dstr)) return "unavailable";
    return undefined as any;
  };

  const addUnavailable = async () => {
    if (!Array.isArray(selection)) return;
    const [s, e] = selection;
    try {
      const res = await fetch("/api/admin/unavailable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start: s.toISOString(), end: e.toISOString() }),
      });
      const data = await res.json();
      setUnavailable(data?.unavailable ?? unavailable);
      setSelection(null);
    } catch {}
  };

  const removeUnavailable = async (i: number) => {
    try {
      const res = await fetch("/api/admin/unavailable", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index: i }),
      });
      const data = await res.json();
      setUnavailable(data?.unavailable ?? unavailable);
    } catch {}
  };

  const savePricing = async () => {
    if (!pricing) return;
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pricing),
      });
      if (!res.ok) throw new Error("Speichern fehlgeschlagen");
    } catch (e) {
      setDialog({
        open: true,
        kind: "error",
        title: "Fehler beim Speichern",
        message: (e as any)?.message || "Bitte später erneut versuchen.",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="grid gap-6">
        <div className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-lg p-6 shadow-md">
          <h1 className="text-2xl font-semibold">Adminbereich</h1>
          <p className="mt-2 text-zinc-700">Bitte Passwort eingeben, um den Adminbereich zu öffnen.</p>
          <div className="mt-4 flex gap-2">
            <input
              type="password"
              className="rounded border border-white/40 bg-white/70 p-2 text-zinc-900"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
              onClick={async () => {
                const ok = await authenticate(password);
                if (ok) setEditMode(true);
              }}
            >
              Anmelden
            </button>
          </div>
          <p className="mt-2 text-sm text-zinc-700">Hinweis: Passwort ist „teneriffa 2026!“</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-lg p-6 shadow-md">
        <h2 className="text-xl font-semibold">Preise</h2>
        <p className="mt-1 text-sm text-zinc-700">Hier können Sie die Preisparameter für die Berechnung anpassen.</p>
        {pricing && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-sm text-zinc-600">Grundpreis pro Nacht (€)</span>
              <input
                type="number"
                min={0}
                value={pricing.basePerNight}
                onChange={(e) => setPricing({ ...pricing, basePerNight: Number(e.target.value) })}
                className="rounded border border-white/40 bg-white/70 p-2 text-zinc-900"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-zinc-600">Inklusive Personen</span>
              <input
                type="number"
                min={1}
                value={pricing.includedPersons}
                onChange={(e) => setPricing({ ...pricing, includedPersons: Number(e.target.value) })}
                className="rounded border border-white/40 bg-white/70 p-2 text-zinc-900"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-zinc-600">Zusatzperson pro Nacht (€)</span>
              <input
                type="number"
                min={0}
                value={pricing.extraPersonPerNight}
                onChange={(e) => setPricing({ ...pricing, extraPersonPerNight: Number(e.target.value) })}
                className="rounded border border-white/40 bg-white/70 p-2 text-zinc-900"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-zinc-600">Endreinigung (€)</span>
              <input
                type="number"
                min={0}
                value={pricing.cleaningFee}
                onChange={(e) => setPricing({ ...pricing, cleaningFee: Number(e.target.value) })}
                className="rounded border border-white/40 bg-white/70 p-2 text-zinc-900"
              />
            </label>
          </div>
        )}
        <div className="mt-3">
          <button
            className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
            onClick={savePricing}
            disabled={!pricing}
          >
            Preise speichern
          </button>
        </div>
      </div>
      <div className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-lg p-6 shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Adminbereich</h1>
          <button
            className="rounded bg-zinc-900 px-3 py-1 text-white hover:bg-zinc-800"
            onClick={logout}
          >
            Logout
          </button>
        </div>
        <p className="mt-2 text-zinc-700">Markieren Sie hier Zeiträume als nicht verfügbar. Diese erscheinen im Kalender in Rot und sind für Besucher nicht auswählbar.</p>
      </div>
      <div className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-lg p-6 shadow-md">
        <h2 className="text-xl font-semibold">Nicht verfügbare Tage festlegen</h2>
        <div className="mt-3">
          <Calendar
            selectRange
            onChange={(v) => setSelection(v as any)}
            value={selection as any}
            tileDisabled={tileDisabled as any}
            tileClassName={tileClassName as any}
            locale="de-DE"
            className="rounded border border-white/30 bg-transparent p-2 text-zinc-900"
          />
        </div>
        <div className="mt-3 flex gap-2">
          <button
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            onClick={addUnavailable}
            disabled={!Array.isArray(selection)}
          >
            Zeitraum als nicht verfügbar markieren
          </button>
        </div>
        <div className="mt-4 rounded border border-zinc-200 p-4">
          <h3 className="font-semibold">Nicht verfügbare Zeiträume</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-zinc-700">
            {unavailable.length === 0 && <li>Keine Einträge.</li>}
            {unavailable.map((r, i) => (
              <li key={i} className="flex items-center gap-3">
                <span>
                  {toDate(r.start).toLocaleDateString()} – {toDate(r.end).toLocaleDateString()}
                </span>
                <button
                  className="rounded border border-white/40 bg-white/70 px-2 py-1 text-zinc-900 hover:bg-white/80"
                  onClick={() => removeUnavailable(i)}
                >
                  Entfernen
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-lg p-6 shadow-md">
        <h2 className="text-xl font-semibold">Buchungen</h2>
        <p className="mt-1 text-sm text-zinc-700">Diese Liste zeigt serverseitig gespeicherte Buchungsanfragen aus dem Formular.</p>
        <div className="mt-3 rounded border border-zinc-200 p-4">
          <ul className="space-y-2 text-sm text-zinc-800">
            {bookings.length === 0 && <li>Keine Buchungen vorhanden.</li>}
            {bookings.map((b, i) => (
              <li key={i} className="rounded bg-white/70 p-2">
                <div className="font-semibold">{b.name} ({b.persons} Personen)</div>
                <div>
                  Zeitraum: {toDate(b.start).toLocaleDateString()} – {toDate(b.end).toLocaleDateString()}
                </div>
                <div>E‑Mail: {b.email || "—"} · Telefon: {b.phone || "—"}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-lg p-6 shadow-md">
        <h2 className="text-xl font-semibold">Kontaktanfragen</h2>
        <p className="mt-1 text-sm text-zinc-700">Anfragen aus dem Kontaktformular, serverseitig als JSON gespeichert.</p>
        <div className="mt-3 rounded border border-zinc-200 p-4">
          <ul className="space-y-2 text-sm text-zinc-800">
            {contacts.length === 0 && <li>Keine Kontaktanfragen vorhanden.</li>}
            {contacts.map((c, i) => (
              <li key={i} className="rounded bg-white/70 p-2">
                <div className="font-semibold">{c.name} · {c.email}</div>
                {c.date && (
                  <div className="text-xs text-zinc-600">Eingegangen am {new Date(c.date).toLocaleString()}</div>
                )}
                <div className="mt-1 whitespace-pre-wrap">{c.message}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ModalDialog
        open={dialog.open}
        kind={dialog.kind as any}
        title={dialog.title}
        message={dialog.message}
        onClose={() => setDialog({ open: false })}
      />
    </div>
  );
}