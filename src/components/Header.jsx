import { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, ChevronDown, Heart, Package, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { categories } from '@/data/storeData';
import storeIcon from '../../asset/store-icon-1024.png';
export default function Header({ onCategoryMenuClick, onCartClick, onSearch }) {
    const { cartCount } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('جميع الأقسام');
    const [catDropdownOpen, setCatDropdownOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const catRef = useRef(null);
    useEffect(() => {
        function handleClickOutside(e) {
            if (catRef.current && !catRef.current.contains(e.target)) {
                setCatDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const handleSearch = () => {
        onSearch(searchQuery);
    };
    return (<header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-[1400px] mx-auto px-3 md:px-6">
        <div className="h-16 md:h-20 flex items-center gap-2 md:gap-4">
          {/* Mobile menu button */}
          <button onClick={onCategoryMenuClick} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="القائمة">
            <Menu size={24} className="text-brand-800"/>
          </button>

          {/* Logo */}
          <a href="#" className="flex items-center gap-1.5 flex-shrink-0" aria-label="سوق اون لين - OTA TEST">
            <img
              src={storeIcon}
              alt="سوق اون لين"
              className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 object-contain rounded-lg ring-2 ring-brand-600 ring-offset-1"
            />
            <span className="text-[9px] sm:text-[10px] font-bold text-brand-700 whitespace-nowrap">OTA TEST</span>
          </a>

          {/* Search bar - desktop */}
          <div className="hidden md:flex flex-1 max-w-3xl items-center border-2 border-brand-600 rounded-xl overflow-hidden h-11 bg-white">
            {/* Category dropdown */}
            <div className="relative" ref={catRef}>
              <button onClick={() => setCatDropdownOpen(!catDropdownOpen)} className="flex items-center gap-1.5 px-3 h-full bg-gray-50 hover:bg-gray-100 transition-colors border-l border-gray-200 whitespace-nowrap text-sm">
                <span className="font-medium text-gray-700">{selectedCategory}</span>
                <ChevronDown size={16} className={`text-gray-500 transition-transform ${catDropdownOpen ? 'rotate-180' : ''}`}/>
              </button>
              {catDropdownOpen && (<div className="absolute top-full right-0 mt-0.5 w-56 bg-white rounded-lg shadow-2xl z-50 max-h-80 overflow-y-auto custom-scroll border border-gray-100">
                  <button onClick={() => { setSelectedCategory('جميع الأقسام'); setCatDropdownOpen(false); }} className={`w-full text-right px-4 py-2.5 hover:bg-blue-50 transition-colors text-sm border-b border-gray-50 ${selectedCategory === 'جميع الأقسام' ? 'bg-blue-50 font-semibold text-brand-700' : ''}`}>
                    جميع الأقسام
                  </button>
                  {categories.map((cat) => (<button key={cat.id} onClick={() => { setSelectedCategory(cat.name); setCatDropdownOpen(false); }} className={`w-full text-right px-4 py-2.5 hover:bg-blue-50 transition-colors text-sm border-b border-gray-50 last:border-0 ${selectedCategory === cat.name ? 'bg-blue-50 font-semibold text-brand-700' : ''}`}>
                      {cat.name}
                    </button>))}
                </div>)}
            </div>
            {/* Search input */}
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="ابحث عن المنتجات، الماركات، والفئات..." className="flex-1 h-full px-3 outline-none text-sm"/>
            <button onClick={handleSearch} className="px-5 h-full bg-brand-600 hover:bg-brand-700 transition-colors flex items-center justify-center" aria-label="بحث">
              <Search size={20} className="text-white"/>
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 md:gap-3 mr-auto md:mr-0">
            {/* Mobile search toggle */}
            <button onClick={() => setMobileSearchOpen(!mobileSearchOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="بحث">
              <Search size={22} className="text-brand-800"/>
            </button>

            {/* Login */}
            <button className="hidden sm:flex items-center gap-2 px-2 md:px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
              <User size={22} className="text-brand-800"/>
              <div className="hidden lg:block text-right">
                <div className="text-[11px] text-gray-500 leading-none">أهلاً بك</div>
                <div className="text-sm font-semibold text-gray-800">تسجيل الدخول</div>
              </div>
            </button>

            {/* Orders */}
            <button className="hidden md:flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Package size={22} className="text-brand-800"/>
              <div className="hidden xl:block text-right">
                <div className="text-[11px] text-gray-500 leading-none">طلباتي</div>
                <div className="text-sm font-semibold text-gray-800">تتبع الشحنة</div>
              </div>
            </button>

            {/* Wishlist */}
            <button className="hidden md:flex p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Heart size={22} className="text-brand-800"/>
              <span className="absolute -top-0.5 -left-0.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">3</span>
            </button>

            {/* Cart */}
            <button onClick={onCartClick} className="flex items-center gap-2 px-2 md:px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors relative">
              <div className="relative">
                <ShoppingCart size={24} className="text-brand-800"/>
                {cartCount > 0 && (<span className="absolute -top-1.5 -left-1.5 bg-accent-500 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>)}
              </div>
              <div className="hidden lg:block text-right">
                <div className="text-[11px] text-gray-500 leading-none">عربة التسوق</div>
                <div className="text-sm font-semibold text-gray-800">{cartCount} منتج</div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {mobileSearchOpen && (<div className="md:hidden pb-3">
            <div className="flex items-center border-2 border-brand-600 rounded-lg overflow-hidden h-10 bg-white">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="ابحث عن منتج..." className="flex-1 h-full px-3 outline-none text-sm"/>
              <button onClick={handleSearch} className="px-4 h-full bg-brand-600 flex items-center justify-center">
                <Search size={18} className="text-white"/>
              </button>
              <button onClick={() => setMobileSearchOpen(false)} className="px-3 h-full bg-gray-100 flex items-center justify-center">
                <X size={18} className="text-gray-600"/>
              </button>
            </div>
          </div>)}
      </div>
    </header>);
}
