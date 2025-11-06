import BookingCalendar from "@/components/BookingCalendar";
import ContentBlock from "@/components/ContentBlock";

export default function BuchungPage() {
  return (
    <div className="grid gap-6">
      <div className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-lg p-6 shadow-md">
        <h1 className="text-2xl font-semibold">Buchungskalender</h1>
        <ContentBlock
          id="buchung-hinweis"
          defaultText="Wählen Sie Ihren gewünschten Zeitraum aus. Reservierte Tage sind deaktiviert. Diese Demo speichert Buchungen lokal im Browser. Für echte Buchungen kontaktieren Sie uns bitte über das Formular."
          className="mt-2 text-zinc-700"
        />
      </div>
      <div className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-lg p-6 shadow-md">
        <BookingCalendar />
      </div>
    </div>
  );
}