import { useState } from 'react';
import { Menu, ChevronLeft, X, Smartphone, Shirt, Home, Refrigerator, Sparkles, Dumbbell, Camera, Watch } from 'lucide-react';
import { categories } from '@/data/storeData';
import { motion, AnimatePresence } from 'framer-motion';
const iconMap = {
    Smartphone,
    Shirt,
    Home,
    Refrigerator,
    Sparkles,
    Dumbbell,
    Camera,
    Watch,
};
export default function CategoriesBar({ onMenuClick, onCategorySelect, drawerOpen, onDrawerClose, showBar = true }) {
    const [expandedCategory, setExpandedCategory] = useState(null);
    return (<>
      {showBar && <div className="bg-white border-b border-gray-200 sticky top-16 md:top-20 z-30 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-3 md:px-6">
          <div className="flex items-center gap-2 h-12">
            {/* All categories button */}
            <button onClick={onMenuClick} className="flex items-center gap-2 px-3 md:px-4 h-9 bg-brand-700 text-white rounded-lg font-semibold text-sm hover:bg-brand-800 transition-colors flex-shrink-0">
              <Menu size={18}/>
              <span className="hidden sm:inline">جميع الأقسام</span>
            </button>

            {/* Category links */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1">
              {categories.map((cat) => {
            const Icon = iconMap[cat.icon] || Smartphone;
            return (<button key={cat.id} onClick={() => onCategorySelect(cat.name)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-brand-700 transition-colors whitespace-nowrap flex-shrink-0">
                    <Icon size={16} className="text-brand-600"/>
                    <span>{cat.name}</span>
                  </button>);
        })}
            </div>

            {/* Flash deals link */}
            <button onClick={() => onCategorySelect('flash')} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-accent-600 hover:bg-orange-50 transition-colors whitespace-nowrap flex-shrink-0 font-semibold">
              <span className="text-base">⚡</span>
              <span>عروض فلاش</span>
            </button>
          </div>
        </div>
      </div>}

      {/* Category Drawer */}
      <AnimatePresence>
        {drawerOpen && (<>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onDrawerClose} className="fixed inset-0 bg-black/50 z-50"/>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }} className="fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-2xl overflow-y-auto">
              <div className="flex items-center justify-between p-4 bg-brand-700 text-white sticky top-0 z-10">
                <h2 className="font-bold text-lg">جميع الأقسام</h2>
                <button onClick={onDrawerClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                  <X size={22}/>
                </button>
              </div>
              <div className="p-2">
                {categories.map((cat) => {
                const Icon = iconMap[cat.icon] || Smartphone;
                const isExpanded = expandedCategory === cat.id;
                return (<div key={cat.id} className="border-b border-gray-100 last:border-0">
                      <button onClick={() => setExpandedCategory(isExpanded ? null : cat.id)} className="w-full flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Icon size={18} className="text-brand-700"/>
                          </div>
                          <span className="font-semibold text-gray-800 text-sm">{cat.name}</span>
                        </div>
                        <ChevronLeft size={18} className={`text-gray-400 transition-transform ${isExpanded ? '-rotate-90' : ''}`}/>
                      </button>
                      <AnimatePresence>
                        {isExpanded && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="pr-12 pb-2">
                              {cat.subCategories.map((sub) => (<button key={sub} onClick={() => {
                                onCategorySelect(cat.name);
                                onDrawerClose();
                            }} className="block w-full text-right py-2 px-3 text-sm text-gray-600 hover:text-brand-700 hover:bg-blue-50 rounded-lg transition-colors">
                                  {sub}
                                </button>))}
                            </div>
                          </motion.div>)}
                      </AnimatePresence>
                    </div>);
            })}
              </div>
            </motion.div>
          </>)}
      </AnimatePresence>
    </>);
}
