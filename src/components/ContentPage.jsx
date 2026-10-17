import { ArrowRight, BookOpen, Home } from 'lucide-react';
import Footer from './Footer';
import { contentPages } from '@/data/contentPages';

export default function ContentPage({ slug }) {
  const page = contentPages[slug];
  if (!page) return null;

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <header className="sticky top-0 z-30 border-b border-blue-950/10 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6">
          <a href="#" className="flex items-center gap-2 font-black text-brand-900" aria-label="العودة إلى المتجر">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-900 text-xl text-amber-300">س</span>
            <span>سوق اون لين</span>
          </a>
          <a href="#" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-brand-800 transition hover:bg-blue-50">
            <Home size={17} /> العودة للمتجر
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-3 py-8 md:px-6 md:py-12">
        <nav className="mb-5 text-sm text-gray-500" aria-label="مسار التنقل"><a href="#" className="hover:text-brand-700">الرئيسية</a><span className="mx-2">/</span><span className="text-gray-700">{page.title}</span></nav>
        <article className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="bg-gradient-to-l from-brand-950 via-brand-800 to-brand-700 px-5 py-9 text-white md:px-10 md:py-12">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-amber-300"><BookOpen size={25} /></div>
            <h1 className="text-2xl font-black md:text-4xl">{page.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100 md:text-base">{page.intro}</p>
          </div>
          <div className="space-y-7 px-5 py-8 md:px-10 md:py-10">
            {page.sections.map(([title, body]) => (
              <section key={title} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <h2 className="mb-2 text-lg font-bold text-gray-900 md:text-xl">{title}</h2>
                <p className="whitespace-pre-line text-sm leading-8 text-gray-600 md:text-base">{body}</p>
              </section>
            ))}
          </div>
          <div className="border-t border-gray-100 bg-gray-50 px-5 py-5 md:px-10">
            <a href="#" className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-900"><ArrowRight size={17} /> العودة إلى التسوق</a>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
