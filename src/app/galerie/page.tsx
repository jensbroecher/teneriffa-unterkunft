import Gallery from "@/components/Gallery";

const photos = [
  "/stadt_und_landschaften/Kleinstadt.png",
  "/stadt_und_landschaften/Strand.png",
  "/stadt_und_landschaften/hafen.png",
  "/stadt_und_landschaften/wandern.png",
];

export default function GaleriePage() {
  return (
    <div className="w-full space-y-6">
      <Gallery photos={photos} />
    </div>
  );
}