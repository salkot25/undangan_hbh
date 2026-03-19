import { useState, useEffect } from "react";
import { ArrowDown } from "lucide-react";
import { EVENT_CONFIG } from "../../utils/api";

function CountdownUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[2.5rem] leading-none sm:text-5xl lg:text-6xl font-extrabold tabular-nums text-ink tracking-tighter animate-count">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[9px] sm:text-xs font-bold text-ink-muted uppercase tracking-[0.25em] mt-2">
        {label}
      </span>
    </div>
  );
}

function calculateTimeLeft() {
  const eventDate = new Date(`${EVENT_CONFIG.date}T${EVENT_CONFIG.time}:00`);
  const diff = eventDate - new Date();
  if (diff <= 0) return null;
  return {
    hari: Math.floor(diff / (1000 * 60 * 60 * 24)),
    jam: Math.floor((diff / (1000 * 60 * 60)) % 24),
    menit: Math.floor((diff / (1000 * 60)) % 60),
    detik: Math.floor((diff / 1000) % 60),
  };
}

export default function HeroSection() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(t);
  }, []);

  const eventDate = new Date(`${EVENT_CONFIG.date}T${EVENT_CONFIG.time}:00`).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section id="hero" className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 overflow-hidden pt-20">
      {/* Subtle background */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "radial-gradient(circle, var(--color-ink) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 w-full max-w-4xl mx-auto text-center flex flex-col items-center">
        
        {/* minimal badge */}
        <div 
          className="animate-fade-up-slow mb-8 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 backdrop-blur-md"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
            Undangan Resmi
          </span>
        </div>

        {/* Title using clamp for fluid typography */}
        <h1
          className="animate-fade-up text-[clamp(2.75rem,8vw,5.5rem)] font-extrabold text-ink leading-[1.05] tracking-tight"
          style={{ animationDelay: "0.1s" }}
        >
          Halalbihalal
          <br />
          <span className="text-accent">2026</span>
        </h1>

        <p
          className="animate-fade-up mt-6 sm:mt-8 text-[15px] sm:text-lg text-ink-muted max-w-[280px] sm:max-w-md mx-auto leading-relaxed"
          style={{ animationDelay: "0.2s" }}
        >
          Mempererat tali silaturahmi<br />
          <strong className="text-ink font-semibold">Keluarga Besar PT PLN (Persero)</strong><br />
          <strong className="text-accent font-bold">ULP Salatiga Kota</strong>
        </p>

        {/* Minimal Date Indicator */}
        <div
          className="animate-fade-up mt-8 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm font-semibold text-white"
          style={{ animationDelay: "0.3s" }}
        >
          <span className="py-2 px-5 bg-pln-blue rounded-full shadow-[0_8px_30px_rgba(0,92,154,0.2)]">
            {eventDate}
          </span>
          <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-ink-faint" />
          <span className="py-2 px-5 bg-paper rounded-full border border-line shadow-sm text-ink-muted">
            {EVENT_CONFIG.time} WIB
          </span>
        </div>

        {/* Large, airy Countdown */}
        {timeLeft && (
          <div className="animate-fade-up mt-16 sm:mt-20 scale-90 sm:scale-100" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-start justify-center gap-6 sm:gap-10">
              <CountdownUnit value={timeLeft.hari} label="Hari" />
              <div className="w-[1px] h-12 bg-line-light mt-1" />
              <CountdownUnit value={timeLeft.jam} label="Jam" />
              <div className="w-[1px] h-12 bg-line-light mt-1 hidden sm:block" />
              <CountdownUnit value={timeLeft.menit} label="Mnt" />
              <div className="w-[1px] h-12 bg-line-light mt-1" />
              <CountdownUnit value={timeLeft.detik} label="Dtk" />
            </div>
          </div>
        )}

        {/* CTAs - optimized touch targets for mobile (min-h: 56px) */}
        <div className="animate-fade-up mt-14 w-full max-w-sm mx-auto flex flex-col sm:flex-row gap-3" style={{ animationDelay: "0.5s" }}>
          <button
            onClick={() => document.getElementById("rsvp")?.scrollIntoView({ behavior: "smooth" })}
            className="w-full h-14 bg-accent text-white text-[15px] font-bold rounded-2xl hover:bg-accent-dark transition-all duration-300 active:scale-[0.98] shadow-xl shadow-accent/25 flex items-center justify-center"
          >
            Konfirmasi Kehadiran
          </button>
          <button
            onClick={() => document.getElementById("details")?.scrollIntoView({ behavior: "smooth" })}
            className="w-full h-14 bg-transparent text-ink text-[15px] font-bold rounded-2xl border border-line hover:border-accent hover:text-accent transition-all duration-300 active:scale-[0.98] flex items-center justify-center"
          >
            Informasi Acara
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50 hidden sm:block">
        <ArrowDown size={24} className="text-ink-faint" />
      </div>
    </section>
  );
}
