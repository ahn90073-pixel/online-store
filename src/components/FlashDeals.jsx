import { useState, useEffect } from 'react';
import { Zap, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
export default function FlashDeals({ products = [], onAddToCart }) {
    const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 42, seconds: 15 });
    const [scrollEl, setScrollEl] = useState(null);
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                let { hours, minutes, seconds } = prev;
                seconds--;
                if (seconds < 0) {
                    seconds = 59;
                    minutes--;
                }
                if (minutes < 0) {
                    minutes = 59;
                    hours--;
                }
                if (hours < 0) {
                    hours = 23;
                }
                return { hours, minutes, seconds };
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    const flashProducts = products.filter((p) => p.flashDeal);
    const scroll = (direction) => {
        if (!scrollEl)
            return;
        const amount = 280;
        scrollEl.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    };
    const pad = (n) => String(n).padStart(2, '0');
    if (flashProducts.length === 0) return null;
    return (<section className="max-w-[1400px] mx-auto px-3 md:px-6 mt-6">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-l from-orange-600 to-orange-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center pulse-deal">
              <Zap size={24} className="text-white"/>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg md:text-xl">صفقات اليوم العاجلة</h2>
              <p className="text-white/80 text-xs hidden sm:block">عروض محدودة بكميات قليلة</p>
            </div>
          </div>

          {/* Countdown timer */}
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-white hidden sm:block"/>
            <div className="flex items-center gap-1.5" dir="ltr">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1.5 md:px-3 md:py-2 min-w-[40px] md:min-w-[48px] text-center">
                <div className="text-white font-bold text-base md:text-xl leading-none">{pad(timeLeft.hours)}</div>
                <div className="text-white/70 text-[9px] md:text-[10px]">ساعة</div>
              </div>
              <span className="text-white font-bold text-lg">:</span>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1.5 md:px-3 md:py-2 min-w-[40px] md:min-w-[48px] text-center">
                <div className="text-white font-bold text-base md:text-xl leading-none">{pad(timeLeft.minutes)}</div>
                <div className="text-white/70 text-[9px] md:text-[10px]">دقيقة</div>
              </div>
              <span className="text-white font-bold text-lg">:</span>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1.5 md:px-3 md:py-2 min-w-[40px] md:min-w-[48px] text-center">
                <div className="text-white font-bold text-base md:text-xl leading-none">{pad(timeLeft.seconds)}</div>
                <div className="text-white/70 text-[9px] md:text-[10px]">ثانية</div>
              </div>
            </div>
          </div>
        </div>

        {/* Products carousel */}
        <div className="relative">
          <div ref={setScrollEl} className="flex gap-3 overflow-x-auto no-scrollbar p-4 scroll-smooth">
            {flashProducts.map((product) => (<motion.div key={product.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-shrink-0 w-[200px] md:w-[240px]">
                <ProductCard product={product} onAddToCart={onAddToCart} compact/>
              </motion.div>))}
          </div>

          {/* Scroll buttons */}
          <button onClick={() => scroll('right')} className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200" aria-label="السابق">
            <ChevronRight size={20} className="text-gray-700"/>
          </button>
          <button onClick={() => scroll('left')} className="absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200" aria-label="التالي">
            <ChevronLeft size={20} className="text-gray-700"/>
          </button>
        </div>
      </div>
    </section>);
}
