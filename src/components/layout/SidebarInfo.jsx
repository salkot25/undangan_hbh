import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Sparkles, Zap } from "lucide-react";
import { EVENT_CONFIG } from "../../utils/api";

function calculateTimeLeft() {
  const eventDate = new Date(`${EVENT_CONFIG.date}T${EVENT_CONFIG.time}:00`);
  const now = new Date();
  const diff = eventDate - now;

  if (diff <= 0) return null;

  return {
    hari: Math.floor(diff / (1000 * 60 * 60 * 24)),
    jam: Math.floor((diff / (1000 * 60 * 60)) % 24),
    menit: Math.floor((diff / (1000 * 60)) % 60),
    detik: Math.floor((diff / 1000) % 60),
  };
}

function CountdownUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center border border-white/10">
        <span className="text-xl sm:text-2xl font-bold text-white tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[10px] sm:text-xs text-blue-200 mt-1.5 font-medium uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

export default function SidebarInfo() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const eventDateFormatted = new Date(`${EVENT_CONFIG.date}T${EVENT_CONFIG.time}:00`).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-pln-950 via-pln-900 to-pln-800 text-white lg:min-h-screen">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-pln-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl" />
        <div className="absolute top-1/2 right-0 w-32 h-32 bg-pln-400/5 rounded-full blur-xl" />
      </div>

      <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col items-center lg:items-start lg:justify-center lg:min-h-screen gap-6 lg:gap-8">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <Zap className="text-pln-900" size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold tracking-wide text-blue-100">PT PLN (Persero)</h2>
            <p className="text-xs text-blue-300/80">ULP Salatiga Kota</p>
          </div>
        </div>

        {/* Event Title */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-blue-200 mb-3 border border-white/10">
            <Sparkles size={12} />
            <span>Undangan Acara</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight">
            Corporate{" "}
            <span className="bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent">
              Gathering
            </span>
          </h1>
          <p className="text-lg sm:text-xl font-semibold text-blue-200 mt-1">Halal Bi Halal 2026</p>
        </div>

        {/* Event Info Cards */}
        <div className="w-full space-y-3 max-w-xs lg:max-w-none">
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
            <div className="w-9 h-9 rounded-lg bg-pln-500/20 flex items-center justify-center shrink-0">
              <Calendar size={18} className="text-blue-300" />
            </div>
            <div>
              <p className="text-xs text-blue-300/80 font-medium">Tanggal</p>
              <p className="text-sm font-semibold">{eventDateFormatted}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
            <div className="w-9 h-9 rounded-lg bg-pln-500/20 flex items-center justify-center shrink-0">
              <Clock size={18} className="text-blue-300" />
            </div>
            <div>
              <p className="text-xs text-blue-300/80 font-medium">Waktu</p>
              <p className="text-sm font-semibold">{EVENT_CONFIG.time} - {EVENT_CONFIG.endTime} WIB</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
            <div className="w-9 h-9 rounded-lg bg-pln-500/20 flex items-center justify-center shrink-0">
              <MapPin size={18} className="text-blue-300" />
            </div>
            <div>
              <p className="text-xs text-blue-300/80 font-medium">Lokasi</p>
              <p className="text-sm font-semibold">{EVENT_CONFIG.location}</p>
            </div>
          </div>
        </div>

        {/* Countdown */}
        {timeLeft && (
          <div className="w-full max-w-xs lg:max-w-none">
            <p className="text-xs uppercase tracking-widest text-blue-300/60 font-semibold mb-3 text-center lg:text-left">
              Hitung Mundur
            </p>
            <div className="flex justify-center lg:justify-start gap-3">
              <CountdownUnit value={timeLeft.hari} label="Hari" />
              <div className="text-2xl font-bold text-blue-400/40 self-start mt-3.5">:</div>
              <CountdownUnit value={timeLeft.jam} label="Jam" />
              <div className="text-2xl font-bold text-blue-400/40 self-start mt-3.5">:</div>
              <CountdownUnit value={timeLeft.menit} label="Menit" />
              <div className="text-2xl font-bold text-blue-400/40 self-start mt-3.5">:</div>
              <CountdownUnit value={timeLeft.detik} label="Detik" />
            </div>
          </div>
        )}

        {/* Dress Code */}
        <div className="w-full max-w-xs lg:max-w-none bg-gradient-to-r from-yellow-500/10 to-yellow-400/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-yellow-400/20">
          <p className="text-xs text-yellow-300/80 font-medium">Dress Code</p>
          <p className="text-sm font-bold text-yellow-200">{EVENT_CONFIG.dressCode}</p>
        </div>
      </div>
    </div>
  );
}
