"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  photos: string[];
};

export default function Gallery({ photos }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Keyboard controls for viewer
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (openIndex === null) return;
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight") setOpenIndex((i) => (i === null ? null : (i + 1) % photos.length));
      if (e.key === "ArrowLeft") setOpenIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, photos.length]);

  return (
    <div className="flex w-full flex-wrap gap-6 justify-center">
      {photos.map((src, i) => (
        <button
          key={i}
          onClick={() => setOpenIndex(i)}
          className="block relative w-[360px] sm:w-[420px] md:w-[480px] h-[240px] sm:h-[280px] md:h-[320px] overflow-hidden rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          aria-label={`Bild ${i + 1} vergrößern`}
        >
          <Image
            src={src}
            alt={`Teneriffa Bild ${i + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 360px, (max-width: 768px) 420px, 480px"
            referrerPolicy="no-referrer"
          />
        </button>
      ))}

      {openIndex !== null &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setOpenIndex(null)}
          >
            <div className="relative max-w-[90vw] max-h-[90vh] w-auto h-auto" onClick={(e) => e.stopPropagation()}>
              <Image
                src={photos[openIndex]}
                alt={`Teneriffa Bild ${openIndex + 1} groß`}
                width={1600}
                height={900}
                className="max-h-[90vh] w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <button
                className="absolute top-3 right-3 rounded bg-black/60 px-3 py-1 text-sm text-white hover:bg-black/70"
                onClick={() => setOpenIndex(null)}
                aria-label="Schließen"
              >
                Schließen
              </button>
              <div className="absolute inset-y-0 left-0 flex items-center">
                <button
                  className="rounded bg-black/60 px-3 py-2 text-white hover:bg-black/70"
                  onClick={() => setOpenIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length))}
                  aria-label="Vorheriges Bild"
                >
                  ◀
                </button>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center">
                <button
                  className="rounded bg-black/60 px-3 py-2 text-white hover:bg-black/70"
                  onClick={() => setOpenIndex((i) => (i === null ? null : (i + 1) % photos.length))}
                  aria-label="Nächstes Bild"
                >
                  ▶
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}