import { Truck, Banknote, ShieldCheck, Headphones } from 'lucide-react';

const badges = [
  {
    icon: Truck,
    title: 'شحن لجميع المحافظات',
    description: 'ربط مباشر مع أفضل شركات الشحن',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Banknote,
    title: 'الدفع عند الاستلام',
    description: 'ادفع كاش فور معاينة واستلام الشحنة',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    icon: ShieldCheck,
    title: 'ضمان الاسترجاع',
    description: 'إمكانية إرجاع المنتجات بسهولة خلال 14 يوم',
    color: 'text-accent-600',
    bgColor: 'bg-orange-50',
  },
  {
    icon: Headphones,
    title: 'دعم سريع',
    description: 'خدمة عملاء متواجدة على مدار الساعة',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

export default function TrustBadges() {
  return (
    <section className="max-w-[1400px] mx-auto px-3 md:px-6 mt-6">
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {badges.map((badge, i) => {
            const Icon = badge.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-3 p-3 md:p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`w-12 h-12 ${badge.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon size={24} className={badge.color} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-800 leading-tight">{badge.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">{badge.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
