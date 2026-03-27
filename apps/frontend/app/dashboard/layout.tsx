'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getAccessToken, clearTokens, api } from '@/lib/api';
import { useLang } from '@/lib/language-context';
import { Lang } from '@/lib/i18n';

const navKeys = [
  { href: '/dashboard', key: 'overview' as const },
  { href: '/dashboard/profile', key: 'profile' as const },
  { href: '/dashboard/widget', key: 'widget' as const },
  { href: '/dashboard/knowledge', key: 'knowledge' as const },
  { href: '/dashboard/scraper', key: 'scraper' as const, planRequired: 'pro' as const },
  { href: '/dashboard/chats', key: 'chats' as const },
  { href: '/dashboard/settings', key: 'settings' as const },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [plan, setPlan] = useState<string>('free');
  const [isAdmin, setIsAdmin] = useState(false);
  const { t, setLang } = useLang();

  useEffect(() => {
    setMounted(true);
    if (!getAccessToken()) router.push('/login');
  }, [router]);

  useEffect(() => {
    api.companies()
      .then((r) => r.json())
      .then((data: { company: { language?: string; plan?: string } }[]) => {
        const c = data[0]?.company;
        if (c?.language && (c.language === 'en' || c.language === 'uk' || c.language === 'ru' || c.language === 'he'))
          setLang(c.language);
        if (c?.plan) setPlan(c.plan);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    api.adminCheck()
      .then((r) => r.ok && setIsAdmin(true))
      .catch(() => {});
  }, []);

  const logout = () => {
    clearTokens();
    router.push('/login');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <aside className="w-56 border-r border-zinc-800 p-4 flex flex-col">
        <Link href="/dashboard" className="text-xl font-bold mb-6">AI Seller</Link>
        <nav className="flex-1 space-y-1">
          {navKeys
            .filter((item) => {
              const req = 'planRequired' in item ? (item as { planRequired?: string }).planRequired : null;
              if (req && (plan === 'free' || !plan)) return false;
              return true;
            })
            .map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                className={`block px-3 py-2 rounded-lg transition ${
                  pathname === href ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                }`}
              >
                {t.nav[key]}
              </Link>
            ))}
          {isAdmin && (
            <Link
              href="/dashboard/admin"
              className={`block px-3 py-2 rounded-lg transition ${
                pathname === '/dashboard/admin' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              {t.nav.admin}
            </Link>
          )}
        </nav>
        <button
          onClick={logout}
          className="px-3 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition text-left"
        >
          {t.common.logout}
        </button>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
