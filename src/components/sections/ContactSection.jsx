import { useState } from "react";
import { MessageCircle } from "lucide-react";

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", message: "" });
  const [errors, setErrors] = useState({});

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};
    if (!form.name) newErrors.name = "Nama wajib diisi";
    if (!form.message) newErrors.message = "Pesan wajib diisi";
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    const waNumber = "62895623408000";
    const text = `Halo Panitia, saya ${form.name}.

${form.message}

--
Dikirim dari Aplikasi Undangan Halalbihalal PT PLN (Persero) ULP Salatiga Kota`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${waNumber}?text=${encodedText}`, "_blank");
    
    setForm({ name: "", message: "" });
  }

  return (
    <section id="kontak" className="py-24 sm:py-32 px-6 bg-paper-warm relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-line to-transparent opacity-50" />
      <div className="max-w-xl mx-auto">
        <div className="mb-12 sm:mb-16 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink-faint mb-4">
            Pusat Bantuan
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight leading-tight">
            Hubungi Panitia
          </h2>
          <p className="mt-4 text-[15px] sm:text-base text-ink-muted leading-relaxed max-w-sm mx-auto">
            Ada pertanyaan seputar acara? Jangan ragu untuk menghubungi kami melalui WhatsApp.
          </p>
        </div>

        <div className="bg-paper-white p-6 sm:p-10 rounded-[32px] border border-line shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8" noValidate>
            <div className="group">
              <label className="block text-[11px] font-bold text-ink-faint uppercase tracking-widest mb-2.5 ml-1 transition-colors group-focus-within:text-ink">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className={`w-full h-14 px-5 rounded-2xl bg-paper-warm border text-ink text-[15px] font-semibold placeholder:text-ink-faint/60 outline-none transition-all duration-300 focus:ring-4 focus:ring-accent/10 focus:bg-paper-white ${
                  errors.name ? "border-red/50 focus:border-red" : "border-line focus:border-accent/50"
                }`}
              />
              {errors.name && <p className="mt-2 ml-1 text-[13px] text-red font-medium animate-fade-in">{errors.name}</p>}
            </div>

            <div className="group">
              <label className="block text-[11px] font-bold text-ink-faint uppercase tracking-widest mb-2.5 ml-1 transition-colors group-focus-within:text-ink">
                Pesan / Pertanyaan
              </label>
              <textarea
                value={form.message}
                onChange={(e) => handleChange("message", e.target.value)}
                placeholder="Tuliskan pertanyaan Bapak/Ibu di sini..."
                rows={4}
                className={`w-full p-5 rounded-2xl bg-paper-warm border text-ink text-[15px] font-semibold placeholder:text-ink-faint/60 outline-none transition-all duration-300 focus:ring-4 focus:ring-accent/10 focus:bg-paper-white resize-none ${
                  errors.message ? "border-red/50 focus:border-red" : "border-line focus:border-accent/50"
                }`}
              />
              {errors.message && <p className="mt-2 ml-1 text-[13px] text-red font-medium animate-fade-in">{errors.message}</p>}
            </div>

            <button
              type="submit"
              className="w-full h-16 mt-4 flex items-center justify-center gap-3 px-6 bg-[#25D366] text-white text-[15px] font-bold rounded-2xl hover:brightness-110 transition-all duration-300 active:scale-[0.98] shadow-lg shadow-[#25D366]/20"
            >
              <MessageCircle size={22} className="fill-white/20" />
              Kirim via WhatsApp
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
