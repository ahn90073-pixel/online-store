import { ChevronLeft } from 'lucide-react';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
export default function ProductGrid({ title, subtitle, products, onAddToCart, showSeeAll }) {
    return (<section className="max-w-[1400px] mx-auto px-3 md:px-6 mt-6">
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        {/* Section header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div>
            <h2 className="text-lg md:text-2xl font-bold text-gray-800">{title}</h2>
            {subtitle && <p className="text-xs md:text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {showSeeAll && (<button className="flex items-center gap-1 text-sm text-brand-700 hover:text-brand-800 font-semibold transition-colors">
              <span>عرض الكل</span>
              <ChevronLeft size={18}/>
            </button>)}
        </div>

        {/* Grid */}
        {products.length === 0 ? <div className="rounded-xl bg-gray-50 p-8 text-center text-sm text-gray-500">لا توجد منتجات مطابقة لهذا الاختيار.</div> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {products.map((product, i) => (<motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: i * 0.05 }}>
              <ProductCard product={product} onAddToCart={onAddToCart}/>
            </motion.div>))}
        </div>}
      </div>
    </section>);
}
