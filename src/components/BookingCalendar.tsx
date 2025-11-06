"use client";
import React, { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { addDays, eachDayOfInterval, isWithinInterval } from "date-fns";
import ModalDialog from "@/components/ModalDialog";

type Range = { start: string; end: string }; // ISO strings

function toDate(value: string) {
  return new Date(value);
}

function normalizeRange(range: [Date, Date]) {
  const [start, end] = range;
  const s = start < end ? start : end;
  const e = start < end ? end : start;
  return [s, e] as [Date, Date];
}

export default function BookingCalendar() {
  const [selection, setSelection] = useState<Date | [Date, Date] | null>(null);
  const [reservations, setReservations] = useState<Range[]>([]);
  const [unavailable, setUnavailable] = useState<Range[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [persons, setPersons] = useState<number>(2);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ open: boolean; kind?: "info" | "success" | "error" | "warning"; title?: string; message?: string }>({ open: false, kind: "info" });
  const [confirm, setConfirm] = useState<{ open: boolean; title?: string; message?: string }>({ open: false });

  const DEFAULT_PRICING = {
    basePerNight: 85,
    includedPersons: 2,
    extraPersonPerNight: 15,
    cleaningFee: 45,
  } as const;
  const [pricing, setPricing] = useState(DEFAULT_PRICING);

  const eur = (v: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(v);

  function computeCost(s: Date, e: Date) {
    const msPerDay = 24 * 60 * 60 * 1000;
    const nights = Math.max(1, Math.round((e.getTime() - s.getTime()) / msPerDay));
    const extraPersons = Math.max(0, persons - pricing.includedPersons);
    const perNight = pricing.basePerNight + extraPersons * pricing.extraPersonPerNight;
    const total = nights * perNight + pricing.cleaningFee;
    return { nights, perNight, total };
  }

  useEffect(() => {
    const raw = localStorage.getItem("reservations");
    if (raw) {
      try {
        setReservations(JSON.parse(raw));
      } catch {}
    }
    // Fetch unavailable dates from server JSON
    fetch("/api/admin/unavailable")
      .then((r) => r.json())
      .then((d) => setUnavailable(d?.unavailable ?? []))
      .catch(() => {});
    fetch("/api/admin/pricing")
      .then((r) => r.json())
      .then((d) => {
        if (d?.pricing) setPricing(d.pricing);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem("reservations", JSON.stringify(reservations));
  }, [reservations]);

  const reservedDates = useMemo(() => {
    return reservations.flatMap((r) =>
      eachDayOfInterval({ start: toDate(r.start), end: toDate(r.end) })
    );
  }, [reservations]);

  const unavailableDates = useMemo(() => {
    return unavailable.flatMap((r) =>
      eachDayOfInterval({ start: toDate(r.start), end: toDate(r.end) })
    );
  }, [unavailable]);

  const tileDisabled = ({ date }: { date: Date }) => {
    const dstr = date.toDateString();
    return (
      reservedDates.some((d) => d.toDateString() === dstr) ||
      unavailableDates.some((d) => d.toDateString() === dstr)
    );
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const dstr = date.toDateString();
    if (unavailableDates.some((d) => d.toDateString() === dstr)) return "unavailable";
    return undefined as any;
  };

  const addReservation = () => {
    if (Array.isArray(selection)) {
      if (!customerName.trim()) {
        setDialog({ open: true, kind: "warning", title: "Angaben fehlen", message: "Bitte geben Sie Ihren Namen an." });
        return;
      }
      if (!persons || persons < 1) {
        setDialog({ open: true, kind: "warning", title: "Angaben fehlen", message: "Bitte geben Sie die Anzahl der Personen an." });
        return;
      }
      if (!phone.trim() && !email.trim()) {
        setDialog({ open: true, kind: "warning", title: "Angaben fehlen", message: "Bitte geben Sie Telefonnummer oder E‑Mail an." });
        return;
      }
      const [s, e] = normalizeRange(selection);
      // Prevent overlap
      const overlaps = reservations.some((r) =>
        isWithinInterval(s, { start: toDate(r.start), end: toDate(r.end) }) ||
        isWithinInterval(e, { start: toDate(r.start), end: toDate(r.end) })
      );
      if (overlaps) {
        setDialog({ open: true, kind: "warning", title: "Zeitraum belegt", message: "Der Zeitraum überschneidet sich mit bestehenden Buchungen." });
        return;
      }
      setStatus("sending");
      setErrorMsg(null);
      const { nights, perNight, total } = computeCost(s, e);
      fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customerName,
          email,
          phone,
          persons,
          start: s.toISOString(),
          end: e.toISOString(),
          nights,
          perNight,
          total,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Fehler beim Senden der Buchungsanfrage");
          setReservations([...reservations, { start: s.toISOString(), end: addDays(e, 0).toISOString() }]);
          // Persist booking details for admin view
          try {
            const raw = localStorage.getItem("bookings");
            const list = raw ? JSON.parse(raw) : [];
            list.push({ name: customerName, email, phone, persons, start: s.toISOString(), end: e.toISOString() });
            localStorage.setItem("bookings", JSON.stringify(list));
          } catch {}
          setSelection(null);
          setStatus("sent");
          setDialog({ open: true, kind: "success", title: "Buchungsanfrage gesendet", message: "Vielen Dank! Wir melden uns schnellstmöglich." });
        })
        .catch((err) => {
          setStatus("error");
          setErrorMsg(err?.message ?? "Unbekannter Fehler");
          setDialog({ open: true, kind: "error", title: "Fehler", message: err?.message ?? "Bitte versuchen Sie es erneut." });
        });
    }
  };

  const clearReservations = () => {
    setConfirm({
      open: true,
      title: "Alle Reservierungen entfernen?",
      message: "Diese Aktion kann nicht rückgängig gemacht werden.",
    });
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm text-zinc-600">Ihr Name</span>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="rounded border border-white/40 bg-white/70 p-2 text-zinc-900 placeholder:text-zinc-600"
            placeholder="Name des Buchenden"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-zinc-600">Personen</span>
          <input
            type="number"
            min={1}
            value={persons}
            onChange={(e) => setPersons(parseInt(e.target.value || "1", 10))}
            className="rounded border border-white/40 bg-white/70 p-2 text-zinc-900"
            placeholder="Anzahl Personen"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-zinc-600">Telefonnummer</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded border border-white/40 bg-white/70 p-2 text-zinc-900 placeholder:text-zinc-600"
            placeholder="Ihre Telefonnummer"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-zinc-600">E‑Mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-white/40 bg-white/70 p-2 text-zinc-900 placeholder:text-zinc-600"
            placeholder="ihre@mailadresse.de"
          />
        </label>
      </div>
      <Calendar
        selectRange
        onChange={(v) => setSelection(v as any)}
        value={selection as any}
        tileDisabled={tileDisabled as any}
        tileClassName={tileClassName as any}
        locale="de-DE"
        className="rounded border border-white/30 bg-transparent p-2 text-zinc-900"
      />
      <div className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-lg p-4 text-sm text-zinc-800 shadow-md">
        <h3 className="mb-2 text-base font-semibold">Preisliste</h3>
        <ul className="list-disc pl-5">
          <li>Grundpreis: {eur(pricing.basePerNight)} pro Nacht (inkl. {pricing.includedPersons} Personen)</li>
          <li>Zusatzperson: +{eur(pricing.extraPersonPerNight)} pro Nacht ab Person {pricing.includedPersons + 1}</li>
          <li>Endreinigung: {eur(pricing.cleaningFee)} einmalig</li>
        </ul>
      </div>
      {Array.isArray(selection) && (
        (() => {
          const [s, e] = normalizeRange(selection);
          const msPerDay = 24 * 60 * 60 * 1000;
          const nights = Math.max(1, Math.round((e.getTime() - s.getTime()) / msPerDay));
          const extraPersons = Math.max(0, persons - pricing.includedPersons);
          const perNight = pricing.basePerNight + extraPersons * pricing.extraPersonPerNight;
          const total = nights * perNight + pricing.cleaningFee;
          return (
            <div className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-lg p-4 text-sm text-zinc-800 shadow-md">
              <h3 className="mb-2 text-base font-semibold">Kostenübersicht</h3>
              <div className="grid grid-cols-2 gap-2">
                <span>Nächte</span>
                <span className="text-right">{nights}</span>
                <span>Personen</span>
                <span className="text-right">{persons}</span>
                <span>Preis pro Nacht</span>
                <span className="text-right">{eur(perNight)}</span>
                <span>Endreinigung</span>
                <span className="text-right">{eur(pricing.cleaningFee)}</span>
                <span className="font-semibold">Gesamtkosten</span>
                <span className="text-right font-semibold">{eur(total)}</span>
              </div>
            </div>
          );
        })()
      )}
      <div className="flex gap-2 items-center">
        <div className="text-sm text-zinc-800">
          <span className="inline-block rounded bg-red-600 px-2 py-1 text-white mr-2">Rot</span>
          bedeutet: nicht verfügbar
        </div>
        <button
          onClick={addReservation}
          className="rounded bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-white font-semibold shadow-md disabled:bg-emerald-300"
          disabled={!Array.isArray(selection) || status === "sending"}
        >
          {status === "sending" ? "Wird gesendet…" : "Zeitraum buchen"}
        </button>
        <button onClick={clearReservations} className="rounded border border-white/40 bg-white/70 px-4 py-2 text-zinc-900 hover:bg-white/80">
          Reservierungen löschen
        </button>
      </div>
      {status === "sent" && (
        <div className="text-emerald-700">Buchungsanfrage gesendet!</div>
      )}
      {status === "error" && (
        <div className="text-red-600">Fehler: {errorMsg}</div>
      )}
      <div className="rounded border border-zinc-200 p-4">
        <h3 className="font-semibold">Bestehende Reservierungen</h3>
        <ul className="mt-2 list-disc pl-5 text-sm text-zinc-700">
          {reservations.length === 0 && <li>Keine Reservierungen vorhanden.</li>}
          {reservations.map((r, i) => (
            <li key={i}>
              {toDate(r.start).toLocaleDateString()} – {toDate(r.end).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </div>
      <ModalDialog
        open={dialog.open}
        kind={dialog.kind as any}
        title={dialog.title}
        message={dialog.message}
        onClose={() => setDialog({ open: false })}
      />
      <ModalDialog
        open={confirm.open}
        kind="warning"
        title={confirm.title}
        message={confirm.message}
        actions={[
          { label: "Abbrechen", onClick: () => setConfirm({ open: false }), variant: "secondary" },
          { label: "Ja, löschen", onClick: () => { setReservations([]); setConfirm({ open: false }); }, variant: "danger" },
        ]}
      />
    </div>
  );
}