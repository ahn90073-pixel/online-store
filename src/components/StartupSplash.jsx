import { useEffect, useState } from 'react';

const MINIMUM_SPLASH_MS = 1100;
const MAXIMUM_SPLASH_MS = 2600;

export default function StartupSplash({ ready }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const startedAt = Date.now();
    let hideTimer;
    const hide = () => {
      const remaining = Math.max(0, MINIMUM_SPLASH_MS - (Date.now() - startedAt));
      hideTimer = window.setTimeout(() => setVisible(false), remaining);
    };

    if (ready) hide();
    const fallbackTimer = window.setTimeout(() => setVisible(false), MAXIMUM_SPLASH_MS);
    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(fallbackTimer);
    };
  }, [ready]);

  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 text-white" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-5 px-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white/15 shadow-2xl ring-1 ring-white/30 backdrop-blur-sm">
          <span className="text-5xl font-black text-amber-300">س</span>
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">سوق اون لين</h1>
          <p className="mt-2 text-sm text-blue-100">جارٍ تجهيز أحدث المنتجات...</p>
        </div>
        <span className="h-1.5 w-28 overflow-hidden rounded-full bg-white/25">
          <span className="block h-full w-1/2 animate-pulse rounded-full bg-amber-300" />
        </span>
      </div>
    </div>
  );
}
