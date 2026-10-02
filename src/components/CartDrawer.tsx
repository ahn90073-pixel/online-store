import { X, Plus, Minus, Trash2, ShoppingCart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cartItems, cartCount, removeFromCart, updateQuantity } = useCart();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-brand-700 text-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart size={22} />
                <h2 className="font-bold text-lg">عربة التسوق ({cartCount})</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={36} className="text-gray-400" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">عربة التسوق فارغة</h3>
                  <p className="text-sm text-gray-500 mb-4">ابدأ بإضافة منتجاتك المفضلة</p>
                  <button
                    onClick={onClose}
                    className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-colors"
                  >
                    تصفح المنتجات
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-contain bg-white rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">{item.name}</h4>
                        <div className="text-brand-800 font-bold text-sm mb-2">
                          {item.price.toLocaleString('ar-EG')} ج.م
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 bg-white rounded-lg border border-gray-200 p-0.5">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors"
                            >
                              <Minus size={14} className="text-gray-600" />
                            </button>
                            <span className="text-sm font-bold w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors"
                            >
                              <Plus size={14} className="text-gray-600" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                            aria-label="حذف"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">الإجمالي:</span>
                  <span className="text-xl font-bold text-brand-800">
                    {total.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
                <button className="w-full bg-accent-500 hover:bg-accent-600 text-white font-bold py-3 rounded-xl transition-colors shadow-md">
                  إتمام الشراء
                </button>
                <button
                  onClick={onClose}
                  className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700 transition-colors py-2"
                >
                  متابعة التسوق
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
