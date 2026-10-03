import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { CartProvider, useCart } from '@/context/CartContext';
import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import CategoriesBar from '@/components/CategoriesBar';
import HeroSection from '@/components/HeroSection';
import FlashDeals from '@/components/FlashDeals';
import ProductGrid from '@/components/ProductGrid';
import TrustBadges from '@/components/TrustBadges';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { products as allProducts } from '@/data/storeData';
function Toast({ message, show }) {
    return (<AnimatePresence>
      {show && (<motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }} className="fixed top-24 left-1/2 z-[60] bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 size={20}/>
          <span>{message}</span>
        </motion.div>)}
    </AnimatePresence>);
}
function Storefront() {
    const { addToCart } = useCart();
    const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
    const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState({ show: false, message: '' });
    const showToast = useCallback((message) => {
        setToast({ show: true, message });
    }, []);
    useEffect(() => {
        if (!toast.show)
            return;
        const timer = setTimeout(() => setToast({ show: false, message: '' }), 2500);
        return () => clearTimeout(timer);
    }, [toast.show]);
    const handleAddToCart = useCallback((product) => {
        const cartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
        };
        addToCart(cartItem);
        showToast('تمت الإضافة إلى السلة بنجاح');
    }, [addToCart, showToast]);
    const handleCategorySelect = useCallback((category) => {
        setSelectedCategory(category);
        setSearchQuery('');
    }, []);
    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
        setSelectedCategory('all');
    }, []);
    const filteredProducts = allProducts.filter((p) => {
        const matchesCategory = selectedCategory === 'all' || selectedCategory === 'flash' || p.category === selectedCategory;
        const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    const isFiltered = selectedCategory !== 'all' || searchQuery !== '';
    const recommendedProducts = allProducts.slice(0, 8);
    const gridTitle = searchQuery
        ? `نتائج البحث عن: "${searchQuery}"`
        : selectedCategory === 'all'
            ? 'منتجات مختارة لك'
            : selectedCategory === 'flash'
                ? 'عروض فلاش المتجر'
                : `قسم ${selectedCategory}`;
    return (<div className="min-h-screen bg-gray-100" dir="rtl">
      <Toast message={toast.message} show={toast.show}/>
      <TopBar />
      <Header onCategoryMenuClick={() => setCategoryDrawerOpen(true)} onCartClick={() => setCartDrawerOpen(true)} onSearch={handleSearch}/>
      <CategoriesBar onMenuClick={() => setCategoryDrawerOpen(true)} onCategorySelect={handleCategorySelect} drawerOpen={categoryDrawerOpen} onDrawerClose={() => setCategoryDrawerOpen(false)}/>

      <main className="pb-8">
        {!isFiltered && <HeroSection />}
        {!isFiltered && <FlashDeals onAddToCart={handleAddToCart}/>}
        {!isFiltered && (<ProductGrid title="منتجات مختارة لك" subtitle="اكتشف أفضل المنتجات المختارة بعناية لك" products={recommendedProducts} onAddToCart={handleAddToCart} showSeeAll/>)}
        {isFiltered && (<div className="pt-6">
            <ProductGrid title={gridTitle} subtitle={`${filteredProducts.length} منتج متاح`} products={filteredProducts} onAddToCart={handleAddToCart}/>
          </div>)}
        {!isFiltered && (<ProductGrid title="تشكيلة واسعة من المنتجات" subtitle="تصفح جميع المنتجات المتاحة في متجرنا" products={allProducts} onAddToCart={handleAddToCart}/>)}
        <TrustBadges />
      </main>

      <Footer />
      <CartDrawer open={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)}/>
    </div>);
}
function App() {
    return (<CartProvider>
      <Storefront />
    </CartProvider>);
}
export default App;
