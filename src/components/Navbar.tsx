"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Start" },
  { href: "/unterkunft", label: "Unterkunft" },
  { href: "/lage", label: "Lage" },
  { href: "/galerie", label: "Galerie" },
  { href: "/buchung", label: "Buchung" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-white/30 bg-white/60 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight text-zinc-900">
            Casa Tenerife
          </Link>
          <button
            className="sm:hidden rounded px-3 py-2 text-sm bg-white/70 text-zinc-900 border border-white/30"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menü öffnen"
          >
            Menü
          </button>
          <nav className="hidden sm:flex items-center gap-2 text-sm text-zinc-900">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded px-3 py-2 hover:bg-white/70 ${pathname === l.href ? "bg-white/70" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        {open && (
          <nav className="mt-3 sm:hidden flex flex-col gap-2 text-sm text-zinc-900">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded px-3 py-2 ${pathname === l.href ? "bg-white/80" : "bg-white/70 hover:bg-white/80"}`}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}