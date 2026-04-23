'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, setTokens } from '@/lib/api';
import { useLang } from '@/lib/language-context';
import { Lang } from '@/lib/i18n';

export default function LoginPage() {
  const router = useRouter();
  const { t, lang, setLang } = useLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      setTokens(data.accessToken, data.refreshToken);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative">
      <Link
        href="/"
        className="absolute top-4 left-4 text-sm text-zinc-400 hover:text-emerald-400 transition inline-flex items-center gap-1.5"
      >
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {t.login.backToHome}
      </Link>
      <div className="absolute top-4 right-4 flex gap-2">
        {(['en', 'uk', 'ru', 'he'] as Lang[]).map((l) => (
          <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 rounded text-sm ${lang === l ? 'bg-emerald-600' : 'bg-zinc-800 hover:bg-zinc-700'}`}>
            {l === 'en' ? 'EN' : l === 'uk' ? 'УКР' : 'РУ'}
          </button>
        ))}
      </div>
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">{t.login.title}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">{t.login.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:border-emerald-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">{t.login.password}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:border-emerald-500 outline-none"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition"
          >
            {loading ? t.common.loading : t.login.submit}
          </button>
        </form>
        <p className="mt-4 text-zinc-400 text-sm">
          {t.login.noAccount} <Link href="/register" className="text-emerald-500 hover:underline">{t.login.register}</Link>
        </p>
      </div>
    </main>
  );
}
