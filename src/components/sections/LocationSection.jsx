import { Navigation, CalendarPlus } from "lucide-react";
import { EVENT_CONFIG } from "../../utils/api";

export default function LocationSection() {
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(EVENT_CONFIG.name + " - " + EVENT_CONFIG.organization)}&dates=20260402T050000Z/20260402T080000Z&details=${encodeURIComponent("Ketentuan Pakaian: " + EVENT_CONFIG.dressCode)}&location=${encodeURIComponent(EVENT_CONFIG.location + ", " + EVENT_CONFIG.address)}`;

  return (
    <section id="lokasi" className="py-24 sm:py-32 px-4 sm:px-6 bg-paper-white relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-line to-transparent opacity-50" />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink-faint mb-4">
            Petunjuk Arah
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight">
            Lokasi Pelaksanaan
          </h2>
        </div>

        {/* Unified Map & Address Card */}
        <div className="rounded-[32px] overflow-hidden border border-line bg-paper shadow-sm">
          {/* Map */}
          <div className="relative h-[300px] sm:h-[480px] w-full bg-paper-white">
            <iframe
              src={EVENT_CONFIG.mapsEmbedUrl}
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Peta lokasi acara"
            />
          </div>

          {/* Address + Actions (Flush with map) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 bg-paper-white border-t border-line">
            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-bold text-ink tracking-tight mb-2">{EVENT_CONFIG.location}</h3>
              <p className="text-[15px] sm:text-base text-ink-muted leading-relaxed max-w-lg">{EVENT_CONFIG.address}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <a
                href={calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto h-14 sm:h-auto inline-flex items-center justify-center gap-2 px-6 sm:py-3.5 text-[15px] font-bold rounded-2xl sm:rounded-full bg-paper border border-line text-ink hover:border-ink hover:text-ink transition-all active:scale-[0.98]"
              >
                <CalendarPlus size={18} className="text-ink" />
                Tambahkan ke Kalender
              </a>
              <a
                href={EVENT_CONFIG.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto h-14 sm:h-auto inline-flex items-center justify-center gap-2 px-8 sm:py-3.5 text-[15px] font-bold text-white bg-accent rounded-2xl sm:rounded-full hover:bg-accent-dark transition-transform active:scale-[0.98] shadow-lg shadow-accent/20"
              >
                <Navigation size={18} />
                Buka di Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
