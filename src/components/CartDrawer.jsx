import { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingCart, ShoppingBag, LoaderCircle, CheckCircle2, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { createStoreOrder } from '@/api/storefront';
import { motion, AnimatePresence } from 'framer-motion';

const emptyCustomer = { fullName: '', phone: '', email: '' };
const emptyAddress = { country: 'Egypt', governorate: '', city: '', district: '', street: '', building: '', apartment: '', postalCode: '', notes: '' };

function TextField({ label, value, onChange, required = false, type = 'text', placeholder = '' }) {
  return (
    <label className="block min-w-0 space-y-1">
      <span className="text-xs font-semibold text-gray-700">{label}{required && <span className="text-red-600"> *</span>}</span>
      <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-blue-100" type={type} value={value} onChange={onChange} required={required} placeholder={placeholder} />
    </label>
  );
}

export default function CartDrawer({ open, onClose }) {
  const { cartItems, cartCount, removeFromCart, updateQuantity, clearCart } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customer, setCustomer] = useState(emptyCustomer);
  const [address, setAddress] = useState(emptyAddress);
  const [customerNote, setCustomerNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedOrders, setSubmittedOrders] = useState(null);
  const total = cartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

  const close = () => {
    onClose();
    setCheckoutOpen(false);
    setError('');
    setSubmittedOrders(null);
  };

  const updateCustomer = (field) => (event) => setCustomer((current) => ({ ...current, [field]: event.target.value }));
  const updateAddress = (field) => (event) => setAddress((current) => ({ ...current, [field]: event.target.value }));

  const submitOrder = async (event) => {
    event.preventDefault();
    if (submitting || cartItems.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      const result = await createStoreOrder({
        customer: { ...customer, fullName: customer.fullName.trim(), phone: customer.phone.trim(), email: customer.email.trim() },
        address: { ...address, governorate: address.governorate.trim(), city: address.city.trim(), street: address.street.trim() },
        items: cartItems,
        customerNote: customerNote.trim(),
      });
      setSubmittedOrders(result?.orders || []);
      clearCart();
    } catch (submitError) {
      setError(submitError.message || 'تعذر إتمام الطلب. تحقق من بياناتك ومخزون المنتجات.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} className="fixed inset-0 z-50 bg-black/50" />
          <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }} className="fixed left-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl sm:w-[min(100vw,30rem)]" dir="rtl" aria-label="عربة التسوق">
            <div className="flex flex-shrink-0 items-center justify-between bg-brand-700 p-4 text-white">
              <div className="flex items-center gap-2"><ShoppingCart size={22} /><h2 className="text-lg font-bold">{submittedOrders ? 'تم تسجيل الطلب' : checkoutOpen ? 'بيانات التوصيل' : `عربة التسوق (${cartCount})`}</h2></div>
              <button type="button" onClick={close} className="rounded-lg p-1 transition-colors hover:bg-white/20" aria-label="إغلاق"><X size={22} /></button>
            </div>

            {submittedOrders ? (
              <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 size={34} /></div>
                <h3 className="mt-4 text-xl font-bold text-gray-900">وصل طلبك إلى الإدارة</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-gray-600">حُفظ الطلب بانتظار المراجعة. عند وجود منتجات من أكثر من تاجر ستظهر أرقام طلب منفصلة لكل تاجر.</p>
                <div className="mt-5 w-full space-y-2 text-right">
                  {submittedOrders.map((order) => <div key={order.orderId} className="rounded-xl border border-gray-200 bg-gray-50 p-3"><p className="text-xs text-gray-500">{order.vendorName}</p><p className="mt-1 font-bold text-brand-800">{order.orderNumber}</p><p className="mt-1 text-sm text-gray-700">{Number(order.total).toLocaleString('ar-EG')} {order.currency}</p></div>)}
                </div>
                <button type="button" onClick={close} className="mt-6 w-full rounded-xl bg-brand-700 px-5 py-3 font-bold text-white hover:bg-brand-800">متابعة التسوق</button>
              </div>
            ) : checkoutOpen ? (
              <form onSubmit={submitOrder} className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-900">الشراء كضيف ولا يتطلب إنشاء حساب. بيانات الطلب تُرسل إلى لوحة الإدارة العامة لمراجعتها وتوجيهها إلى التاجر.</div>
                  {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-700">{error}</div>}
                  <section className="space-y-3"><h3 className="font-bold text-gray-900">بيانات العميل</h3>
                    <TextField label="الاسم بالكامل" value={customer.fullName} onChange={updateCustomer('fullName')} required placeholder="الاسم الذي يستلم الطلب" />
                    <div className="grid grid-cols-2 gap-3"><TextField label="رقم الهاتف" value={customer.phone} onChange={updateCustomer('phone')} required type="tel" placeholder="01xxxxxxxxx" /><TextField label="البريد الإلكتروني" value={customer.email} onChange={updateCustomer('email')} type="email" placeholder="اختياري" /></div>
                  </section>
                  <section className="space-y-3 border-t border-gray-100 pt-4"><h3 className="font-bold text-gray-900">عنوان التوصيل</h3>
                    <div className="grid grid-cols-2 gap-3"><TextField label="المحافظة" value={address.governorate} onChange={updateAddress('governorate')} required /><TextField label="المدينة" value={address.city} onChange={updateAddress('city')} required /></div>
                    <TextField label="الحي / المنطقة" value={address.district} onChange={updateAddress('district')} />
                    <TextField label="العنوان التفصيلي (الشارع ورقم المنزل)" value={address.street} onChange={updateAddress('street')} required placeholder="الشارع، علامة مميزة، إلخ" />
                    <div className="grid grid-cols-2 gap-3"><TextField label="المبنى" value={address.building} onChange={updateAddress('building')} /><TextField label="الشقة" value={address.apartment} onChange={updateAddress('apartment')} /></div>
                    <TextField label="ملاحظات العنوان" value={address.notes} onChange={updateAddress('notes')} placeholder="اختياري" />
                  </section>
                  <section className="space-y-2 border-t border-gray-100 pt-4"><label className="block text-sm font-semibold text-gray-700" htmlFor="customer-note">ملاحظات للطلب (اختياري)</label><textarea id="customer-note" rows={3} maxLength={1000} value={customerNote} onChange={(event) => setCustomerNote(event.target.value)} className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-blue-100" /></section>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"><Truck size={15} className="ml-1 inline" />الدفع عند الاستلام. رسوم الشحن النهائية يحددها فريق الإدارة بعد مراجعة الطلب.</div>
                </div>
                <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between"><span className="text-sm text-gray-600">قيمة المنتجات:</span><span className="text-lg font-bold text-brand-800">{total.toLocaleString('ar-EG')} ج.م</span></div>
                  <button type="submit" disabled={submitting || cartItems.length === 0} className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 py-3 font-bold text-white shadow-md transition-colors hover:bg-accent-600 disabled:cursor-wait disabled:opacity-60">{submitting ? <><LoaderCircle size={18} className="animate-spin" />جارٍ إرسال الطلب...</> : 'تأكيد الشراء'}</button>
                  <button type="button" onClick={() => { setCheckoutOpen(false); setError(''); }} className="mt-2 w-full py-2 text-sm text-gray-500 hover:text-gray-700">العودة إلى السلة</button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4">
                  {cartItems.length === 0 ? <div className="flex h-full flex-col items-center justify-center text-center"><div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100"><ShoppingBag size={36} className="text-gray-400" /></div><h3 className="mb-1 font-bold text-gray-800">عربة التسوق فارغة</h3><p className="mb-4 text-sm text-gray-500">ابدأ بإضافة منتجاتك المفضلة</p><button type="button" onClick={close} className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700">تصفح المنتجات</button></div> : (
                    <div className="space-y-3">{cartItems.map((item) => <div key={item.id} className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                      <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">{item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-contain" /> : <ShoppingBag size={24} className="text-gray-300" />}</div>
                      <div className="min-w-0 flex-1"><h4 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-800">{item.name}</h4><p className="text-xs text-gray-500">التاجر: {item.vendorName || item.seller || '—'}</p><div className="mb-2 mt-1 text-sm font-bold text-brand-800">{Number(item.price).toLocaleString('ar-EG')} ج.م</div>
                        <div className="flex items-center justify-between"><div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white p-0.5"><button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-gray-100" aria-label="تقليل الكمية"><Minus size={14} /></button><span className="w-8 text-center text-sm font-bold">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= Number(item.stockQuantity || 0)} className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30" aria-label="زيادة الكمية"><Plus size={14} /></button></div><button type="button" onClick={() => removeFromCart(item.id)} className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50" aria-label="حذف المنتج"><Trash2 size={16} /></button></div>
                      </div>
                    </div>)}</div>
                  )}
                </div>
                {cartItems.length > 0 && <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4"><div className="mb-3 flex items-center justify-between"><span className="text-sm text-gray-600">قيمة المنتجات:</span><span className="text-xl font-bold text-brand-800">{total.toLocaleString('ar-EG')} ج.م</span></div><p className="mb-3 text-xs text-gray-500">الإجمالي لا يشمل رسوم الشحن؛ تحددها الإدارة عند مراجعة الطلب.</p><button type="button" onClick={() => setCheckoutOpen(true)} className="w-full rounded-xl bg-accent-500 py-3 font-bold text-white shadow-md transition-colors hover:bg-accent-600">إتمام الشراء</button><button type="button" onClick={close} className="mt-2 w-full py-2 text-sm text-gray-500 transition-colors hover:text-gray-700">متابعة التسوق</button></div>}
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
