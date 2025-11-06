"use client";
import Link from "next/link";
import { useEditMode } from "@/components/EditModeContext";
import { useState } from "react";

export default function Footer() {
  const { editMode, toggle, setEditMode, isAuthenticated, authenticate } = useEditMode();
  const [error, setError] = useState<string | null>(null);
  return (
    <footer className="mt-6 border-t border-zinc-900/30 bg-black/30 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-4 grid gap-3 sm:grid-cols-3 text-zinc-300">
        <div>
          <h3 className="font-semibold text-zinc-100">Casa Tenerife</h3>
          <p className="mt-1 text-sm">Ferienunterkunft mit Meerblick.</p>
          <div className="mt-2 text-sm">
            {editMode ? (
              <button
                onClick={toggle}
                className="underline underline-offset-2 hover:text-zinc-100"
                title="Bearbeitungsmodus deaktivieren"
              >
                Bearbeitung deaktivieren
              </button>
            ) : (
              <button
                onClick={async () => {
                  setError(null);
                  if (isAuthenticated) {
                    setEditMode(true);
                    return;
                  }
                  const pw = prompt("Passwort für Bearbeitungsmodus:") ?? "";
                  if (!pw) return;
                  const ok = await authenticate(pw);
                  if (ok) {
                    setEditMode(true);
                  } else {
                    setError("Falsches Passwort.");
                  }
                }}
                className="underline underline-offset-2 hover:text-zinc-100"
                title="Bearbeitungsmodus aktivieren"
              >
                Bearbeitung aktivieren
              </button>
            )}
            {error && <div className="mt-1 text-xs text-red-300">{error}</div>}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-zinc-100">Rechtliches</h3>
          <ul className="mt-1 space-y-1 text-sm">
            <li><Link href="/impressum" className="hover:underline hover:text-zinc-100">Impressum</Link></li>
            <li><Link href="/datenschutz" className="hover:underline hover:text-zinc-100">Datenschutz</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-zinc-100">Folge uns</h3>
          <div className="mt-1 flex gap-3 text-sm">
            <a href="https://instagram.com/" target="_blank" className="hover:underline hover:text-zinc-100" rel="noreferrer">Instagram</a>
            <a href="https://facebook.com/" target="_blank" className="hover:underline hover:text-zinc-100" rel="noreferrer">Facebook</a>
            <a href="https://x.com/" target="_blank" className="hover:underline hover:text-zinc-100" rel="noreferrer">X</a>
          </div>
        </div>
      </div>
    </footer>
  );
}