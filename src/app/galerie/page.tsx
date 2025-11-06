import Image from "next/image";

const photos = [
  "/stadt_und_landschaften/Kleinstadt.png",
  "/stadt_und_landschaften/Strand.png",
  "/stadt_und_landschaften/hafen.png",
  "/stadt_und_landschaften/wandern.png",
];

export default function GaleriePage() {
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Galerie</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {photos.map((src, i) => (
          <div key={i} className="relative h-56 overflow-hidden rounded-lg border border-zinc-200">
            <Image src={src} alt={`Teneriffa Bild ${i + 1}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" referrerPolicy="no-referrer" />
          </div>
        ))}
      </div>
    </div>
  );
}