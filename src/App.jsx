import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, LoaderCircle, RefreshCw } from 'lucide-react';
import { CartProvider, useCart } from '@/context/CartContext';
import { fetchStorefrontProducts } from '@/api/storefront';
import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import CategoriesBar from '@/components/CategoriesBar';
import HeroSection from '@/components/HeroSection';
import FlashDeals from '@/components/FlashDeals';
import ProductGrid from '@/components/ProductGrid';
import TrustBadges from '@/components/TrustBadges';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import NotificationTokenCard from '@/components/NotificationTokenCard';

function Toast({ message, show }) {
  return (
    <AnimatePresence>
      {show && <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }} className="fixed left-1/2 top-24 z-[60] flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-2xl">
        <CheckCircle2 size={20} /><span>{message}</span>
      </motion.div>}
    </AnimatePresence>
  );
}

function Storefront() {
  const { addToCart } = useCart();
  const [allProducts, setAllProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError('');
    try {
      setAllProducts(await fetchStorefrontProducts());
    } catch (error) {
      setProductsError(error.message || 'تعذر تحميل منتجات المتجر.');
      setAllProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => { void loadProducts(); }, [loadProducts]);
  useEffect(() => {
    if (!toast.show) return undefined;
    const timer = setTimeout(() => setToast({ show: false, message: '' }), 2500);
    return () => clearTimeout(timer);
  }, [toast.show]);

  const showToast = useCallback((message) => setToast({ show: true, message }), []);
  const categories = useMemo(() => {
    const names = [...new Set(allProducts.map((product) => product.category).filter(Boolean))];
    return names.map((name, index) => ({ id: `api-category-${index}`, name, icon: 'Smartphone', subCategories: [] }));
  }, [allProducts]);

  const handleAddToCart = useCallback((product) => {
    if (!product?.vendorId || !product?.productId || Number(product.stockQuantity) < 1) {
      showToast('هذا المنتج غير متاح للشراء حاليًا');
      return;
    }
    addToCart({
      id: `${product.vendorId}:${product.productId}`,
      productId: product.productId,
      vendorId: product.vendorId,
      vendorName: product.vendorName,
      name: product.name,
      price: product.price,
      currency: product.currency,
      image: product.image,
      stockQuantity: product.stockQuantity,
      seller: product.seller,
      quantity: 1,
    });
    showToast('تمت الإضافة إلى السلة بنجاح');
  }, [addToCart, showToast]);

  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category || 'all');
    setSearchQuery('');
  }, []);
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setSelectedCategory('all');
  }, []);

  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory = selectedCategory === 'all'
      || (selectedCategory === 'flash' ? product.flashDeal : product.category === selectedCategory);
    const search = searchQuery.trim().toLocaleLowerCase();
    const matchesSearch = !search || [product.name, product.category, product.seller, product.vendorName, product.description]
      .some((value) => String(value || '').toLocaleLowerCase().includes(search));
    return matchesCategory && matchesSearch;
  });
  const isFiltered = selectedCategory !== 'all' || searchQuery !== '';
  const recommendedProducts = allProducts.slice(0, 8);
  const flashProducts = allProducts.filter((product) => product.flashDeal);
  const gridTitle = searchQuery
    ? `نتائج البحث عن: "${searchQuery}"`
    : selectedCategory === 'all'
      ? 'منتجات مختارة لك'
      : selectedCategory === 'flash'
        ? 'عروض فلاش المتجر'
        : `قسم ${selectedCategory}`;

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <Toast message={toast.message} show={toast.show} />
      <TopBar />
      <Header categories={categories} selectedCategory={selectedCategory} onCategorySelect={handleCategorySelect} onCategoryMenuClick={() => setCategoryDrawerOpen(true)} onCartClick={() => setCartDrawerOpen(true)} onSearch={handleSearch} />
      <CategoriesBar categories={categories} hasFlashDeals={flashProducts.length > 0} showBar onMenuClick={() => setCategoryDrawerOpen(true)} onCategorySelect={handleCategorySelect} drawerOpen={categoryDrawerOpen} onDrawerClose={() => setCategoryDrawerOpen(false)} />

      <main className="pb-8">
        <NotificationTokenCard />
        {productsLoading && <div className="mx-auto mt-5 flex max-w-7xl items-center justify-center gap-2 rounded-xl bg-white p-5 text-sm text-gray-600 shadow-sm"><LoaderCircle size={18} className="animate-spin text-brand-700" />جارٍ تحميل المنتجات المعتمدة من المتجر...</div>}
        {productsError && <div role="alert" className="mx-3 mt-5 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 md:mx-6 md:flex-row md:items-center md:justify-between"><span><AlertTriangle size={17} className="ml-2 inline" />{productsError}</span><button type="button" onClick={loadProducts} className="flex items-center justify-center gap-2 rounded-lg bg-amber-800 px-4 py-2 font-semibold text-white hover:bg-amber-900"><RefreshCw size={15} />إعادة المحاولة</button></div>}
        {!productsLoading && !productsError && allProducts.length === 0 && <p className="mx-3 mt-5 rounded-xl bg-white p-5 text-center text-sm text-gray-600 shadow-sm md:mx-6">لا توجد منتجات معتمدة للعرض حاليًا.</p>}
        {!isFiltered && <HeroSection />}
        {!isFiltered && flashProducts.length > 0 && <FlashDeals products={flashProducts} onAddToCart={handleAddToCart} />}
        {!isFiltered && recommendedProducts.length > 0 && <ProductGrid title="منتجات مختارة لك" subtitle="منتجات معتمدة من تجار المنصة" products={recommendedProducts} onAddToCart={handleAddToCart} showSeeAll />}
        {isFiltered && <div className="pt-6"><ProductGrid title={gridTitle} subtitle={`${filteredProducts.length} منتج متاح`} products={filteredProducts} onAddToCart={handleAddToCart} /></div>}
        {!isFiltered && allProducts.length > 0 && <ProductGrid title="تشكيلة واسعة من المنتجات" subtitle="تصفح جميع المنتجات المتاحة في المتجر" products={allProducts} onAddToCart={handleAddToCart} />}
        <TrustBadges />
      </main>

      <Footer />
      <CartDrawer open={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    </div>
  );
}

function App() {
  return <CartProvider><Storefront /></CartProvider>;
}

export default App;
