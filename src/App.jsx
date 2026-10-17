import { Component, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, LoaderCircle, RefreshCw } from 'lucide-react';
import { CartProvider, useCart } from '@/context/CartContext';
import { fetchStorefrontProductsPage } from '@/api/storefront';
import { readCachedStorefrontProducts, saveCachedStorefrontProducts } from '@/api/storefrontProductCache';
import Header from '@/components/Header';
import CategoriesBar from '@/components/CategoriesBar';
import { categories as catalogCategories } from '@/data/storeData';
import HeroSection from '@/components/HeroSection';
import FlashDeals from '@/components/FlashDeals';
import ProductGrid from '@/components/ProductGrid';
import TrustBadges from '@/components/TrustBadges';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import StartupSplash from '@/components/StartupSplash';
import ContentPage from '@/components/ContentPage';
import { contentPages } from '@/data/contentPages';
import { exitAndroidApp, registerAndroidBackButton } from '@/utils/androidBackButton';

function Toast({ message, show }) {
  return <AnimatePresence>{show && <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }} className="fixed left-1/2 top-24 z-[60] flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-2xl"><CheckCircle2 size={20} /><span>{message}</span></motion.div>}</AnimatePresence>;
}

function useDebouncedValue(value, delay = 220) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => { const timer = window.setTimeout(() => setDebounced(value), delay); return () => window.clearTimeout(timer); }, [value, delay]);
  return debounced;
}

class AppErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error) { console.error('[UI] Unhandled render error:', error); }
  render() {
    if (this.state.hasError) {
      return <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6 text-center" dir="rtl"><div className="max-w-md rounded-2xl bg-white p-6 shadow-sm"><h1 className="text-xl font-bold text-gray-800">حدث خطأ غير متوقع</h1><p className="mt-2 text-sm text-gray-600">يمكنك إعادة تحميل الواجهة دون فقدان المنتجات المحفوظة.</p><button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-xl bg-brand-700 px-5 py-3 font-bold text-white">إعادة فتح التطبيق</button></div></div>;
    }
    return this.props.children;
  }
}

