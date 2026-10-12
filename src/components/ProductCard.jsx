import { useCallback, useEffect, useState } from 'react';
import { Heart, ShoppingCart, BadgeCheck, Truck, X, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import StarRating from './StarRating';
export default function ProductCard({ product, onAddToCart, compact }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [heartAnim, setHeartAnim] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const productImages = Array.isArray(product.images) && product.images.length
      ? product.images.filter(Boolean)
      : (product.image ? [product.image] : []);
    const currentImage = productImages[Math.min(activeImageIndex, productImages.length - 1)] || product.image;
    const moveImage = useCallback((direction) => setActiveImageIndex((index) => (index + direction + productImages.length) % productImages.length), [productImages.length]);
    useEffect(() => {
        if (!galleryOpen) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setGalleryOpen(false);
            if (event.key === 'ArrowLeft') moveImage(1);
            if (event.key === 'ArrowRight') moveImage(-1);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [galleryOpen, moveImage]);
    const handleFavorite = () => {
        setIsFavorite(!isFavorite);
        setHeartAnim(true);
        setTimeout(() => setHeartAnim(false), 400);
    };
    const handleAddToCart = () => {
        onAddToCart(product);
    };
    return (<>
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-col group">
      {/* Image section */}
      <div className="relative bg-gray-50 overflow-hidden aspect-square">
        {/* Badge */}
        {product.badge && (<div className="absolute top-2 right-2 z-10">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md">
              {product.badge}
            </span>
          </div>)}

        {/* Favorite button */}
        <button onClick={handleFavorite} className="absolute top-2 left-2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors" aria-label="إضافة للمفضلة">
          <Heart size={18} className={`transition-colors ${heartAnim ? 'heart-bounce' : ''} ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}/>
        </button>

        {/* Product image with zoom effect */}
        <button type="button" onClick={() => productImages.length && setGalleryOpen(true)} disabled={!productImages.length} className="absolute inset-0 z-0 flex h-full w-full items-center justify-center p-4 disabled:cursor-default" aria-label={`عرض صور ${product.name}`}>
          {currentImage ? <img src={currentImage} alt={product.name} loading="lazy" className="zoom-img h-full w-full object-contain"/> : <span className="text-sm text-gray-400">لا توجد صورة</span>}
        </button>

        {productImages.length > 0 && <span className="pointer-events-none absolute left-1/2 top-2 z-[1] -translate-x-1/2 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <Images size={12} className="ml-1 inline"/>اضغط لعرض الصور
        </span>}

        {productImages.length > 1 && <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/85 px-2 py-1 shadow-sm" aria-label="صور المنتج">
          {productImages.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={(event) => { event.stopPropagation(); setActiveImageIndex(index); }} aria-label={`عرض الصورة ${index + 1}`} aria-pressed={activeImageIndex === index} className={`h-2 w-2 rounded-full transition-colors ${activeImageIndex === index ? 'bg-brand-700' : 'bg-gray-300 hover:bg-gray-500'}`} />)}
        </div>}

        {Number(product.stockQuantity) < 1 && <div className="absolute bottom-2 left-2 rounded-md bg-gray-800/85 px-2 py-1 text-[10px] font-semibold text-white">نفد المخزون</div>}

        {/* Free shipping badge */}
        {product.freeShipping && (<div className="absolute bottom-2 right-2 z-10">
            <span className="bg-emerald-500/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm flex items-center gap-1">
              <Truck size={12}/>
              <span>شحن مجاني</span>
            </span>
          </div>)}
      </div>

      {/* Info section */}
      <div className="p-3 flex flex-col flex-1">
        {/* Rating */}
        {Number(product.reviews) > 0 && <div className="mb-1.5"><StarRating rating={product.rating} reviews={product.reviews}/></div>}

        {/* Product name */}
        <h3 className={`font-semibold text-gray-800 leading-snug mb-1 line-clamp-2 ${compact ? 'text-xs' : 'text-sm'}`}>
          {product.name}
        </h3>

        {/* Weight/size */}
        {product.weight && (<p className="text-xs text-gray-500 mb-2">{product.weight}</p>)}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg md:text-xl font-bold text-brand-800">
            {Number(product.price || 0).toLocaleString('ar-EG')}
            <span className="text-xs font-normal text-gray-500 mr-1">{product.currency === 'EGP' ? 'ج.م' : product.currency || 'ج.م'}</span>
          </span>
          {Number(product.oldPrice) > Number(product.price) && <span className="text-xs text-gray-400 line-through">{Number(product.oldPrice).toLocaleString('ar-EG')}</span>}
        </div>

        {/* Seller */}
        <div className="flex items-center gap-1 mb-3 text-[11px] text-gray-500">
          <span>تباع بواسطة:</span>
          <span className="font-semibold text-gray-700">{product.seller || product.vendorName || 'تاجر معتمد'}</span>
          {product.trustedSeller && (<BadgeCheck size={13} className="text-brand-600"/>)}
        </div>

        {/* Action buttons */}
        <div className="mt-auto flex gap-2">
          <button onClick={handleAddToCart} disabled={Number(product.stockQuantity) < 1} className="flex-1 bg-accent-500 hover:bg-accent-600 text-white text-xs md:text-sm font-bold py-2 px-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:bg-gray-400">
            <ShoppingCart size={15}/>
            <span>أضف للسلة</span>
          </button>
          {!compact && (<button onClick={handleAddToCart} disabled={Number(product.stockQuantity) < 1} className="bg-brand-700 hover:bg-brand-800 text-white text-xs md:text-sm font-bold py-2 px-3 rounded-lg transition-colors flex items-center justify-center disabled:cursor-not-allowed disabled:bg-gray-400">
              <span>اشترِ الآن</span>
            </button>)}
        </div>
      </div>
      </div>
      {galleryOpen && <div role="dialog" aria-modal="true" aria-label={`معرض صور ${product.name}`} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 md:p-8" onMouseDown={(event) => { if (event.target === event.currentTarget) setGalleryOpen(false); }}>
        <button type="button" onClick={() => setGalleryOpen(false)} className="absolute left-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25" aria-label="إغلاق معرض الصور"><X size={24}/></button>
        <div className="flex h-full w-full max-w-6xl flex-col items-center justify-center gap-3">
          <div className="relative flex min-h-0 flex-1 items-center justify-center w-full">
            <img src={productImages[activeImageIndex]} alt={`${product.name} — الصورة ${activeImageIndex + 1}`} className="max-h-full max-w-full select-none object-contain" />
            {productImages.length > 1 && <>
              <button type="button" onClick={() => moveImage(-1)} className="absolute right-1 md:right-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70" aria-label="الصورة السابقة"><ChevronRight size={26}/></button>
              <button type="button" onClick={() => moveImage(1)} className="absolute left-1 md:left-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70" aria-label="الصورة التالية"><ChevronLeft size={26}/></button>
            </>}
          </div>
          <p className="text-center text-sm font-semibold text-white">{product.name} <span className="mr-2 text-white/70">{activeImageIndex + 1} / {productImages.length}</span></p>
          {productImages.length > 1 && <div className="no-scrollbar flex max-w-full gap-2 overflow-x-auto pb-1">
            {productImages.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setActiveImageIndex(index)} aria-label={`عرض الصورة ${index + 1}`} aria-pressed={activeImageIndex === index} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white/10 md:h-20 md:w-20 ${activeImageIndex === index ? 'border-white' : 'border-white/30 opacity-70 hover:opacity-100'}`}>
              <img src={image} alt="" className="h-full w-full object-contain" />
            </button>)}
          </div>}
        </div>
      </div>}
    </>);
}
