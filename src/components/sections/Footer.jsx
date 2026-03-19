import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-line py-10 px-5">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-ink flex items-center justify-center">
            <Zap size={13} className="text-paper" />
          </div>
          <span className="text-xs font-semibold text-ink-muted">
            PT PLN (Persero) ULP Salatiga Kota
          </span>
        </div>
        <p className="text-[11px] text-ink-faint">
          © 2026 Corporate Gathering
        </p>
      </div>
    </footer>
  );
}
