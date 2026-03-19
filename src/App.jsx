import { useState, useEffect } from "react";
import { ToastProvider } from "./hooks/useToast";
import Navbar from "./components/layout/Navbar";
import HeroSection from "./components/sections/HeroSection";
import EventDetails from "./components/sections/EventDetails";
import RsvpSection from "./components/sections/RsvpSection";
import AttendanceSection from "./components/sections/AttendanceSection";
import ContactSection from "./components/sections/ContactSection";
import LocationSection from "./components/sections/LocationSection";
import Footer from "./components/sections/Footer";
import MusicPlayer from "./components/ui/MusicPlayer";

function LandingPage() {
  const [showFab, setShowFab] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const hero = document.getElementById("hero");
      const rsvp = document.getElementById("rsvp");
      if (!hero || !rsvp) return;

      const heroBottom = hero.getBoundingClientRect().bottom;
      const rsvpTop = rsvp.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      // Show FAB if past hero, but hide if RSVP section is in view
      setShowFab(heroBottom < 0 && rsvpTop > windowHeight - 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-paper pb-[80px] md:pb-0">
      <Navbar />
      <main>
        <HeroSection />
        <EventDetails />
        <RsvpSection />
        <AttendanceSection />
        <ContactSection />
        <LocationSection />
      </main>
      <Footer />
      
      {/* Mobile Sticky RSVP FAB */}
      <div 
        className={`fixed md:hidden bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-paper-white via-paper-white/90 to-transparent z-40 transition-transform duration-500 ease-out ${
          showFab ? "translate-y-0" : "translate-y-[150%]"
        }`}
      >
        <button
          onClick={() => document.getElementById("rsvp")?.scrollIntoView({ behavior: "smooth" })}
          className="w-full bg-accent text-paper-white font-bold py-4 rounded-full shadow-[0_8px_30px_rgba(0,162,233,0.25)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          RSVP Sekarang
        </button>
      </div>

      {/* Floating Music Player */}
      <MusicPlayer />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <LandingPage />
    </ToastProvider>
  );
}
