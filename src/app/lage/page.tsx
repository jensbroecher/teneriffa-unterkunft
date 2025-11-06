import ContentBlock from "@/components/ContentBlock";
import Link from "next/link";

export default function LagePage() {
  return (
    <div className="grid gap-6">
      <div className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-lg p-6 shadow-md">
        <h1 className="text-2xl font-semibold">Lage</h1>
        <ContentBlock
          id="lage-text"
          defaultText="Die Unterkunft liegt in einer ruhigen Gegend, nur wenige Minuten vom Meer entfernt. Restaurants, Supermärkte und Wanderwege sind bequem erreichbar."
          className="mt-2 text-zinc-700"
        />
      </div>
      <div className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-lg p-6 shadow-md">
        <p>Zur Orientierung nutzen Sie die Karte:</p>
        <div className="mt-3 overflow-hidden rounded-lg border border-white/20 shadow-sm">
          <div className="relative h-[360px] w-full">
            <iframe
              title="Google Maps Karte – Lage der Unterkunft"
              className="absolute left-0 top-0 h-full w-full"
              src="https://maps.google.com/maps?q=Tenerife&z=11&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            ></iframe>
          </div>
        </div>
        <p className="mt-2 text-sm text-zinc-700">Tipp: Adresse im Link anpassen, z. B. <code>q=Deine+Adresse</code>.</p>
        <Link
          className="mt-2 inline-block rounded bg-zinc-900 px-4 py-2 text-white"
          href="https://www.google.com/maps/search/Tenerife" target="_blank"
        >
          Google Maps öffnen
        </Link>
      </div>
    </div>
  );
}