function Storefront() {
  const { addToCart } = useCart();
  const [allProducts, setAllProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 220);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [pageInfo, setPageInfo] = useState({ page: 0, totalPages: 1, hasMore: false });
  const requestController = useRef(null);
  const loadingMore = useRef(false);
  const touchStartY = useRef(null);
  const pullDistance = useRef(0);
  const [pullOffset, setPullOffset] = useState(0);
  const [pullRefreshing, setPullRefreshing] = useState(false);

  const loadProducts = useCallback(async ({ refresh = false } = {}) => {
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setProductsError('');
    try {
      const cachedProducts = refresh ? null : await readCachedStorefrontProducts();
      if (cachedProducts !== null) { setAllProducts(cachedProducts); setProductsLoading(false); }
      else setProductsLoading(true);
      const result = await fetchStorefrontProductsPage({ page: 1, limit: 40, signal: controller.signal });
      if (controller.signal.aborted) return;
      setAllProducts(result.items);
      setPageInfo(result);
      setProductsLoading(false);
      await saveCachedStorefrontProducts(result.items);
    } catch (error) {
      if (error?.name === 'AbortError') return;
      setProductsError(allProducts.length ? 'تعذر تحديث البيانات؛ نعرض آخر نسخة محفوظة.' : (error.message || 'تعذر تحميل منتجات المتجر.'));
      if (!allProducts.length) setAllProducts([]);
      setProductsLoading(false);
    }
  }, [allProducts.length]);

  const loadMoreProducts = useCallback(async () => {
    if (loadingMore.current || !pageInfo.hasMore || productsLoading) return;
    loadingMore.current = true;
    try {
      const result = await fetchStorefrontProductsPage({ page: pageInfo.page + 1, limit: 40 });
      setAllProducts((previous) => {
        const known = new Set(previous.map((item) => `${item.vendorId}:${item.productId}`));
        return previous.concat(result.items.filter((item) => !known.has(`${item.vendorId}:${item.productId}`)));
      });
      setPageInfo(result);
    } catch (error) { setProductsError(error.message || 'تعذر تحميل المزيد من المنتجات.'); }
    finally { loadingMore.current = false; }
  }, [pageInfo, productsLoading]);

  useEffect(() => { void loadProducts(); return () => requestController.current?.abort(); }, []); // initial load only
  useEffect(() => { if (!toast.show) return undefined; const timer = setTimeout(() => setToast({ show: false, message: '' }), 2500); return () => clearTimeout(timer); }, [toast.show]);
  useEffect(() => {
    let active = true; let removeListener = () => {};
    registerAndroidBackButton(() => { if (cartDrawerOpen) return setCartDrawerOpen(false); if (categoryDrawerOpen) return setCategoryDrawerOpen(false); return exitAndroidApp(); })
      .then((remove) => { if (active) removeListener = remove; else remove(); }).catch(() => {});
    return () => { active = false; removeListener(); };
  }, [cartDrawerOpen, categoryDrawerOpen]);
  useEffect(() => { const handle = () => { if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 900) void loadMoreProducts(); }; window.addEventListener('scroll', handle, { passive: true }); return () => window.removeEventListener('scroll', handle); }, [loadMoreProducts]);

  const showToast = useCallback((message) => setToast({ show: true, message }), []);
  const categories = useMemo(() => {
    const names = [...new Set(allProducts.map((product) => product.category).filter(Boolean))];
    const apiCategories = names.map((name, index) => ({ id: `api-category-${index}`, name, icon: 'Smartphone', subCategories: [] }));
    return [...catalogCategories, ...apiCategories.filter((category) => !catalogCategories.some((item) => item.name === category.name))];
  }, [allProducts]);
  const handleAddToCart = useCallback((product) => {
    if (!product?.vendorId || !product?.productId || Number(product.stockQuantity) < 1) return showToast('هذا المنتج غير متاح للشراء حاليًا');
    addToCart({ id: `${product.vendorId}:${product.productId}`, productId: product.productId, vendorId: product.vendorId, vendorName: product.vendorName, name: product.name, price: product.price, currency: product.currency, image: product.image, stockQuantity: product.stockQuantity, seller: product.seller, quantity: 1 });
    showToast('تمت الإضافة إلى السلة بنجاح');
  }, [addToCart, showToast]);
  const handleCategorySelect = useCallback((category) => { setSelectedCategory(category || 'all'); setSearchQuery(''); }, []);
  const handleSearch = useCallback((query) => { setSearchQuery(String(query || '')); setSelectedCategory('all'); }, []);
  const handleTouchStart = useCallback((event) => { if (window.scrollY <= 1 && !productsLoading) { touchStartY.current = event.touches[0].clientY; pullDistance.current = 0; } }, [productsLoading]);
  const handleTouchEnd = useCallback(async () => { const shouldRefresh = pullDistance.current >= 72; touchStartY.current = null; pullDistance.current = 0; setPullOffset(0); if (!shouldRefresh) return; setPullRefreshing(true); await loadProducts({ refresh: true }); setPullRefreshing(false); }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const search = debouncedSearch.toLocaleLowerCase();
    return allProducts.filter((product) => {
      const matchesCategory = selectedCategory === 'all' || (selectedCategory === 'flash' ? product.flashDeal : product.category === selectedCategory);
      const haystack = `${product.name} ${product.category} ${product.seller} ${product.vendorName} ${product.description}`.toLocaleLowerCase();
      return matchesCategory && (!search || haystack.includes(search));
    });
  }, [allProducts, debouncedSearch, selectedCategory]);
  const isFiltered = selectedCategory !== 'all' || searchQuery !== '';
  const flashProducts = useMemo(() => allProducts.filter((product) => product.flashDeal), [allProducts]);
  const recommendedProducts = useMemo(() => allProducts.slice(0, 8), [allProducts]);
  const gridTitle = searchQuery ? `نتائج البحث عن: "${searchQuery}"` : selectedCategory === 'all' ? 'منتجات مختارة لك' : selectedCategory === 'flash' ? 'عروض فلاش المتجر' : `قسم ${selectedCategory}`;

  return <>
    <StartupSplash ready={!productsLoading} />
    <div className="min-h-screen bg-gray-100" dir="rtl"><Toast message={toast.message} show={toast.show} />
      <Header categories={categories} selectedCategory={selectedCategory} onCategorySelect={handleCategorySelect} onCategoryMenuClick={() => setCategoryDrawerOpen(true)} onCartClick={() => setCartDrawerOpen(true)} onSearch={handleSearch} />
      <CategoriesBar categories={categories} selectedCategory={selectedCategory} hasFlashDeals={flashProducts.length > 0} showBar={false} onMenuClick={() => setCategoryDrawerOpen(true)} onCategorySelect={handleCategorySelect} drawerOpen={categoryDrawerOpen} onDrawerClose={() => setCategoryDrawerOpen(false)} />
      <main className="pb-8" onTouchStart={handleTouchStart} onTouchMove={(event) => { if (touchStartY.current === null || productsLoading) return; const distance = Math.max(0, Math.min(event.touches[0].clientY - touchStartY.current, 96)); pullDistance.current = distance; setPullOffset(distance); if (distance > 0 && window.scrollY <= 1 && event.cancelable) event.preventDefault(); }} onTouchEnd={handleTouchEnd}>
        {(pullOffset > 0 || pullRefreshing) && <div className="mx-auto mt-2 flex h-10 items-center justify-center gap-2 text-sm font-semibold text-brand-700" role="status"> <LoaderCircle size={18} className={pullRefreshing || pullOffset >= 72 ? 'animate-spin' : ''} />{pullRefreshing ? 'جارٍ تحديث المنتجات...' : pullOffset >= 72 ? 'أفلت للتحديث' : 'اسحب لأسفل لتحديث المنتجات'}</div>}
        {productsLoading && <div className="mx-auto mt-5 flex max-w-7xl items-center justify-center gap-2 rounded-xl bg-white p-5 text-sm text-gray-600 shadow-sm"><LoaderCircle size={18} className="animate-spin text-brand-700" />جارٍ تحميل المنتجات المعتمدة من المتجر...</div>}
        {productsError && <div role="alert" className="mx-3 mt-5 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 md:mx-6 md:flex-row md:items-center md:justify-between"><span><AlertTriangle size={17} className="ml-2 inline" />{productsError}</span><button type="button" onClick={() => loadProducts({ refresh: true })} className="flex items-center justify-center gap-2 rounded-lg bg-amber-800 px-4 py-2 font-semibold text-white"><RefreshCw size={15} />إعادة المحاولة</button></div>}
        {!productsLoading && !productsError && allProducts.length === 0 && <p className="mx-3 mt-5 rounded-xl bg-white p-5 text-center text-sm text-gray-600 shadow-sm md:mx-6">لا توجد منتجات معتمدة للعرض حاليًا.</p>}
        {!isFiltered && <HeroSection />}{!isFiltered && flashProducts.length > 0 && <FlashDeals products={flashProducts} onAddToCart={handleAddToCart} />}{!isFiltered && recommendedProducts.length > 0 && <ProductGrid title="منتجات مختارة لك" subtitle="منتجات معتمدة من تجار المنصة" products={recommendedProducts} onAddToCart={handleAddToCart} showSeeAll />}{isFiltered && <div className="pt-6"><ProductGrid title={gridTitle} subtitle={`${filteredProducts.length} منتج متاح`} products={filteredProducts} onAddToCart={handleAddToCart} /></div>}{!isFiltered && allProducts.length > 0 && <ProductGrid title="تشكيلة المنتجات المحمّلة" subtitle="يتم تحميل المزيد تلقائيًا أثناء التمرير" products={allProducts} onAddToCart={handleAddToCart} />}
        {pageInfo.hasMore && <div className="flex justify-center py-6"><button type="button" onClick={loadMoreProducts} className="rounded-xl bg-brand-700 px-6 py-3 text-sm font-bold text-white shadow-sm disabled:opacity-60" disabled={loadingMore.current}>{loadingMore.current ? 'جارٍ تحميل المزيد...' : 'تحميل المزيد من المنتجات'}</button></div>}
        <TrustBadges />
      </main><Footer /><CartDrawer open={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    </div>
  </>;
}

function App() {
  const [pageSlug, setPageSlug] = useState(() => window.location.hash.slice(1));
  useEffect(() => {
    const handleHashChange = () => { setPageSlug(window.location.hash.slice(1)); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  const isContentPage = Boolean(contentPages[pageSlug]);
  return <AppErrorBoundary><CartProvider>{isContentPage ? <ContentPage slug={pageSlug} /> : <Storefront />}</CartProvider></AppErrorBoundary>;
}
export default App;
export { AppErrorBoundary };
