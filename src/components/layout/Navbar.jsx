import { useState, useEffect } from "react";
import { Zap, Menu, X } from "lucide-react";

const navLinks = [
  { id: "hero", label: "Beranda" },
  { id: "details", label: "Detail" },
  { id: "rsvp", label: "RSVP" },
  { id: "hadir", label: "Daftar Hadir" },
  { id: "kontak", label: "Kontak" },
  { id: "lokasi", label: "Lokasi" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-paper-white/80 backdrop-blur-xl shadow-[0_1px_0_var(--color-line)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => scrollTo("hero")} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center group-hover:scale-105 transition-transform">
              <Zap size={16} className="text-paper" />
            </div>
            <span className="text-sm font-bold tracking-tight text-ink hidden sm:block">
              PLN Salatiga Kota
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="px-3.5 py-2 text-[13px] font-medium text-ink-muted hover:text-ink transition-colors rounded-lg hover:bg-ink/[0.03]"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => scrollTo("rsvp")}
            className="hidden md:block px-5 py-2 text-[13px] font-semibold text-white bg-accent rounded-full hover:bg-accent-dark transition-colors shadow-lg shadow-accent/20"
          >
            Konfirmasi Kehadiran
          </button>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-ink hover:bg-ink/5 transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-paper-white/95 backdrop-blur-xl border-t border-line animate-fade-in">
          <div className="px-5 py-4 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="block w-full text-left px-4 py-3 text-sm font-medium text-ink-muted hover:text-ink hover:bg-ink/[0.03] rounded-xl transition-colors"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => scrollTo("rsvp")}
              className="w-full mt-2 px-4 py-3 text-sm font-semibold text-white bg-accent rounded-xl transition-colors shadow-lg shadow-accent/20"
            >
              Konfirmasi Kehadiran
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
