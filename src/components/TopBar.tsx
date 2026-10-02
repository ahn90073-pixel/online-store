import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Phone, Clock, Zap, Truck } from 'lucide-react';
import { governorates } from '@/data/storeData';

export default function TopBar() {
  const [selectedGov, setSelectedGov] = useState(governorates[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-brand-950 text-gray-200 text-xs md:text-sm">
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 h-9 flex items-center justify-between gap-2">
        {/* Delivery location */}
        <div className="flex items-center gap-2 relative" ref={dropdownRef}>
          <MapPin size={14} className="text-accent-400 flex-shrink-0" />
          <span className="text-gray-400 hidden sm:inline">التوصيل إلى:</span>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1 hover:text-white transition-colors font-semibold"
          >
            <span className="truncate max-w-[160px]">{selectedGov}</span>
            <ChevronDown
              size={14}
              className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-1 w-64 bg-white text-gray-800 rounded-lg shadow-2xl z-50 max-h-72 overflow-y-auto custom-scroll border border-gray-100">
              {governorates.map((gov) => (
                <button
                  key={gov}
                  onClick={() => {
                    setSelectedGov(gov);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-right px-4 py-2.5 hover:bg-blue-50 transition-colors flex items-center gap-2 border-b border-gray-50 last:border-0 ${
                    gov === selectedGov ? 'bg-blue-50 font-semibold text-brand-700' : ''
                  }`}
                >
                  <MapPin size={14} className="text-gray-400" />
                  <span>{gov}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="flex items-center gap-3 md:gap-5">
          <span className="hidden md:flex items-center gap-1.5 text-gray-300">
            <Phone size={13} className="text-accent-400" />
            <span>19xxx</span>
          </span>
          <a href="#" className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors">
            <Clock size={13} className="text-accent-400" />
            <span>عروض اليوم</span>
          </a>
          <a href="#" className="hidden lg:flex items-center gap-1.5 hover:text-white transition-colors">
            <Zap size={13} className="text-accent-400" />
            <span>الشحن السريع</span>
          </a>
          <a href="#" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Truck size={13} className="text-accent-400" />
            <span className="hidden sm:inline">تتبع طلبك</span>
            <span className="sm:hidden">تتبع</span>
          </a>
        </div>
      </div>
    </div>
  );
}
