import { Mail, Facebook, Instagram, Twitter, MapPin, Phone, CreditCard } from 'lucide-react';

const footerLinks = [
  {
    title: 'عن المتجر',
    links: ['من نحن', 'تواصل معنا', 'الوظائف', 'المدونة', 'آراء العملاء'],
  },
  {
    title: 'خدمة العملاء',
    links: ['سياسة الشحن والتوصيل', 'سياسة الاسترجاع والاستبدال', 'الأسئلة الشائعة', 'تتبع طلبك', 'الدعم الفني'],
  },
  {
    title: 'بيع معنا',
    links: ['انضم كتاجر', 'دليل التاجر', 'شروط التسعير', 'العمولات والرسوم', 'تسجيل دخول التجار'],
  },
  {
    title: 'الشروط والأحكام',
    links: ['شروط الاستخدام', 'سياسة الخصوصية', 'ملفات الارتباط', 'حقوق الملكية الفكرية', 'إخلاء المسؤولية'],
  },
];

const paymentMethods = ['Visa', 'Mastercard', 'Vodafone Cash', 'InstaPay', 'الدفع عند الاستلام'];

export default function Footer() {
  return (
    <footer className="bg-brand-950 text-gray-300 mt-10">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-right">
              <h3 className="text-white font-bold text-lg mb-1">اشترك في النشرة البريدية</h3>
              <p className="text-sm text-gray-400">احصل على أحدث العروض والخصومات الحصرية مباشرة على بريدك</p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex items-center flex-1 md:w-80 bg-white rounded-lg overflow-hidden h-11">
                <Mail size={18} className="text-gray-400 mr-3" />
                <input
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  className="flex-1 h-full outline-none text-sm text-gray-800 bg-transparent"
                />
                <button className="bg-accent-500 hover:bg-accent-600 text-white text-sm font-bold px-4 h-full transition-colors whitespace-nowrap">
                  اشترك
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {/* Logo & info */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-11 h-11 bg-gradient-to-br from-brand-600 to-brand-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <div>
                <div className="font-bold text-lg text-white">النخبة</div>
                <div className="text-[10px] text-gray-400">متجر إلكتروني</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4 max-w-sm">
              متجر النخبة هو وجهتك الأولى للتسوق الإلكتروني في مصر. آلاف المنتجات الأصلية بأفضل الأسعار مع شحن سريع لجميع المحافظات ودفع عند الاستلام.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors" aria-label="فيسبوك">
                <Facebook size={18} className="text-white" />
              </a>
              <a href="#" className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors" aria-label="انستجرام">
                <Instagram size={18} className="text-white" />
              </a>
              <a href="#" className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors" aria-label="تويتر">
                <Twitter size={18} className="text-white" />
              </a>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-bold text-white text-sm mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-400 hover:text-accent-400 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={18} className="text-accent-400" />
            <span>القاهرة، مصر - شارع التحرير، مبنى النخبة التجاري</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Phone size={18} className="text-accent-400" />
              <span>19xxx</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={18} className="text-accent-400" />
              <span>support@al-nokhba.eg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment methods */}
      <div className="border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-gray-400" />
              <span className="text-sm text-gray-400">طرق الدفع المعتمدة:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {paymentMethods.map((method) => (
                <span
                  key={method}
                  className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-200 transition-colors"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-4 text-center">
          <p className="text-xs text-gray-500">
            © 2026 متجر النخبة. جميع الحقوق محفوظة. — صُمم بكل حب في مصر
          </p>
        </div>
      </div>
    </footer>
  );
}
