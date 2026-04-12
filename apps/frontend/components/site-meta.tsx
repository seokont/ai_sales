'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLang } from '@/lib/language-context';

export function SiteMeta() {
  const pathname = usePathname();
  const { lang, t } = useLang();

  useEffect(() => {
    const isDashboard = pathname.startsWith('/dashboard');
    const isLogin = pathname === '/login';
    const isRegister = pathname === '/register';
    const m = t.meta;

    let title: string = m.defaultTitle;
    if (isDashboard) title = m.dashboardTitle;
    else if (isLogin) title = m.loginTitle;
    else if (isRegister) title = m.registerTitle;

    let description: string = m.defaultDescription;
    if (isDashboard) description = m.dashboardDescription;

    document.title = title;
    document.documentElement.lang = lang;

    const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('keywords', m.keywords);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('twitter:title', title, 'name');
    setMeta('twitter:description', description, 'name');
  }, [pathname, lang, t]);

  return null;
}
