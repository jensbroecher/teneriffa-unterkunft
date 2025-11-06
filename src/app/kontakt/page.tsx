"use client";
import React, { useState } from "react";
import ModalDialog from "@/components/ModalDialog";

export default function KontaktPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("Fehler beim Senden");
      setStatus("sent");
      setDialogOpen(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message ?? "Unbekannter Fehler");
      setDialogOpen(true);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-lg p-6 shadow-md">
        <h1 className="text-2xl font-semibold">Kontakt</h1>
        <p className="mt-2 text-zinc-700">Bei Fragen oder Buchungsanfragen schreiben Sie uns gerne.</p>
      </div>
      <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border border-white/20 bg-white/40 backdrop-blur-lg p-6 shadow-md">
        <label className="grid gap-1">
          <span className="text-sm text-zinc-600">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded border border-white/40 bg-white/70 p-2 text-zinc-900 placeholder:text-zinc-600"
            placeholder="Ihr Name"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-zinc-600">E‑Mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded border border-white/40 bg-white/70 p-2 text-zinc-900 placeholder:text-zinc-600"
            placeholder="ihre@mailadresse.de"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-zinc-600">Nachricht</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
            className="rounded border border-white/40 bg-white/70 p-2 text-zinc-900 placeholder:text-zinc-600"
            placeholder="Ihre Nachricht"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
          >
            {status === "sending" ? "Senden…" : "Absenden"}
          </button>
          {status === "sent" && <span className="text-emerald-600">Nachricht gesendet!</span>}
          {status === "error" && <span className="text-red-600">Fehler: {errorMsg}</span>}
        </div>
      </form>
      <div className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-lg p-4 text-sm text-zinc-700 shadow-md">
        Hinweis: Ihre Nachricht wird serverseitig als JSON gespeichert und im Adminbereich angezeigt.
      </div>
      <ModalDialog
        open={dialogOpen}
        kind={status === "error" ? "error" : "success"}
        title={status === "error" ? "Fehler beim Senden" : "Nachricht gesendet"}
        message={status === "error" ? (errorMsg ?? "Bitte versuchen Sie es erneut.") : "Vielen Dank! Wir melden uns schnellstmöglich."}
        onClose={() => {
          setDialogOpen(false);
          if (status !== "sending") setStatus("idle");
        }}
      />
    </div>
  );
}