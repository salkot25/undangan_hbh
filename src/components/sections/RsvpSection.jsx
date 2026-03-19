import { useState } from "react";
import { Send, CheckCircle, RotateCcw, Loader2 } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { submitRsvp, EVENT_CONFIG } from "../../utils/api";

export default function RsvpSection() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", unit: "", status: "Hadir" });
  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Nama wajib diisi";
    else if (form.name.trim().length < 3) errs.name = "Minimal 3 karakter";
    if (!form.phone.trim()) errs.phone = "Nomor HP wajib diisi";
    else if (!/^[0-9]{10,13}$/.test(form.phone)) errs.phone = "10-13 digit angka";
    if (!form.unit) errs.unit = "Pilih unit kerja";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleChange(field, value) {
    const v = field === "phone" ? value.replace(/[^0-9]/g, "") : value;
    setForm((prev) => ({ ...prev, [field]: v }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await submitRsvp(form);
      if (result.success) {
        addToast("RSVP berhasil dikirim!", "success");
        setSubmittedData(form);
        setSubmitted(true);
        window.dispatchEvent(new Event("rsvpSubmitted"));
      } else {
        addToast(result.message, "error");
      }
    } catch {
      addToast("Terjadi kesalahan.", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setSubmitted(false);
    setSubmittedData(null);
    setForm({ name: "", phone: "", unit: "", status: "Hadir" });
  }

  return (
    <section id="rsvp" className="py-24 sm:py-32 px-6 bg-ink relative overflow-hidden">
      {/* Decorative corporate blur */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent opacity-10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="relative z-10 max-w-xl mx-auto">
        {/* Section header */}
        <div className="mb-14 sm:mb-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink-faint/60 mb-4">
            Tanggapan Kehadiran (RSVP)
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Mohon Konfirmasi <br className="hidden sm:block" /> Kehadiran Anda.
          </h2>
          <p className="mt-4 text-[15px] sm:text-base text-ink-faint leading-relaxed max-w-sm">
            Kami memohon kesediaan Bapak/Ibu untuk melengkapi data berikut guna kelancaran proses registrasi.
          </p>
        </div>

        {submitted && submittedData ? (
          /* Success state */
          <div className="animate-fade-up bg-ink-light p-8 rounded-[32px] border border-white/5">
            <div className="w-16 h-16 rounded-full bg-green/10 flex items-center justify-center mb-6">
              <CheckCircle size={32} className="text-green" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Terima Kasih!</h3>
            <p className="text-[15px] text-ink-faint mb-10">Data kehadiran Bapak/Ibu telah berhasil dicatat ke dalam sistem.</p>

            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.05] p-6 text-left space-y-4 mb-10">
              {[
                { label: "Nama Lengkap", value: submittedData.name },
                { label: "Nomor HP", value: submittedData.phone },
                { label: "Unit Kerja", value: submittedData.unit },
                { label: "Status", value: submittedData.status },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center pb-4 border-b border-white/[0.05] last:border-0 last:pb-0">
                  <span className="text-[13px] font-medium text-ink-faint">{item.label}</span>
                  <span className="text-[14px] font-bold text-white text-right break-words max-w-[60%]">{item.value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleReset}
              className="w-full h-14 flex justify-center items-center gap-2 px-6 text-[15px] font-bold text-white bg-white/10 rounded-2xl hover:bg-white/15 transition-colors active:scale-[0.98]"
            >
              <RotateCcw size={16} />
              Daftar Kehadiran Tambahan
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8" noValidate>
            {/* Name */}
            <div className="group">
              <label className="block text-[11px] font-bold text-ink-faint uppercase tracking-widest mb-2.5 ml-1 transition-colors group-focus-within:text-white">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className={`w-full h-14 px-5 rounded-2xl bg-ink-light border text-white text-[15px] font-semibold placeholder:text-white/20 outline-none transition-all duration-300 focus:ring-4 focus:ring-accent/20 ${
                  errors.name ? "border-red/50 focus:border-red" : "border-white/10 focus:border-accent/50"
                }`}
              />
              {errors.name && <p className="mt-2 ml-1 text-[13px] text-red font-medium animate-fade-in">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div className="group">
              <label className="block text-[11px] font-bold text-ink-faint uppercase tracking-widest mb-2.5 ml-1 transition-colors group-focus-within:text-white">
                Nomor HP (WhatsApp)
              </label>
              <input
                type="tel"
                inputMode="numeric"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="081234567890"
                className={`w-full h-14 px-5 rounded-2xl bg-ink-light border text-white text-[15px] font-semibold placeholder:text-white/20 outline-none transition-all duration-300 focus:ring-4 focus:ring-accent/20 ${
                  errors.phone ? "border-red/50 focus:border-red" : "border-white/10 focus:border-accent/50"
                }`}
              />
              {errors.phone && <p className="mt-2 ml-1 text-[13px] text-red font-medium animate-fade-in">{errors.phone}</p>}
            </div>

            {/* Unit */}
            <div className="group">
              <label className="block text-[11px] font-bold text-ink-faint uppercase tracking-widest mb-2.5 ml-1 transition-colors group-focus-within:text-white">
                Unit Kerja
              </label>
              <select
                value={form.unit}
                onChange={(e) => handleChange("unit", e.target.value)}
                className={`w-full h-14 px-5 rounded-2xl bg-ink-light border text-[15px] font-semibold outline-none appearance-none transition-all duration-300 focus:ring-4 focus:ring-accent/20 ${
                  form.unit ? "text-white" : "text-white/20"
                } ${errors.unit ? "border-red/50 focus:border-red" : "border-white/10 focus:border-accent/50"}`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a3a3a3' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 20px center",
                }}
              >
                <option value="" disabled>Pilih unit asal...</option>
                {EVENT_CONFIG.units.map((u) => (
                  <option key={u} value={u} className="text-ink bg-paper-white">{u}</option>
                ))}
              </select>
              {errors.unit && <p className="mt-2 ml-1 text-[13px] text-red font-medium animate-fade-in">{errors.unit}</p>}
            </div>

            {/* Segmented Control Status */}
            <div>
              <label className="block text-[11px] font-bold text-ink-faint uppercase tracking-widest mb-2.5 ml-1">
                Status Kehadiran
              </label>
              <div className="relative flex p-1.5 rounded-2xl bg-ink-light border border-white/10 h-16">
                {["Hadir", "Tidak Hadir"].map((option) => {
                  const selected = form.status === option;
                  return (
                    <label
                      key={option}
                      className={`flex-1 flex items-center justify-center rounded-xl cursor-pointer text-[14px] font-bold transition-all duration-300 z-10 ${
                        selected
                          ? "text-white shadow-sm"
                          : "text-ink-faint hover:text-white/70"
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={option}
                        checked={selected}
                        onChange={(e) => handleChange("status", e.target.value)}
                        className="sr-only"
                      />
                      {option}
                    </label>
                  );
                })}
                {/* Active slider background */}
                <div 
                  className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-accent rounded-xl shadow-md transition-transform duration-300 ease-out z-0"
                  style={{ transform: form.status === "Hadir" ? "translateX(0)" : "translateX(100%)" }}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 mt-4 flex items-center justify-center gap-2 px-6 bg-pln-yellow text-ink text-[15px] font-bold rounded-2xl hover:brightness-110 disabled:opacity-50 transition-all duration-300 active:scale-[0.98] shadow-lg shadow-pln-yellow/20"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Konfirmasi Sekarang
                  <Send size={18} className="ml-1" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
