import { useState } from "react";
import { Send, User, Phone, Building2, CheckCircle2 } from "lucide-react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { useToast } from "../../hooks/useToast";
import { submitRsvp, EVENT_CONFIG } from "../../utils/api";

export default function RsvpForm({ onSuccess }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    unit: "",
    status: "Hadir",
  });
  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Nama wajib diisi";
    else if (form.name.trim().length < 3) errs.name = "Nama minimal 3 karakter";

    if (!form.phone.trim()) errs.phone = "Nomor HP wajib diisi";
    else if (!/^[0-9]{10,13}$/.test(form.phone.replace(/\s/g, "")))
      errs.phone = "Nomor HP harus 10-13 digit angka";

    if (!form.unit) errs.unit = "Unit Kerja wajib dipilih";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleChange(field, value) {
    let processedValue = value;
    if (field === "phone") {
      processedValue = value.replace(/[^0-9]/g, "");
    }
    setForm((prev) => ({ ...prev, [field]: processedValue }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await submitRsvp(form);
      if (result.success) {
        addToast("Data RSVP berhasil dikirim!", "success");
        onSuccess(form);
      } else {
        addToast(result.message || "Gagal mengirim data.", "error");
      }
    } catch {
      addToast("Terjadi kesalahan. Coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-surface-900">Formulir RSVP</h2>
        <p className="text-sm text-surface-500 mt-1">
          Konfirmasi kehadiran Anda untuk acara {EVENT_CONFIG.name}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Name */}
        <div className="animate-slide-up" style={{ animationDelay: "0.05s" }}>
          <Input
            id="rsvp-name"
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap Anda"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={errors.name}
            autoComplete="name"
          />
        </div>

        {/* Phone */}
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <Input
            id="rsvp-phone"
            label="Nomor HP"
            placeholder="Contoh: 081234567890"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            error={errors.phone}
            type="tel"
            inputMode="numeric"
            helperText="Masukkan nomor HP aktif (10-13 digit)"
          />
        </div>

        {/* Unit Kerja */}
        <div className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <Select
            id="rsvp-unit"
            label="Unit Kerja"
            placeholder="Pilih unit kerja Anda"
            options={EVENT_CONFIG.units}
            value={form.unit}
            onChange={(e) => handleChange("unit", e.target.value)}
            error={errors.unit}
          />
        </div>

        {/* Status Kehadiran */}
        <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <p className="text-sm font-semibold text-surface-700 mb-3">Status Kehadiran</p>
          <div className="grid grid-cols-2 gap-3">
            {["Hadir", "Tidak Hadir"].map((option) => {
              const isSelected = form.status === option;
              const isHadir = option === "Hadir";
              return (
                <label
                  key={option}
                  className={`
                    relative flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl cursor-pointer
                    border-2 transition-all duration-200 text-sm font-semibold
                    ${isSelected
                      ? isHadir
                        ? "border-success-500 bg-success-50 text-success-700 shadow-sm shadow-success-500/10"
                        : "border-danger-500 bg-danger-50 text-danger-700 shadow-sm shadow-danger-500/10"
                      : "border-surface-200 bg-white text-surface-600 hover:border-surface-300"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option}
                    checked={isSelected}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="sr-only"
                  />
                  <CheckCircle2
                    size={18}
                    className={isSelected ? (isHadir ? "text-success-500" : "text-danger-500") : "text-surface-300"}
                  />
                  {option}
                </label>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="animate-slide-up pt-2" style={{ animationDelay: "0.25s" }}>
          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={loading}
            icon={Send}
          >
            Kirim Konfirmasi
          </Button>
        </div>
      </form>
    </div>
  );
}
