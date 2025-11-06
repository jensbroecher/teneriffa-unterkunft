import Image from "next/image";
import ContentBlock from "@/components/ContentBlock";

export default function UnterkunftPage() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-lg p-6 shadow-md">
        <h1 className="text-2xl font-semibold">Über die Unterkunft</h1>
        <ContentBlock
          id="unterkunft-beschreibung"
          defaultText="Unsere Casa auf Teneriffa kombiniert modernen Komfort mit kanarischem Flair. Die lichtdurchflutete Wohnküche führt auf eine Terrasse mit Blick auf den Atlantik."
          className="mt-3 text-zinc-700"
        />
        <ContentBlock
          id="unterkunft-details"
          defaultText="Ideal für 2 Personen. Inklusive: voll ausgestattete Küche, Waschmaschine, schnelles WLAN, ruhiges Schlafzimmer und ein stilvolles Bad."
          className="mt-2 text-zinc-700"
        />
        <h2 className="mt-6 text-xl font-semibold">Umgebung</h2>
        <ContentBlock
          id="unterkunft-umgebung"
          defaultText="Ruhige Wohnlage mit Blick ins Grüne. Strand, kleine Cafés und ein Wochenmarkt sind in wenigen Minuten erreichbar. Wanderwege starten oberhalb des Ortes und bieten spektakuläre Ausblicke."
          className="mt-2 text-zinc-700"
        />
        <h2 className="mt-6 text-xl font-semibold">Anreise</h2>
        <ContentBlock
          id="unterkunft-anreise"
          defaultText="Vom Flughafen Süd sind es ca. 45 Minuten mit dem Mietwagen. Alternativ fährt ein Linienbus bis ins Zentrum; von dort sind es etwa 10 Minuten zu Fuß. Parken ist kostenfrei in der Straße möglich."
          className="mt-2 text-zinc-700"
        />
        <h2 className="mt-6 text-xl font-semibold">Einkaufen & Gastronomie</h2>
        <ContentBlock
          id="unterkunft-einkaufen"
          defaultText="Supermarkt, Bäckerei und Apotheke liegen im Umkreis von 800 Metern. Abends empfehlen wir die Tapas‑Bars am Platz oder frischen Fisch im Hafen."
          className="mt-2 text-zinc-700"
        />
        <h2 className="mt-6 text-xl font-semibold">Aktivitäten</h2>
        <ContentBlock
          id="unterkunft-aktivitaeten"
          defaultText="Beliebt sind Küstenwanderungen, Schnorcheln in geschützten Buchten und Tagesausflüge zum Teide. Für Familien gibt es Spielplätze und ruhige Strände, für Sportliche Mountainbike‑Routen."
          className="mt-2 text-zinc-700"
        />
      </div>
      <div className="relative h-64 w-full overflow-hidden rounded-xl border border-white/20 md:h-full shadow-md">
        <Image
          src="/unterkunft/Haus am Tag.png"
          alt="Unterkunft – Haus am Tag"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  );
}