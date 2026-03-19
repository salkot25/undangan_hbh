import { FileText, Users, MapPin } from "lucide-react";

const tabs = [
  { id: 0, label: "RSVP Form", icon: FileText },
  { id: 1, label: "Daftar Hadir", icon: Users },
  { id: 2, label: "Lokasi", icon: MapPin },
];

export default function TabNavigation({ activeTab, onTabChange }) {
  return (
    <>
      {/* Desktop: Top tab bar */}
      <div className="hidden sm:block sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-surface-200">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-semibold
                  transition-all duration-200 relative
                  ${isActive
                    ? "text-pln-600"
                    : "text-surface-500 hover:text-surface-700 hover:bg-surface-50"
                  }
                `}
                aria-selected={isActive}
                role="tab"
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                {/* Active underline */}
                <span
                  className={`
                    absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full
                    transition-all duration-300 ease-out
                    bg-gradient-to-r from-pln-500 to-pln-400
                    ${isActive ? "w-2/3 opacity-100" : "w-0 opacity-0"}
                  `}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile: Bottom navigation bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-surface-200 safe-area-bottom">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex-1 flex flex-col items-center justify-center gap-1 py-2.5 px-2
                  transition-all duration-200
                  ${isActive
                    ? "text-pln-600"
                    : "text-surface-400 active:text-surface-600"
                  }
                `}
                aria-selected={isActive}
                role="tab"
              >
                <div className={`
                  relative p-1.5 rounded-xl transition-all duration-200
                  ${isActive ? "bg-pln-50" : ""}
                `}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-pln-500 rounded-full" />
                  )}
                </div>
                <span className={`text-[10px] font-semibold ${isActive ? "text-pln-600" : "text-surface-400"}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
