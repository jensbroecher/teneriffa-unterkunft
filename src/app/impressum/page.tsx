import ContentBlock from "@/components/ContentBlock";

export default function ImpressumPage() {
  return (
    <section className="rounded-xl border border-white/30 bg-white/60 p-6 backdrop-blur-md">
      <h1 className="text-2xl font-semibold text-zinc-900">Impressum</h1>
      <ContentBlock
        id="legal_impressum"
        as="p"
        className="mt-3 text-zinc-800"
        defaultText="Bitte hier die Impressum-Informationen einfügen."
      />
    </section>
  );
}