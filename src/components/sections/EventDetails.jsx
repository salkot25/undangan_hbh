import { Calendar, Clock, MapPin, Shirt } from "lucide-react";
import { EVENT_CONFIG } from "../../utils/api";

const details = [
  {
    icon: Calendar,
    label: "Tanggal",
    value: new Date(`${EVENT_CONFIG.date}T00:00:00`).toLocaleDateString(
      "id-ID",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      },
    ),
  },
  { icon: Clock, label: "Waktu", value: `${EVENT_CONFIG.time} WIB — Selesai` },
  { icon: MapPin, label: "Tempat", value: EVENT_CONFIG.location },
  { icon: Shirt, label: "Ketentuan Pakaian", value: EVENT_CONFIG.dressCode },
];

export default function EventDetails() {
  return (
    <section
      id="details"
      className="py-24 sm:py-32 px-6 bg-paper-white relative"
    >
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-line to-transparent opacity-50" />
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="mb-12 sm:mb-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink-faint mb-4">
            Detail Pelaksanaan
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight max-w-xl">
            Informasi Pelaksanaan Acara
          </h2>
        </div>

        {/* Detail cards - vertical list on mobile, grid on sm+ */}
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 sm:gap-6">
          {details.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="group relative flex items-start sm:items-center gap-5 p-5 sm:p-8 rounded-[24px] bg-paper hover:bg-paper-warm transition-all duration-300 border border-line-light overflow-hidden"
              >
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-ink/[0.02] rounded-full group-hover:scale-150 transition-transform duration-700 ease-out" />

                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[18px] bg-paper-white flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] shrink-0 group-hover:-translate-y-1 transition-transform duration-300">
                  <Icon
                    size={24}
                    className="text-ink-muted group-hover:text-accent transition-colors duration-300"
                  />
                </div>

                <div className="flex flex-col pt-1 sm:pt-0 z-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint mb-1.5">
                    {item.label}
                  </p>
                  <p className="text-base sm:text-xl font-bold text-ink leading-tight pr-4">
                    {item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Divider quote */}
        <div className="mt-20 text-center relative max-w-2xl mx-auto">
          <div className="absolute left-1/2 -top-10 -translate-x-1/2 w-8 h-px bg-line" />
          <blockquote className="text-lg sm:text-2xl font-medium text-ink-faint italic leading-relaxed text-balance">
            "Sucikan hati, eratkan silaturahmi, bersama membangun energi
            negeri."
          </blockquote>
        </div>
      </div>
    </section>
  );
}
