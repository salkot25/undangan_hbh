import { CheckCircle, RotateCcw, User, Phone, Building2, ThumbsUp } from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

export default function SuccessState({ data, onReset }) {
  return (
    <div className="animate-fade-in flex flex-col items-center text-center py-6 sm:py-10">
      {/* Success Icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center shadow-xl shadow-success-500/30 animate-bounce-in">
          <CheckCircle className="text-white" size={40} strokeWidth={2} />
        </div>
        <div className="absolute inset-0 rounded-full bg-success-500/20 animate-ping" style={{ animationDuration: "2s" }} />
      </div>

      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-bold text-surface-900 mb-2 animate-slide-up">
        Data Berhasil Diverifikasi!
      </h2>
      <p className="text-sm text-surface-500 mb-8 animate-slide-up max-w-xs" style={{ animationDelay: "0.05s" }}>
        Terima kasih telah mengonfirmasi kehadiran Anda. Berikut ringkasan data yang dikirim:
      </p>

      {/* Summary Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl border border-surface-200 shadow-lg shadow-surface-200/50 overflow-hidden animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="bg-gradient-to-r from-pln-600 to-pln-500 px-5 py-3">
          <p className="text-sm font-bold text-white flex items-center gap-2">
            <ThumbsUp size={16} />
            Ringkasan RSVP
          </p>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-pln-50 flex items-center justify-center shrink-0">
              <User size={18} className="text-pln-600" />
            </div>
            <div className="text-left">
              <p className="text-xs text-surface-400 font-medium">Nama</p>
              <p className="text-sm font-semibold text-surface-800">{data.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-pln-50 flex items-center justify-center shrink-0">
              <Phone size={18} className="text-pln-600" />
            </div>
            <div className="text-left">
              <p className="text-xs text-surface-400 font-medium">Nomor HP</p>
              <p className="text-sm font-semibold text-surface-800">{data.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-pln-50 flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-pln-600" />
            </div>
            <div className="text-left">
              <p className="text-xs text-surface-400 font-medium">Unit Kerja</p>
              <p className="text-sm font-semibold text-surface-800">{data.unit}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-pln-50 flex items-center justify-center shrink-0 text-lg">
              {data.status === "Hadir" ? "✓" : "✕"}
            </div>
            <div className="text-left">
              <p className="text-xs text-surface-400 font-medium">Status</p>
              <Badge status={data.status === "Tidak Hadir" ? "Absen" : data.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="mt-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <Button variant="secondary" icon={RotateCcw} onClick={onReset}>
          Input Data Lainnya
        </Button>
      </div>
    </div>
  );
}
