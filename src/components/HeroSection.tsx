import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Truck, Gift, Banknote, type LucideIcon } from 'lucide-react';
import { heroSlides, promoCards } from '@/data/storeData';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap: Record<string, LucideIcon> = {
  Truck,
  Gift,
  Banknote,
};

const AUTOPLAY_INTERVAL = 5000;

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, AUTOPLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section className="max-w-[1400px] mx-auto px-3 md:px-6 pt-4 md:pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Hero slider */}
        <div className="relative h-[280px] sm:h-[360px] lg:h-[440px] rounded-2xl overflow-hidden group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className={`absolute inset-0 bg-gradient-to-br ${heroSlides[currentSlide].bgGradient}`}
            >
              <div className="absolute inset-0 opacity-20">
                <img
                  src={heroSlides[currentSlide].image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative h-full flex items-center px-6 md:px-12">
                <div className="max-w-lg text-white">
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-3"
                  >
                    {heroSlides[currentSlide].subtitle}
                  </motion.span>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight"
                  >
                    {heroSlides[currentSlide].title}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm md:text-base text-white/90 mb-5 leading-relaxed"
                  >
                    {heroSlides[currentSlide].description}
                  </motion.p>
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-xl font-bold text-sm md:text-base shadow-lg transition-colors"
                  >
                    {heroSlides[currentSlide].cta}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows */}
          <button
            onClick={prevSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            aria-label="السابق"
          >
            <ChevronRight size={22} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            aria-label="التالي"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'
                }`}
                aria-label={`الشريحة ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Promo cards */}
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
          {promoCards.map((promo) => {
            const Icon = iconMap[promo.icon] || Truck;
            return (
              <div
                key={promo.id}
                className={`${promo.bgColor} rounded-xl p-3 md:p-4 text-white flex items-center gap-3 hover:scale-[1.02] transition-transform cursor-pointer`}
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={22} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-xs md:text-sm leading-tight">{promo.title}</div>
                  <div className="text-[10px] md:text-xs text-white/80 hidden sm:block">{promo.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
