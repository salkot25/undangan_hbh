import { useState } from "react";
import { MapPin, ExternalLink, Copy, Check, Navigation, Clock, Shirt } from "lucide-react";
import Button from "../ui/Button";
import { useToast } from "../../hooks/useToast";
import { EVENT_CONFIG } from "../../utils/api";

export default function LocationMap() {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  async function handleCopyAddress() {
    try {
      await navigator.clipboard.writeText(
        `${EVENT_CONFIG.location}\n${EVENT_CONFIG.address}`
      );
      setCopied(true);
      addToast("Alamat berhasil disalin!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast("Gagal menyalin alamat.", "error");
    }
  }

  function handleOpenMaps() {
    window.open(EVENT_CONFIG.mapsUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-5 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-surface-900">Lokasi Acara</h2>
        <p className="text-sm text-surface-500 mt-1">
          Temukan lokasi dan petunjuk arah menuju tempat acara
        </p>
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border-2 border-surface-200 shadow-lg shadow-surface-200/50 mb-5 animate-slide-up">
        <iframe
          src={EVENT_CONFIG.mapsEmbedUrl}
          width="100%"
          height="300"
          style={{ border: 0, display: "block" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Peta Joglo Ki Penjawi Salatiga"
          className="sm:h-[400px]"
        />
      </div>

      {/* Location Info Card */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden mb-5 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-pln-50 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin size={20} className="text-pln-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">Alamat Lengkap</p>
              <p className="text-sm font-semibold text-surface-800 mt-1 leading-relaxed">
                {EVENT_CONFIG.location}
              </p>
              <p className="text-xs text-surface-500 mt-1 leading-relaxed">
                {EVENT_CONFIG.address}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-pln-50 flex items-center justify-center shrink-0 mt-0.5">
              <Clock size={20} className="text-pln-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">Waktu</p>
              <p className="text-sm font-semibold text-surface-800 mt-1">
                {EVENT_CONFIG.time} WIB - {EVENT_CONFIG.endTime}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center shrink-0 mt-0.5">
              <Shirt size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">Dress Code</p>
              <p className="text-sm font-semibold text-surface-800 mt-1">{EVENT_CONFIG.dressCode}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: "0.15s" }}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon={Navigation}
          onClick={handleOpenMaps}
        >
          Buka di Google Maps
        </Button>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          icon={copied ? Check : Copy}
          onClick={handleCopyAddress}
        >
          {copied ? "Alamat Tersalin!" : "Salin Alamat Lengkap"}
        </Button>
      </div>

      {/* Bottom spacer for mobile nav */}
      <div className="h-20 sm:h-0" />
    </div>
  );
}
