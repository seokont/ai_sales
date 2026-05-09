'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useLang } from '@/lib/language-context';
import { Lang } from '@/lib/i18n';
import { AnimateOnScroll } from '@/components/animate-on-scroll';
import { api } from '@/lib/api';

function TypingDots() {
  return (
    <div className="flex gap-1 items-center px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

function HeroWidgetMock({ t }: { t: any }) {
  const [tick, setTick] = useState(0);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    setPhase(0);
    const timers = [
      setTimeout(() => setPhase(1), 900),
      setTimeout(() => setPhase(2), 1800),
      setTimeout(() => setPhase(3), 3300),
      setTimeout(() => setPhase(4), 5100),
      setTimeout(() => setPhase(5), 6000),
      setTimeout(() => setPhase(6), 7700),
      setTimeout(() => setTick((n) => n + 1), 12500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [tick]);

  return (
    <div className="relative w-full max-w-[460px] mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-zinc-700/50 animate-float">
      {/* Browser chrome */}
      <div className="bg-zinc-800 px-4 py-2.5 flex items-center gap-2.5 border-b border-zinc-700/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
          <div className="w-3 h-3 rounded-full bg-green-400/70" />
        </div>
        <div className="flex-1 bg-zinc-700/60 rounded text-xs text-zinc-500 px-3 py-1 text-center">
          myshop.com/products
        </div>
      </div>

      {/* Fake website */}
      <div className="bg-zinc-900 h-80 relative overflow-hidden">
        {/* Fake nav */}
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-3">
          <div className="w-20 h-2.5 bg-emerald-600/40 rounded-full" />
          <div className="flex gap-3 ml-auto">
            <div className="w-14 h-2 bg-zinc-700/60 rounded" />
            <div className="w-12 h-2 bg-zinc-700/60 rounded" />
            <div className="w-16 h-2 bg-zinc-700/60 rounded" />
            <div className="w-10 h-2 bg-zinc-700/60 rounded" />
          </div>
        </div>
        {/* Fake page content */}
        <div className="px-5 py-3 flex gap-4">
          <div className="flex-1 pt-1">
            <div className="w-3/4 h-4 bg-zinc-700/50 rounded mb-2.5" />
            <div className="w-1/2 h-2.5 bg-zinc-700/30 rounded mb-4" />
            <div className="w-24 h-7 bg-emerald-600/25 rounded-lg" />
          </div>
          <div className="w-28 h-20 bg-zinc-700/25 rounded-xl shrink-0" />
        </div>
        {/* Fake product grid */}
        <div className="grid grid-cols-3 gap-2 px-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl bg-zinc-800/50 overflow-hidden border border-zinc-700/25">
              <div className="h-11 bg-zinc-700/25" />
              <div className="p-2">
                <div className="w-full h-1.5 bg-zinc-700/40 rounded mb-1.5" />
                <div className="w-8 h-2 bg-emerald-600/25 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Widget panel */}
        <div className="absolute bottom-2 right-2 w-[200px] rounded-2xl shadow-2xl border border-zinc-600/40 overflow-hidden bg-zinc-900">
          {/* Widget header */}
          <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 px-3 py-2.5 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm shrink-0">
              🤖
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-semibold">AI Assistant</div>
              <div className="flex items-center gap-1 text-emerald-100 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block animate-pulse" />
                Online
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="px-2 pt-2 pb-1 space-y-1.5 text-[10px] min-h-[116px]">
            <div className="flex gap-1.5 items-end">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 shrink-0 flex items-center justify-center text-[7px] text-white font-bold">
                AI
              </div>
              <div className="bg-zinc-800 rounded-xl rounded-bl-sm px-2 py-1 text-zinc-300 max-w-[82%] leading-relaxed">
                {t.home.demoGreeting}
              </div>
            </div>
            {phase >= 1 && (
              <div className="flex justify-end animate-fade-up">
                <div className="bg-emerald-600 rounded-xl rounded-br-sm px-2 py-1 text-white max-w-[82%] leading-relaxed">
                  {t.home.demoQ1}
                </div>
              </div>
            )}
            {phase === 2 && (
              <div className="flex gap-1.5 items-end">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 shrink-0 flex items-center justify-center text-[7px] text-white font-bold">
                  AI
                </div>
                <div className="bg-zinc-800 rounded-xl rounded-bl-sm px-2 py-1.5">
                  <TypingDots />
                </div>
              </div>
            )}
            {phase >= 3 && (
              <div className="flex gap-1.5 items-end animate-fade-up">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 shrink-0 flex items-center justify-center text-[7px] text-white font-bold">
                  AI
                </div>
                <div className="bg-zinc-800 rounded-xl rounded-bl-sm px-2 py-1 text-zinc-300 max-w-[82%] leading-relaxed">
                  {t.home.demoA1}
                </div>
              </div>
            )}
            {phase >= 4 && (
              <div className="flex justify-end animate-fade-up">
                <div className="bg-emerald-600 rounded-xl rounded-br-sm px-2 py-1 text-white max-w-[82%]">
                  {t.home.demoQ2}
                </div>
              </div>
            )}
            {phase === 5 && (
              <div className="flex gap-1.5 items-end">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 shrink-0 flex items-center justify-center text-[7px] text-white font-bold">
                  AI
                </div>
                <div className="bg-zinc-800 rounded-xl rounded-bl-sm px-2 py-1.5">
                  <TypingDots />
                </div>
              </div>
            )}
            {phase >= 6 && (
              <div className="flex gap-1.5 items-end animate-fade-up">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 shrink-0 flex items-center justify-center text-[7px] text-white font-bold">
                  AI
                </div>
                <div className="bg-zinc-800 rounded-xl rounded-bl-sm px-2 py-1 text-zinc-300 max-w-[82%] leading-relaxed">
                  {t.home.demoA2}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-2 py-1.5 border-t border-zinc-800 flex items-center gap-1.5 bg-zinc-900/60">
            <div className="flex-1 bg-zinc-800 rounded-full text-[9px] text-zinc-600 px-2.5 py-1">
              {t.home.demoPlaceholder}
            </div>
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shrink-0">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoChat({
  t,
  externalTrigger,
  onTriggerConsumed,
}: {
  t: any;
  externalTrigger: string;
  onTriggerConsumed: () => void;
}) {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [sessionId] = useState(() => `demo_${Math.random().toString(36).slice(2, 10)}`);
  const bottomRef = useRef<HTMLDivElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const apiKey =
    process.env.NEXT_PUBLIC_DEMO_WIDGET_KEY ?? 'sk_demo_main_page_000000000000000000000000';

  useEffect(() => {
    setMessages([{ role: 'ai', text: t.home.demoGreeting }]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;
      const userText = text.trim();
      setInput('');
      setMessages((prev) => [...prev, { role: 'user', text: userText }]);
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/widget/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey,
            message: userText,
            sessionId,
            ...(chatId ? { chatId } : {}),
          }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.chatId) setChatId(data.chatId);
        setMessages((prev) => [...prev, { role: 'ai', text: data.reply ?? '…' }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: 'ai', text: '⚠️ ' + t.home.contactError },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, sessionId, chatId, apiUrl, apiKey, t]
  );

  useEffect(() => {
    if (externalTrigger) {
      sendMessage(externalTrigger);
      onTriggerConsumed();
    }
  }, [externalTrigger]);

  return (
    <div className="flex flex-col h-[500px] rounded-2xl border border-zinc-700/50 bg-zinc-900 overflow-hidden shadow-2xl shadow-black/40">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-3.5 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg shrink-0">
          🤖
        </div>
        <div>
          <div className="text-white font-semibold text-sm">AI Seller Widget</div>
          <div className="text-emerald-100 text-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse inline-block" />
            Online
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex animate-fade-up ${
              msg.role === 'user' ? 'justify-end' : 'items-end gap-2'
            }`}
          >
            {msg.role === 'ai' && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 shrink-0 flex items-center justify-center text-[9px] text-white font-bold">
                AI
              </div>
            )}
            <div
              className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-sm'
                  : 'bg-zinc-800 text-zinc-200 rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-end gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 shrink-0 flex items-center justify-center text-[9px] text-white font-bold">
              AI
            </div>
            <div className="bg-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3">
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3.5 border-t border-zinc-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.home.demoPlaceholder}
            disabled={loading}
            className="flex-1 bg-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 border border-zinc-700/60 focus:outline-none focus:border-emerald-500/60 disabled:opacity-50 transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shrink-0 disabled:opacity-40 hover:opacity-90 transition"
          >
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Home() {
  const { t, lang, setLang } = useLang();
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactPlan, setContactPlan] = useState('');
  const [contactSending, setContactSending] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactEmailWarning, setContactEmailWarning] = useState('');
  const [contactError, setContactError] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoTrigger, setDemoTrigger] = useState('');
  const [useCaseTab, setUseCaseTab] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 animate-fade-up ${scrolled ? 'bg-zinc-950/95 backdrop-blur-md shadow-lg shadow-black/30 border-b border-zinc-800/60' : 'border-b border-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="#" className="shrink-0 text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            AI Seller Widget
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {([
              ['#features', t.home.navFeatures],
              ['#integrations', t.home.navIntegrations],
              ['#pricing', t.home.navPricing],
              ['#cases', t.home.navCases],
              ['#faq', t.home.navFaq],
            ] as [string, string][]).map(([href, label]) => (
              <a key={href} href={href} className="text-zinc-400 hover:text-white transition">
                {label}
              </a>
            ))}
          </nav>

          {/* Right: lang + auth + hamburger */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex gap-1">
              {(['en', 'uk', 'ru', 'he'] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-1 rounded text-xs transition ${lang === l ? 'bg-emerald-600 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
                >
                  {l === 'en' ? 'EN' : l === 'uk' ? 'УКР' : l === 'ru' ? 'РУ' : 'עב'}
                </button>
              ))}
            </div>
            <Link href="/login" className="hidden sm:inline text-sm text-zinc-400 hover:text-white transition px-2">
              {t.home.login}
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition whitespace-nowrap"
            >
              {t.home.tryFree}
            </Link>
            {/* Hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-zinc-800/50 bg-zinc-950/98 backdrop-blur-md px-6 py-4 flex flex-col gap-4">
            <nav className="flex flex-col gap-3 text-sm font-medium">
              {([
                ['#features', t.home.navFeatures],
                ['#integrations', t.home.navIntegrations],
                ['#pricing', t.home.navPricing],
                ['#cases', t.home.navCases],
                ['#faq', t.home.navFaq],
              ] as [string, string][]).map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="text-zinc-300 hover:text-white py-1 transition"
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/50">
              <div className="flex gap-1 flex-1">
                {(['en', 'uk', 'ru', 'he'] as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-2 py-1 rounded text-xs transition ${lang === l ? 'bg-emerald-600 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
                  >
                    {l === 'en' ? 'EN' : l === 'uk' ? 'УКР' : l === 'ru' ? 'РУ' : 'עב'}
                  </button>
                ))}
              </div>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-zinc-400 hover:text-white transition"
              >
                {t.home.login}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative isolate pt-28 pb-16 px-6 overflow-hidden min-h-[90vh] flex items-center">
        {/* Glow orbs */}
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <div className="absolute -top-40 right-0 w-[700px] h-[700px] bg-emerald-500/[0.06] rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-[500px] h-[500px] bg-cyan-500/[0.05] rounded-full blur-3xl" />
        </div>

        <div className="relative z-[2] max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 xl:gap-20 items-center py-12">
          {/* Copy */}
          <div>
            <AnimateOnScroll variant="fade-up" delay={0}>
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold mb-6 leading-[1.1] tracking-tight">
                {t.home.heroTitle}
              </h1>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={120}>
              <p className="text-lg text-zinc-400 mb-8 leading-relaxed max-w-lg">
                {t.home.heroDesc}
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={240}>
              <div className="flex flex-wrap gap-4 mb-5">
                <Link
                  href="/register"
                  className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold transition shadow-lg shadow-emerald-500/25 hover:scale-105"
                >
                  {t.home.heroCta1}
                </Link>
                <a
                  href="#demo"
                  className="px-7 py-3.5 rounded-xl border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50 transition hover:scale-105 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {t.home.heroCta2}
                </a>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={360}>
              <p className="text-sm text-zinc-500">{t.home.heroProof}</p>
            </AnimateOnScroll>
          </div>

          {/* Animated widget mockup */}
          <AnimateOnScroll variant="fade-up" delay={150}>
            <div className="hidden lg:block">
              <HeroWidgetMock t={t} />
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Social Proof Bar */}
      <div className="border-y border-zinc-800/50 bg-zinc-900/20 py-5 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest shrink-0 whitespace-nowrap">
            {t.home.worksWithLabel}
          </span>
          <div className="hidden sm:block h-4 w-px bg-zinc-700/60 shrink-0" />
          <div className="overflow-hidden relative w-full sm:w-auto">
            <div className="flex gap-2.5 animate-marquee">
              {([
                'Shopify', 'WooCommerce', 'Tilda', 'Хорошоп',
                'OpenCart', 'PrestaShop', 'Wix', 'BigCommerce',
                'Shopify', 'WooCommerce', 'Tilda', 'Хорошоп',
                'OpenCart', 'PrestaShop', 'Wix', 'BigCommerce',
              ] as const).map((name, i) => (
                <span
                  key={i}
                  className="shrink-0 px-3.5 py-1.5 rounded-full text-sm text-zinc-400 border border-zinc-700/50 bg-zinc-800/20 whitespace-nowrap select-none"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Problem */}
      <section className="py-20 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.home.problemTitle}</h2>
              <p className="text-zinc-500 text-lg max-w-xl mx-auto">{t.home.problemSub}</p>
            </div>
          </AnimateOnScroll>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {([
              {
                color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                ),
                title: t.home.problem1Title,
                desc: t.home.problem1Desc,
              },
              {
                color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ),
                title: t.home.problem2Title,
                desc: t.home.problem2Desc,
              },
              {
                color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                ),
                title: t.home.problem3Title,
                desc: t.home.problem3Desc,
              },
              {
                color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                ),
                title: t.home.problem4Title,
                desc: t.home.problem4Desc,
              },
            ] as { color: string; icon: React.ReactNode; title: string; desc: string }[]).map(
              ({ color, icon, title, desc }, i) => (
                <AnimateOnScroll key={i} variant="fade-up" delay={i * 80}>
                  <div className="h-full p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all hover:-translate-y-0.5">
                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-5 ${color}`}>
                      {icon}
                    </div>
                    <h3 className="font-semibold text-zinc-100 mb-2 leading-snug">{title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
                  </div>
                </AnimateOnScroll>
              )
            )}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-20 px-6 border-t border-zinc-800/50 bg-zinc-900/20">
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-semibold text-emerald-400 uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 mb-5">
                AI Seller Widget
              </span>
              <h2 className="text-3xl md:text-4xl font-bold">{t.home.solutionTitle}</h2>
            </div>
          </AnimateOnScroll>

          <div className="relative grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Dashed connector line */}
            <div
              className="hidden md:block absolute top-[2.75rem] pointer-events-none"
              style={{ left: 'calc(33.33% + 20px)', right: 'calc(33.33% + 20px)' }}
            >
              <div className="h-px border-t-2 border-dashed border-zinc-700/50" />
            </div>

            {([
              {
                n: 1,
                gradient: 'from-emerald-500 to-cyan-500',
                shadow: 'shadow-emerald-500/20',
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: t.home.solution1Title,
                desc: t.home.solution1Desc,
              },
              {
                n: 2,
                gradient: 'from-violet-500 to-purple-500',
                shadow: 'shadow-violet-500/20',
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                ),
                title: t.home.solution2Title,
                desc: t.home.solution2Desc,
              },
              {
                n: 3,
                gradient: 'from-amber-500 to-orange-500',
                shadow: 'shadow-amber-500/20',
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                ),
                title: t.home.solution3Title,
                desc: t.home.solution3Desc,
              },
            ] as { n: number; gradient: string; shadow: string; icon: React.ReactNode; title: string; desc: string }[]).map(
              ({ n, gradient, shadow, icon, title, desc }, i) => (
                <AnimateOnScroll key={i} variant="scale-in" delay={i * 120}>
                  <div className="flex flex-col items-center text-center">
                    <div className={`relative w-[5.5rem] h-[5.5rem] rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-xl ${shadow}`}>
                      {icon}
                      <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 text-[11px] font-bold text-zinc-300 flex items-center justify-center">
                        {n}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-3 leading-snug">{title}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">{desc}</p>
                  </div>
                </AnimateOnScroll>
              )
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-20">
              <span className="inline-block text-xs font-semibold text-emerald-400 uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 mb-5">
                {t.home.howLabel}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.home.howTitle}</h2>
              <p className="text-zinc-400 text-lg">{t.home.howSubtitle}</p>
            </div>
          </AnimateOnScroll>

          <div className="space-y-20 lg:space-y-28">
            {/* Step 01 — Knowledge base */}
            <AnimateOnScroll variant="fade-up" delay={0}>
              <div className="grid lg:grid-cols-2 gap-10 xl:gap-16 items-center">
                <div>
                  <div className="text-7xl font-bold text-emerald-500/10 leading-none mb-5 select-none">01</div>
                  <h3 className="text-2xl font-bold mb-3">{t.home.how1Title}</h3>
                  <p className="text-zinc-400 text-lg leading-relaxed">{t.home.how1Desc}</p>
                </div>
                <div className="rounded-2xl border border-zinc-700/60 bg-zinc-900/90 overflow-hidden shadow-2xl shadow-black/40">
                  <div className="flex items-center gap-1.5 px-4 py-3 border-b border-zinc-800 bg-zinc-950/60">
                    <span className="w-3 h-3 rounded-full bg-red-500/70" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <span className="w-3 h-3 rounded-full bg-green-500/70" />
                    <span className="ml-3 text-xs text-zinc-500">Knowledge Base — AI Seller</span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-white">Knowledge Base</span>
                      <div className="flex gap-2">
                        <span className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 border border-zinc-700/60">+ Add manually</span>
                        <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-semibold">↑ CSV</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
                      <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <span className="text-xs text-emerald-400 font-medium">47 items loaded successfully</span>
                    </div>
                    {[['Sofa Angular Roma', '$299–$459'], ['Double Bed Luna', '$459'], ['Mattress Comfort Pro', '$189']].map(([name, price]) => (
                      <div key={name} className="flex items-center gap-3 py-2.5 border-b border-zinc-800/60 last:border-0">
                        <div className="w-8 h-8 rounded-md bg-zinc-800 flex-shrink-0" />
                        <span className="text-sm text-zinc-300 flex-1">{name}</span>
                        <span className="text-xs text-zinc-500">{price}</span>
                        <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Step 02 — Embed code */}
            <AnimateOnScroll variant="fade-up" delay={100}>
              <div className="grid lg:grid-cols-2 gap-10 xl:gap-16 items-center">
                <div className="order-2 lg:order-1 rounded-2xl border border-zinc-700/60 bg-zinc-900/90 overflow-hidden shadow-2xl shadow-black/40">
                  <div className="flex items-center gap-1.5 px-4 py-3 border-b border-zinc-800 bg-zinc-950/60">
                    <span className="w-3 h-3 rounded-full bg-red-500/70" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <span className="w-3 h-3 rounded-full bg-green-500/70" />
                    <span className="ml-3 text-xs text-zinc-500">Widget Setup — AI Seller</span>
                  </div>
                  <div className="p-5">
                    <p className="text-sm font-semibold text-white mb-1">Widget installation</p>
                    <p className="text-xs text-zinc-500 mb-3">{'Paste this code before </body> on your site:'}</p>
                    <div className="relative rounded-xl bg-zinc-950 border border-zinc-700/50 p-4 font-mono text-xs mb-4 leading-loose">
                      <span className="text-zinc-600">{'<'}</span><span className="text-sky-400">{'script'}</span><br />
                      <span className="text-zinc-700">{'  '}</span><span className="text-emerald-400">src</span><span className="text-zinc-600">{"='"}</span><span className="text-amber-300/90">{'https://app.ai-seller.com/widget.js'}</span><span className="text-zinc-600">{"'"}</span><br />
                      <span className="text-zinc-700">{'  '}</span><span className="text-emerald-400">data-key</span><span className="text-zinc-600">{"='"}</span><span className="text-violet-300">{'sk_live_••••••••••'}</span><span className="text-zinc-600">{"'"}</span><br />
                      <span className="text-zinc-600">{'></script>'}</span>
                      <span className="absolute top-2.5 right-2.5 text-xs px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-400 border border-zinc-700/60 cursor-default">Copy</span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs text-zinc-400">Widget active on your site</span>
                      </div>
                      <span className="text-xs text-emerald-400 font-medium">30s</span>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="text-7xl font-bold text-cyan-500/10 leading-none mb-5 select-none">02</div>
                  <h3 className="text-2xl font-bold mb-3">{t.home.how2Title}</h3>
                  <p className="text-zinc-400 text-lg leading-relaxed">{t.home.how2Desc}</p>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Step 03 — Telegram leads */}
            <AnimateOnScroll variant="fade-up" delay={200}>
              <div className="grid lg:grid-cols-2 gap-10 xl:gap-16 items-center">
                <div>
                  <div className="text-7xl font-bold text-violet-500/10 leading-none mb-5 select-none">03</div>
                  <h3 className="text-2xl font-bold mb-3">{t.home.how3Title}</h3>
                  <p className="text-zinc-400 text-lg leading-relaxed">{t.home.how3Desc}</p>
                </div>
                <div className="rounded-2xl border border-zinc-700/60 bg-zinc-900/90 overflow-hidden shadow-2xl shadow-black/40">
                  <div className="flex items-center gap-1.5 px-4 py-3 border-b border-zinc-800 bg-zinc-950/60">
                    <span className="w-3 h-3 rounded-full bg-red-500/70" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <span className="w-3 h-3 rounded-full bg-green-500/70" />
                    <span className="ml-3 text-xs text-zinc-500">Telegram — AI Seller Notifications</span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-zinc-800">
                      <div className="w-10 h-10 rounded-full bg-[#2AABEE]/20 flex items-center justify-center flex-shrink-0 text-xl">🤖</div>
                      <div>
                        <div className="text-sm font-semibold text-white">AI Seller Notifications</div>
                        <div className="text-xs text-zinc-500">bot</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="rounded-2xl rounded-tl-none bg-zinc-800/80 p-3.5 max-w-[90%] text-xs text-zinc-300 leading-relaxed">
                        {'🎯 '}<span className="font-semibold text-white">New lead!</span>
                        <div className="mt-2 space-y-0.5">
                          <div><span className="text-zinc-500">Name:</span> Alex M.</div>
                          <div><span className="text-zinc-500">Phone:</span> <span className="text-emerald-400">+1 555 123 4567</span></div>
                          <div><span className="text-zinc-500">Request:</span> Sofa up to $500, delivery NYC</div>
                        </div>
                        <div className="text-zinc-600 mt-2">today, 02:14</div>
                      </div>
                      <div className="rounded-2xl rounded-tl-none bg-zinc-800/80 p-3.5 max-w-[90%] text-xs text-zinc-300">
                        {'💬 '}<span className="font-semibold text-white">Conversation:</span> 7 messages
                        <div className="text-zinc-500 mt-0.5">Client is ready to order</div>
                        <div className="text-zinc-600 mt-2">today, 02:14</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>

          <AnimateOnScroll variant="fade-up">
            <p className="text-center text-zinc-500 text-sm mt-20">
              {t.home.howFootnote}
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll variant="fade-up">
            <h2 className="text-3xl font-bold text-center mb-12">{t.home.features}</h2>
          </AnimateOnScroll>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimateOnScroll variant="fade-up" delay={0}>
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/30 transition hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">{t.home.feature1Title}</h3>
              <p className="text-zinc-400 text-sm">{t.home.feature1Desc}</p>
            </div>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={100}>
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/30 transition hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">{t.home.feature2Title}</h3>
              <p className="text-zinc-400 text-sm">{t.home.feature2Desc}</p>
            </div>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={200}>
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/30 transition hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">{t.home.feature3Title}</h3>
              <p className="text-zinc-400 text-sm">{t.home.feature3Desc}</p>
            </div>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={300}>
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/30 transition hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">{t.home.feature4Title}</h3>
              <p className="text-zinc-400 text-sm">{t.home.feature4Desc}</p>
            </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Live Demo */}
      <section id="demo" className="py-20 px-6 border-t border-zinc-800/50 bg-zinc-900/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-start">
            {/* Left: copy */}
            <div className="lg:sticky lg:top-28">
              <AnimateOnScroll variant="slide-right">
                <span className="inline-block text-xs font-semibold text-emerald-400 uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 mb-5">
                  {t.home.liveDemoLabel}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mb-5 leading-tight">
                  {t.home.liveDemoTitle}
                </h2>
                <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                  {t.home.liveDemoDesc}
                </p>
                <p className="text-sm font-medium text-zinc-500 mb-3">{t.home.liveDemoHint}</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    t.home.liveDemoQ1,
                    t.home.liveDemoQ2,
                    t.home.liveDemoQ3,
                    t.home.liveDemoQ4,
                  ] as string[]).map((q) => (
                    <button
                      key={q}
                      onClick={() => setDemoTrigger(q)}
                      className="px-3.5 py-2 rounded-xl border border-zinc-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-sm text-zinc-400 hover:text-zinc-100 transition text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </AnimateOnScroll>
            </div>

            {/* Right: live chat */}
            <AnimateOnScroll variant="fade-up" delay={150}>
              <DemoChat
                t={t}
                externalTrigger={demoTrigger}
                onTriggerConsumed={() => setDemoTrigger('')}
              />
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-24 px-6 border-t border-zinc-800/50 bg-zinc-900/20">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-semibold text-emerald-400 uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 mb-5">
                {t.home.useCasesLabel}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.home.useCasesTitle}</h2>
              <p className="text-zinc-400 text-lg">{t.home.useCasesSubtitle}</p>
            </div>
          </AnimateOnScroll>

          {(() => {
            const cases = [
              { icon: '🛒', color: 'emerald', tab: t.home.useCase1Tab, title: t.home.useCase1Title, ask: t.home.useCase1Ask, widget: t.home.useCase1Widget, get: t.home.useCase1Get, q: t.home.useCase1Q, a: t.home.useCase1A },
              { icon: '📅', color: 'cyan',    tab: t.home.useCase2Tab, title: t.home.useCase2Title, ask: t.home.useCase2Ask, widget: t.home.useCase2Widget, get: t.home.useCase2Get, q: t.home.useCase2Q, a: t.home.useCase2A },
              { icon: '🏢', color: 'violet',  tab: t.home.useCase3Tab, title: t.home.useCase3Title, ask: t.home.useCase3Ask, widget: t.home.useCase3Widget, get: t.home.useCase3Get, q: t.home.useCase3Q, a: t.home.useCase3A },
              { icon: '🎓', color: 'amber',   tab: t.home.useCase4Tab, title: t.home.useCase4Title, ask: t.home.useCase4Ask, widget: t.home.useCase4Widget, get: t.home.useCase4Get, q: t.home.useCase4Q, a: t.home.useCase4A },
              { icon: '🏠', color: 'rose',    tab: t.home.useCase5Tab, title: t.home.useCase5Title, ask: t.home.useCase5Ask, widget: t.home.useCase5Widget, get: t.home.useCase5Get, q: t.home.useCase5Q, a: t.home.useCase5A },
            ];
            const tabColors: Record<string, { active: string; step2bg: string; step2border: string; num: string; result: string }> = {
              emerald: { active: 'border-emerald-500 text-emerald-400 bg-emerald-500/10',  step2bg: 'bg-emerald-500/10',  step2border: 'border-emerald-500/25', num: 'bg-emerald-500/15 text-emerald-300', result: 'text-emerald-300' },
              cyan:    { active: 'border-cyan-500 text-cyan-400 bg-cyan-500/10',            step2bg: 'bg-cyan-500/10',     step2border: 'border-cyan-500/25',    num: 'bg-cyan-500/15 text-cyan-300',    result: 'text-cyan-300' },
              violet:  { active: 'border-violet-500 text-violet-400 bg-violet-500/10',      step2bg: 'bg-violet-500/10',   step2border: 'border-violet-500/25',  num: 'bg-violet-500/15 text-violet-300',result: 'text-violet-300' },
              amber:   { active: 'border-amber-500 text-amber-400 bg-amber-500/10',         step2bg: 'bg-amber-500/10',    step2border: 'border-amber-500/25',   num: 'bg-amber-500/15 text-amber-300',  result: 'text-amber-300' },
              rose:    { active: 'border-rose-500 text-rose-400 bg-rose-500/10',            step2bg: 'bg-rose-500/10',     step2border: 'border-rose-500/25',    num: 'bg-rose-500/15 text-rose-300',    result: 'text-rose-300' },
            };
            const uc = cases[useCaseTab];
            const c = tabColors[uc.color];
            return (
              <>
                {/* Tab bar */}
                <div className="flex gap-2 overflow-x-auto pb-3 mb-10">
                  {cases.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setUseCaseTab(i)}
                      className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        useCaseTab === i
                          ? tabColors[item.color].active
                          : 'border-zinc-700/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                      }`}
                    >
                      <span className="text-base leading-none">{item.icon}</span>
                      <span className="whitespace-nowrap">{item.tab}</span>
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="grid lg:grid-cols-2 gap-10 xl:gap-16 items-start">
                  {/* Left: scenario flow */}
                  <div>
                    <h3 className="text-2xl font-bold mb-8 leading-tight">{uc.title}</h3>
                    <div className="space-y-3">
                      {/* Step 1: Client asks */}
                      <div className="flex gap-4 items-start p-4 rounded-2xl bg-zinc-800/30 border border-zinc-700/40">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-700/60 flex items-center justify-center text-xs font-bold text-zinc-400">01</div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">{t.home.useCasesAsk}</div>
                          <p className="text-zinc-200 italic leading-relaxed">"{uc.ask}"</p>
                        </div>
                      </div>
                      {/* Step 2: Widget does */}
                      <div className={`flex gap-4 items-start p-4 rounded-2xl border ${c.step2bg} ${c.step2border}`}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${c.num}`}>02</div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">{t.home.useCasesWidget}</div>
                          <p className="text-zinc-300 leading-relaxed">{uc.widget}</p>
                        </div>
                      </div>
                      {/* Step 3: You get */}
                      <div className="flex gap-4 items-start p-4 rounded-2xl bg-zinc-800/30 border border-zinc-700/40">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-700/60 flex items-center justify-center text-xs font-bold text-zinc-400">03</div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">{t.home.useCasesYouGet}</div>
                          <p className={`font-semibold leading-relaxed ${c.result}`}>{uc.get}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: chat mockup */}
                  <div className="rounded-2xl border border-zinc-700/60 bg-zinc-900/90 overflow-hidden shadow-2xl shadow-black/30">
                    <div className="flex items-center gap-1.5 px-4 py-3 border-b border-zinc-800 bg-zinc-950/60">
                      <span className="w-3 h-3 rounded-full bg-red-500/70" />
                      <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                      <span className="w-3 h-3 rounded-full bg-green-500/70" />
                      <span className="ml-3 text-xs text-zinc-500">AI Seller Widget — {uc.tab}</span>
                    </div>
                    <div className="p-5 space-y-3">
                      {/* Bot greeting */}
                      <div className="flex gap-2.5 items-end">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-sm">{uc.icon}</div>
                        <div className="rounded-2xl rounded-tl-none bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-300 max-w-[85%]">
                          {t.home.demoGreeting}
                        </div>
                      </div>
                      {/* User question */}
                      <div className="flex justify-end">
                        <div className="rounded-2xl rounded-br-none bg-emerald-500/15 border border-emerald-500/20 px-3.5 py-2.5 text-sm text-zinc-200 max-w-[85%]">
                          {uc.q}
                        </div>
                      </div>
                      {/* Bot answer */}
                      <div className="flex gap-2.5 items-end">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-sm">{uc.icon}</div>
                        <div className="rounded-2xl rounded-tl-none bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-300 max-w-[85%] leading-relaxed">
                          {uc.a}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-semibold text-emerald-400 uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 mb-5">
                {t.home.integrationsLabel}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.home.integrationsTitle}</h2>
              <p className="text-zinc-400 text-lg">{t.home.integrationsSubtitle}</p>
            </div>
          </AnimateOnScroll>

          {(() => {
            const cats = [
              {
                label: t.home.integrationsCatPlatforms,
                items: [
                  { name: 'Shopify',      abbr: 'S',   bg: 'bg-green-600' },
                  { name: 'WooCommerce',  abbr: 'WC',  bg: 'bg-violet-700' },
                  { name: 'Tilda',        abbr: 'Ti',  bg: 'bg-zinc-600' },
                  { name: 'Wix',          abbr: 'Wx',  bg: 'bg-zinc-800 border border-zinc-600' },
                  { name: 'Хорошоп',      abbr: 'HS',  bg: 'bg-blue-600' },
                  { name: 'OpenCart',     abbr: 'OC',  bg: 'bg-cyan-600' },
                ],
              },
              {
                label: t.home.integrationsCatCrm,
                items: [
                  { name: 'Bitrix24',   abbr: 'B24', bg: 'bg-red-600' },
                  { name: 'KeyCRM',     abbr: 'K',   bg: 'bg-blue-500' },
                  { name: 'HubSpot',    abbr: 'H',   bg: 'bg-orange-500' },
                  { name: 'Pipedrive',  abbr: 'PD',  bg: 'bg-green-700' },
                ],
              },
              {
                label: t.home.integrationsCatNotifs,
                items: [
                  { name: 'Telegram',  abbr: 'TG', bg: 'bg-sky-500' },
                  { name: 'Slack',     abbr: '#',  bg: 'bg-purple-700' },
                  { name: 'Email',     abbr: '@',  bg: 'bg-zinc-600' },
                  { name: 'WhatsApp',  abbr: 'WA', bg: 'bg-green-500' },
                  { name: 'Viber',     abbr: 'Vi', bg: 'bg-violet-600' },
                ],
              },
              {
                label: t.home.integrationsCatAutomation,
                items: [
                  { name: 'Zapier',    abbr: 'Z',  bg: 'bg-orange-600' },
                  { name: 'Make',      abbr: 'M',  bg: 'bg-indigo-700' },
                  { name: 'Webhooks',  abbr: '{}', bg: 'bg-zinc-700' },
                ],
              },
            ];
            return (
              <div className="space-y-8">
                {cats.map((cat, ci) => (
                  <AnimateOnScroll key={cat.label} variant="fade-up" delay={ci * 80}>
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap">{cat.label}</span>
                        <div className="flex-1 h-px bg-zinc-800" />
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {cat.items.map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-800/60 transition-colors cursor-default group"
                          >
                            <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                              <span className="text-[10px] font-bold text-white leading-none">{item.abbr}</span>
                            </div>
                            <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors whitespace-nowrap">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AnimateOnScroll>
                ))}
                <AnimateOnScroll variant="fade-up" delay={400}>
                  <p className="text-center text-zinc-600 text-sm pt-4">{t.home.integrationsNote}</p>
                </AnimateOnScroll>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Cases */}
      <section id="cases" className="py-24 px-6 border-t border-zinc-800/50 bg-zinc-900/20">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-semibold text-emerald-400 uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 mb-5">
                {t.home.navCases}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.home.casesTitle}</h2>
              <p className="text-zinc-400 text-lg">{t.home.casesSubtitle}</p>
            </div>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-3 gap-6">
            {([
              {
                logo: 'S', logoBg: 'bg-emerald-700',
                niche: t.home.case1Niche,
                metric: '+34%', metricColor: 'text-emerald-400',
                metricDesc: t.home.case1MetricDesc,
                quote: t.home.case1Quote,
                initials: 'AK', avatarBg: 'bg-emerald-800',
                author: t.home.case1Author,
                authorTitle: t.home.case1AuthorTitle,
                slug: 'sofa-home',
              },
              {
                logo: 'B', logoBg: 'bg-pink-700',
                niche: t.home.case2Niche,
                metric: '−60%', metricColor: 'text-cyan-400',
                metricDesc: t.home.case2MetricDesc,
                quote: t.home.case2Quote,
                initials: 'MV', avatarBg: 'bg-pink-800',
                author: t.home.case2Author,
                authorTitle: t.home.case2AuthorTitle,
                slug: 'belle-studios',
              },
              {
                logo: 'D', logoBg: 'bg-violet-700',
                niche: t.home.case3Niche,
                metric: '+41%', metricColor: 'text-violet-400',
                metricDesc: t.home.case3MetricDesc,
                quote: t.home.case3Quote,
                initials: 'DM', avatarBg: 'bg-violet-800',
                author: t.home.case3Author,
                authorTitle: t.home.case3AuthorTitle,
                slug: 'devstart',
              },
            ] as const).map((c, i) => (
              <AnimateOnScroll key={c.slug} variant="fade-up" delay={i * 100}>
                <div className="flex flex-col h-full p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:-translate-y-1 transition-all duration-300">
                  {/* Company logo + niche */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-10 h-10 rounded-xl ${c.logoBg} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                      {c.logo}
                    </div>
                    <span className="text-xs font-medium text-zinc-500">{c.niche}</span>
                  </div>

                  {/* Metric */}
                  <div className="mb-5">
                    <span className={`text-5xl font-bold leading-none ${c.metricColor}`}>{c.metric}</span>
                    <p className="text-sm text-zinc-400 mt-1.5">{c.metricDesc}</p>
                  </div>

                  {/* Quote */}
                  <blockquote className="flex-1 text-zinc-300 text-sm leading-relaxed border-l-2 border-zinc-700 pl-4 mb-6 italic">
                    "{c.quote}"
                  </blockquote>

                  {/* Author + read more */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800/60">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full ${c.avatarBg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {c.initials}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-200 leading-none mb-0.5">{c.author}</div>
                        <div className="text-xs text-zinc-500">{c.authorTitle}</div>
                      </div>
                    </div>
                    <Link
                      href={`/cases/${c.slug}`}
                      className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors whitespace-nowrap font-medium"
                    >
                      {t.home.casesReadMore} →
                    </Link>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-zinc-800/50 bg-gradient-to-b from-emerald-500/5 to-transparent">
        <div className="max-w-2xl mx-auto text-center">
          <AnimateOnScroll variant="scale-in">
            <h2 className="text-3xl font-bold mb-4">{t.home.ctaTitle}</h2>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100}>
            <p className="text-zinc-400 mb-8">{t.home.ctaDesc}</p>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={200}>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold transition shadow-lg shadow-emerald-500/20 hover:scale-105"
          >
            {t.home.getStarted}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll variant="fade-up">
            <h2 className="text-3xl font-bold text-center mb-12">{t.home.pricing}</h2>
          </AnimateOnScroll>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free */}
            <AnimateOnScroll variant="fade-up" delay={0}>
            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/30 transition hover:-translate-y-1">
              <h3 className="text-xl font-semibold mb-1">{t.home.planFree}</h3>
              <div className="text-3xl font-bold text-emerald-400 mb-2">{t.home.planFreePrice}</div>
              <p className="text-zinc-500 text-sm mb-6">{t.home.planFreeDesc}</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-zinc-400">
                  <span className="text-emerald-500">✓</span> {t.home.planFree1}
                </li>
                <li className="flex items-center gap-2 text-zinc-400">
                  <span className="text-emerald-500">✓</span> {t.home.planFree2}
                </li>
                <li className="flex items-center gap-2 text-zinc-400">
                  <span className="text-emerald-500">✓</span> {t.home.planFree3}
                </li>
                <li className="flex items-center gap-2 text-zinc-400">
                  <span className="text-emerald-500">✓</span> {t.home.planFree4}
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 rounded-xl border border-zinc-700 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-center transition"
              >
                {t.home.choosePlan}
              </Link>
            </div>
            </AnimateOnScroll>

            {/* Pro */}
            <AnimateOnScroll variant="scale-in" delay={100}>
            <div className="p-8 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-transparent border-2 border-emerald-500/50 relative hover:-translate-y-1 transition">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-medium">
                {t.home.popular}
              </div>
              <h3 className="text-xl font-semibold mb-1">{t.home.planPro}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold text-emerald-400">{t.home.planProPrice}</span>
                <span className="text-zinc-500">{t.home.planProPeriod}</span>
              </div>
              <p className="text-zinc-500 text-sm mb-6">{t.home.planProDesc}</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-zinc-400">
                  <span className="text-emerald-500">✓</span> {t.home.planPro1}
                </li>
                <li className="flex items-center gap-2 text-zinc-400">
                  <span className="text-emerald-500">✓</span> {t.home.planPro2}
                </li>
                <li className="flex items-center gap-2 text-zinc-400">
                  <span className="text-emerald-500">✓</span> {t.home.planPro3}
                </li>
                <li className="flex items-center gap-2 text-zinc-400">
                  <span className="text-emerald-500">✓</span> {t.home.planPro4}
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-center transition"
              >
                {t.home.choosePlan}
              </Link>
            </div>
            </AnimateOnScroll>

            {/* Enterprise */}
            <AnimateOnScroll variant="fade-up" delay={200}>
            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/30 transition hover:-translate-y-1">
              <h3 className="text-xl font-semibold mb-1">{t.home.planEnterprise}</h3>
              <div className="text-3xl font-bold text-emerald-400 mb-2">{t.home.planEnterprisePrice}</div>
              <p className="text-zinc-500 text-sm mb-6">{t.home.planEnterpriseDesc}</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-zinc-400">
                  <span className="text-emerald-500">✓</span> {t.home.planEnterprise1}
                </li>
                <li className="flex items-center gap-2 text-zinc-400">
                  <span className="text-emerald-500">✓</span> {t.home.planEnterprise2}
                </li>
                <li className="flex items-center gap-2 text-zinc-400">
                  <span className="text-emerald-500">✓</span> {t.home.planEnterprise3}
                </li>
                <li className="flex items-center gap-2 text-zinc-400">
                  <span className="text-emerald-500">✓</span> {t.home.planEnterprise4}
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 rounded-xl border border-zinc-700 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-center transition"
              >
                {t.home.choosePlan}
              </Link>
            </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Contact / Order form */}
      <section id="contact" className="py-20 px-6 border-t border-zinc-800/50 bg-zinc-900/30">
        <div className="max-w-xl mx-auto">
          <AnimateOnScroll variant="fade-up">
            <h2 className="text-3xl font-bold text-center mb-4">{t.home.contactTitle}</h2>
            <p className="text-zinc-400 text-center mb-8">{t.home.contactDesc}</p>
          </AnimateOnScroll>
          {contactSuccess ? (
            <AnimateOnScroll variant="fade-up">
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center">
                {t.home.contactSuccess}
                {contactEmailWarning ? (
                  <p className="mt-4 text-amber-300/95 text-sm text-left font-normal leading-relaxed">
                    {contactEmailWarning}
                  </p>
                ) : null}
              </div>
            </AnimateOnScroll>
          ) : (
            <AnimateOnScroll variant="fade-up">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setContactError('');
                  setContactEmailWarning('');
                  setContactSending(true);
                  try {
                    const res = await api.contact({
                      name: contactName,
                      email: contactEmail,
                      message: contactMessage,
                      plan: contactPlan || undefined,
                    });
                    const data = await res.json();
                    if (data.ok) {
                      setContactSuccess(true);
                      setContactEmailWarning(
                        data.emailSent === false ? t.home.contactEmailNotSent : '',
                      );
                      setContactName('');
                      setContactEmail('');
                      setContactMessage('');
                      setContactPlan('');
                    } else {
                      setContactError(data.error || t.home.contactError);
                    }
                  } catch {
                    setContactError(t.home.contactError);
                  }
                  setContactSending(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">{t.home.contactName} *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:border-emerald-500 focus:outline-none transition"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">{t.home.contactEmail} *</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:border-emerald-500 focus:outline-none transition"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">{t.home.contactPlan}</label>
                  <select
                    value={contactPlan}
                    onChange={(e) => setContactPlan(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:border-emerald-500 focus:outline-none transition"
                  >
                    <option value="">—</option>
                    <option value="free">{t.home.planFree}</option>
                    <option value="pro">{t.home.planPro}</option>
                    <option value="enterprise">{t.home.planEnterprise}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">{t.home.contactMessage} *</label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:border-emerald-500 focus:outline-none transition resize-none"
                    placeholder="Describe your needs..."
                  />
                </div>
                {contactError && (
                  <p className="text-red-400 text-sm">{contactError}</p>
                )}
                <button
                  type="submit"
                  disabled={contactSending}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold transition disabled:opacity-50"
                >
                  {contactSending ? '...' : t.home.contactSubmit}
                </button>
              </form>
            </AnimateOnScroll>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative mt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 via-transparent to-transparent" />
        <div className="relative border-t border-zinc-800/50">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <AnimateOnScroll variant="fade-up" delay={0}>
              <div className="md:col-span-2">
                <Link href="/" className="inline-block mb-4">
                  <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    AI Seller Widget
                  </span>
                </Link>
                <p className="text-zinc-500 text-sm max-w-sm leading-relaxed">
                  {t.home.footerTagline}
                </p>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
                >
                  {t.home.getStarted}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
              </AnimateOnScroll>
              <AnimateOnScroll variant="fade-up" delay={100}>
              <div>
                <h4 className="font-semibold text-zinc-300 mb-4">{t.home.footerLinks}</h4>
                <ul className="space-y-3">
                  <li>
                    <Link href="/login" className="text-zinc-500 hover:text-emerald-400 transition">
                      {t.home.login}
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="text-zinc-500 hover:text-emerald-400 transition">
                      {t.home.register}
                    </Link>
                  </li>
                  <li>
                    <a href="#pricing" className="text-zinc-500 hover:text-emerald-400 transition">
                      {t.home.footerPricing}
                    </a>
                  </li>
                  <li>
                    <a href="#contact" className="text-zinc-500 hover:text-emerald-400 transition">
                      {t.home.contactTitle}
                    </a>
                  </li>
                </ul>
              </div>
              </AnimateOnScroll>
              <AnimateOnScroll variant="fade-up" delay={200}>
              <div>
                <h4 className="font-semibold text-zinc-300 mb-4">{t.home.footerContact}</h4>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  {t.home.footerTagline}
                </p>
              </div>
              </AnimateOnScroll>
            </div>
            <AnimateOnScroll variant="fade-in" delay={0}>
            <div className="pt-8 border-t border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-zinc-600 text-sm">
                © {new Date().getFullYear()} AI Seller Widget. {t.home.footerRights}
              </p>
              <div className="flex gap-6">
                <Link href="/login" className="text-zinc-600 hover:text-zinc-400 text-sm transition">
                  {t.home.login}
                </Link>
                <Link href="/register" className="text-zinc-600 hover:text-emerald-400 text-sm transition">
                  {t.home.register}
                </Link>
              </div>
            </div>
            </AnimateOnScroll>
          </div>
        </div>
      </footer>

      {/* Sales widget */}
      {(process.env.NEXT_PUBLIC_DEMO_WIDGET_KEY || process.env.NODE_ENV === 'development') && (
        <Script
          id="ai-seller-demo-widget"
          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/widget.js`}
          data-key={process.env.NEXT_PUBLIC_DEMO_WIDGET_KEY || 'sk_demo_main_page_000000000000000000000000'}
          strategy="afterInteractive"
        />
      )}
    </main>
  );
}
