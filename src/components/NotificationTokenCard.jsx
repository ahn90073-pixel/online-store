import { useEffect, useState } from 'react';
import { Bell, Check, Copy } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

const FCM_TOKEN_STORAGE_KEY = 'online-store-fcm-token';

function readStoredToken() {
  try {
    return localStorage.getItem(FCM_TOKEN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export default function NotificationTokenCard() {
  const [token, setToken] = useState(readStoredToken);
  const [copied, setCopied] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    const handleTokenUpdate = (event) => {
      setToken(event.detail || '');
      setCopied(false);
    };
    window.addEventListener('fcm-token-updated', handleTokenUpdate);
    return () => window.removeEventListener('fcm-token-updated', handleTokenUpdate);
  }, []);

  const handleCopy = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
    } catch {
      const input = document.createElement('textarea');
      input.value = token;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="max-w-[1400px] mx-auto px-3 md:px-6 pt-4" aria-label="إعدادات إشعارات الهاتف">
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-l from-blue-50 to-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-brand-600 p-2 text-white">
            <Bell size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-gray-900">اختبار إشعارات الهاتف</h2>
            <p className="mt-1 text-xs leading-5 text-gray-600">
              انسخ رمز الجهاز والصقه في Firebase Console ضمن Send test message.
            </p>
            {!isNative && (
              <p className="mt-2 text-xs font-semibold text-amber-700">
                رمز FCM يظهر داخل نسخة Android أو iOS فقط.
              </p>
            )}
            {token ? (
              <>
                <div className="mt-3 rounded-lg border border-blue-100 bg-white p-2">
                  <code className="block max-h-16 overflow-auto break-all text-[10px] leading-4 text-gray-700" dir="ltr">
                    {token}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-700"
                >
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                  {copied ? 'تم النسخ' : 'نسخ رمز الإشعارات'}
                </button>
              </>
            ) : (
              <p className="mt-3 rounded-lg bg-white p-3 text-xs text-gray-600">
                {isNative ? 'جارٍ تسجيل الجهاز… افتح التطبيق مجددًا إذا لم يظهر الرمز.' : 'ثبّت نسخة الهاتف لعرض رمز الإشعارات.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
