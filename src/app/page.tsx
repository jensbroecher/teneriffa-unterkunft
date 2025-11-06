import Image from "next/image";
import Link from "next/link";
import ContentBlock from "@/components/ContentBlock";

export default function Home() {
  return (
    <div className="grid gap-8">
      <section className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-lg p-8 shadow-md">
        <h1 className="text-3xl font-semibold text-zinc-900">Casa Tenerife</h1>
        <p className="mt-2 max-w-2xl text-zinc-700">
          Gemütliche Ferienunterkunft auf Teneriffa – ideal für Sonne, Meer und
          Erholung.
        </p>
        <div className="mt-6 flex gap-3">
          <Link className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700" href="/buchung">
            Zum Buchungskalender
          </Link>
          <Link className="rounded border border-white/30 bg-white/60 px-4 py-2 text-zinc-900 hover:bg-white/70" href="/unterkunft">
            Mehr zur Unterkunft
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold">Willkommen</h2>
          <ContentBlock
            id="home-welcome"
            defaultText="Willkommen in unserer Ferienunterkunft auf Teneriffa. Die Lage ist hervorragend für Ausflüge in die Natur, entspannte Strandtage und kulinarische Erlebnisse."
            as="p"
            className="mt-2 text-zinc-700"
          />
        </div>
        <div className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold">Ausstattung</h2>
          <ContentBlock
            id="home-features"
            defaultText="Helle Räume, voll ausgestattete Küche, Terrasse mit Meerblick, schnelles WLAN und ein komfortables Schlafzimmer. Perfekt für Paare, Solo-Reisende oder Remote-Worker."
            as="p"
            className="mt-2 text-zinc-700"
          />
        </div>
      </section>
    </div>
  );
}
