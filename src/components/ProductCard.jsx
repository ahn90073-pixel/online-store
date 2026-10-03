import { useState } from 'react';
import { Heart, ShoppingCart, BadgeCheck, Truck } from 'lucide-react';
import StarRating from './StarRating';
export default function ProductCard({ product, onAddToCart, compact }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [heartAnim, setHeartAnim] = useState(false);
    const handleFavorite = () => {
        setIsFavorite(!isFavorite);
        setHeartAnim(true);
        setTimeout(() => setHeartAnim(false), 400);
    };
    const handleAddToCart = () => {
        onAddToCart(product);
    };
    return (<div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-col group">
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
        <div className="w-full h-full p-4">
          <img src={product.image} alt={product.name} loading="lazy" className="zoom-img w-full h-full object-contain"/>
        </div>

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
        <div className="mb-1.5">
          <StarRating rating={product.rating} reviews={product.reviews}/>
        </div>

        {/* Product name */}
        <h3 className={`font-semibold text-gray-800 leading-snug mb-1 line-clamp-2 ${compact ? 'text-xs' : 'text-sm'}`}>
          {product.name}
        </h3>

        {/* Weight/size */}
        {product.weight && (<p className="text-xs text-gray-500 mb-2">{product.weight}</p>)}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg md:text-xl font-bold text-brand-800">
            {product.price.toLocaleString('ar-EG')}
            <span className="text-xs font-normal text-gray-500 mr-1">ج.م</span>
          </span>
          <span className="text-xs text-gray-400 line-through">
            {product.oldPrice.toLocaleString('ar-EG')}
          </span>
        </div>

        {/* Seller */}
        <div className="flex items-center gap-1 mb-3 text-[11px] text-gray-500">
          <span>تباع بواسطة:</span>
          <span className="font-semibold text-gray-700">{product.seller}</span>
          {product.trustedSeller && (<BadgeCheck size={13} className="text-brand-600"/>)}
        </div>

        {/* Action buttons */}
        <div className="mt-auto flex gap-2">
          <button onClick={handleAddToCart} className="flex-1 bg-accent-500 hover:bg-accent-600 text-white text-xs md:text-sm font-bold py-2 px-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md">
            <ShoppingCart size={15}/>
            <span>أضف للسلة</span>
          </button>
          {!compact && (<button onClick={handleAddToCart} className="bg-brand-700 hover:bg-brand-800 text-white text-xs md:text-sm font-bold py-2 px-3 rounded-lg transition-colors flex items-center justify-center">
              <span>اشترِ الآن</span>
            </button>)}
        </div>
      </div>
    </div>);
}
