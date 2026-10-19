import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Truck, Gift, Banknote } from 'lucide-react';
import { fetchStorefrontPromotions } from '@/api/storefront';
import { heroSlides, promoCards } from '@/data/storeData';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap = {
    Truck,
    Gift,
    Banknote,
};
const AUTOPLAY_INTERVAL = 5000;

// Keep these classes literal so Tailwind includes every API-supported theme.
const themeClasses = {
    blue: 'from-blue-900 via-blue-800 to-blue-700',
    orange: 'from-orange-700 via-orange-600 to-amber-500',
    slate: 'from-slate-800 via-slate-700 to-slate-600',
    violet: 'from-violet-900 via-violet-800 to-purple-700',
};

export default function HeroSection() {
    const [slides, setSlides] = useState(heroSlides);
    const [currentSlide, setCurrentSlide] = useState(0);
    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, [slides.length]);
    const prevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }, [slides.length]);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;
        fetchStorefrontPromotions({ signal: controller.signal })
            .then((apiSlides) => {
                if (active && apiSlides.length > 0) {
                    setSlides(apiSlides);
                    setCurrentSlide(0);
                }
            })
            .catch((error) => {
                if (error?.name !== 'AbortError') console.warn('[HeroSection] Using fallback slides:', error);
            });
        return () => {
            active = false;
            controller.abort();
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(nextSlide, AUTOPLAY_INTERVAL);
        return () => clearInterval(interval);
    }, [nextSlide]);

    const slide = slides[currentSlide] || slides[0];
    const themeClass = themeClasses[slide.theme] || slide.bgGradient || themeClasses.blue;
    const mediaUrl = slide.mediaUrl || slide.image;
    const mediaType = slide.mediaType || 'image';
    const ctaLabel = slide.ctaLabel || slide.cta;
    const followTarget = () => {
        if (!slide.targetUrl) return;
        if (slide.targetUrl.startsWith('/')) window.location.assign(slide.targetUrl);
        else window.open(slide.targetUrl, '_blank', 'noopener,noreferrer');
    };

    return (<section className="max-w-[1400px] mx-auto px-3 md:px-6 pt-4 md:pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Hero slider */}
        <div className="relative h-[280px] sm:h-[360px] lg:h-[440px] rounded-2xl overflow-hidden group">
          <AnimatePresence mode="wait">
            <motion.div key={slide.id || currentSlide} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className={`absolute inset-0 bg-gradient-to-br ${themeClass}`}>
              <div className="absolute inset-0 opacity-20">
                {mediaType === 'video' ? (
                  <video src={mediaUrl} className="w-full h-full object-cover" muted loop autoPlay playsInline aria-hidden="true" />
                ) : (
                  <img src={mediaUrl} alt="" className="w-full h-full object-cover"/>
                )}
              </div>
              <div className="relative h-full flex items-center px-6 md:px-12">
                <div className="max-w-lg text-white">
                  <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-3">
                    {slide.subtitle}
                  </motion.span>
                  <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
                    {slide.title}
                  </motion.h1>
                  <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-sm md:text-base text-white/90 mb-5 leading-relaxed">
                    {slide.description}
                  </motion.p>
                  <motion.button type="button" onClick={followTarget} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-xl font-bold text-sm md:text-base shadow-lg transition-colors">
                    {ctaLabel}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows */}
          <button onClick={prevSlide} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100" aria-label="السابق">
            <ChevronRight size={22}/>
          </button>
          <button onClick={nextSlide} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100" aria-label="التالي">
            <ChevronLeft size={22}/>
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {slides.map((item, i) => (<button key={item.id || i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'}`} aria-label={`الشريحة ${i + 1}`}/>))}
          </div>
        </div>

        {/* Promo cards */}
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
          {promoCards.map((promo) => {
            const Icon = iconMap[promo.icon] || Truck;
            return (<div key={promo.id} className={`${promo.bgColor} rounded-xl p-2 md:p-4 text-white flex flex-col lg:flex-row items-center lg:items-start justify-center gap-2 md:gap-3 min-h-[132px] lg:min-h-0 text-center lg:text-right hover:scale-[1.02] transition-transform cursor-pointer`}>
                <div className="w-9 h-9 md:w-12 md:h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-white" strokeWidth={2.5}/>
                </div>
                <div className="min-w-0 w-full">
                  <div className="font-bold text-[11px] sm:text-xs md:text-sm leading-snug break-words text-white">{promo.title}</div>
                  <div className="text-[10px] md:text-xs text-white/80 hidden sm:block">{promo.description}</div>
                </div>
              </div>);
        })}
        </div>
      </div>
    </section>);
}
