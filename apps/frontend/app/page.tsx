'use client';

import { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useLang } from '@/lib/language-context';
import { Lang } from '@/lib/i18n';
import { AnimateOnScroll } from '@/components/animate-on-scroll';
import { api } from '@/lib/api';

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

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm animate-fade-up">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            AI Seller Widget
          </span>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {(['en', 'uk', 'ru', 'he'] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 rounded text-sm transition ${lang === l ? 'bg-emerald-600 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
                >
                  {l === 'en' ? 'EN' : l === 'uk' ? 'УКР' : l === 'ru' ? 'РУ' : 'עב'}
                </button>
              ))}
            </div>
            <Link
              href="/login"
              className="p-2 md:px-4 md:py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition flex items-center justify-center"
              aria-label={t.home.login}
            >
              <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="hidden md:inline">{t.home.login}</span>
            </Link>
            <Link
              href="/register"
              className="p-2 md:px-5 md:py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition flex items-center justify-center"
              aria-label={t.home.register}
            >
              <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="hidden md:inline">{t.home.register}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — positive z-index so the bg is not painted under <main> bg-zinc-950 */}
      <section className="relative isolate pt-32 pb-20 px-6 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-90"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-zinc-950/85 via-zinc-950/75 to-zinc-950"
          aria-hidden
        />
        <div className="relative z-[2] max-w-4xl mx-auto text-center">
          <AnimateOnScroll variant="fade-up" delay={0}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {t.home.heroTitle}
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100}>
            <p className="text-xl text-zinc-400 mb-4 max-w-2xl mx-auto leading-relaxed">
              {t.home.heroDesc}
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={200}>
            <p className="text-lg text-zinc-500 mb-8 max-w-2xl mx-auto leading-relaxed">
              {t.home.heroDesc2}
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={300}>
            <div className="flex flex-wrap gap-6 justify-center mb-10 text-sm text-zinc-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {t.home.heroBenefit1}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                {t.home.heroBenefit2}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                {t.home.heroBenefit3}
              </span>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={400}>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold transition shadow-lg shadow-emerald-500/20 hover:scale-105"
              >
                {t.home.getStarted}
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 rounded-xl border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50 transition hover:scale-105"
              >
                {t.home.login}
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-t border-zinc-800/50 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <AnimateOnScroll variant="fade-up">
            <h2 className="text-2xl font-bold mb-12 text-zinc-200">{t.home.statsTitle}</h2>
          </AnimateOnScroll>
          <div className="grid md:grid-cols-3 gap-8">
            <AnimateOnScroll variant="scale-in" delay={0}>
              <div className="p-6 rounded-2xl bg-zinc-800/30 border border-zinc-700/50 hover:border-emerald-500/30 transition-colors">
                <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-1">{t.home.stats1}</div>
                <div className="text-zinc-500">{t.home.stats1Desc}</div>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll variant="scale-in" delay={100}>
              <div className="p-6 rounded-2xl bg-zinc-800/30 border border-zinc-700/50 hover:border-cyan-500/30 transition-colors">
                <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-1">{t.home.stats2}</div>
                <div className="text-zinc-500">{t.home.stats2Desc}</div>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll variant="scale-in" delay={200}>
              <div className="p-6 rounded-2xl bg-zinc-800/30 border border-zinc-700/50 hover:border-violet-500/30 transition-colors">
                <div className="text-3xl md:text-4xl font-bold text-violet-400 mb-1">{t.home.stats3}</div>
                <div className="text-zinc-500">{t.home.stats3Desc}</div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 px-6 border-t border-zinc-800/50">
        <div className="max-w-3xl mx-auto text-center">
          <AnimateOnScroll variant="fade-up">
            <h2 className="text-3xl font-bold mb-6">{t.home.problemTitle}</h2>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100}>
            <p className="text-lg text-zinc-400 leading-relaxed">
              {t.home.problemDesc}
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 border-t border-zinc-800/50 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll variant="fade-up">
            <h2 className="text-3xl font-bold text-center mb-12">{t.home.howTitle}</h2>
          </AnimateOnScroll>
          <div className="grid md:grid-cols-3 gap-8">
            <AnimateOnScroll variant="slide-right" delay={0}>
              <div className="relative p-6 rounded-2xl bg-zinc-800/20 border border-zinc-700/50 hover:border-emerald-500/20 transition-colors">
                <div className="text-4xl font-bold text-emerald-500/30 mb-2">01</div>
                <p className="text-zinc-300">{t.home.how1}</p>
                <div className="hidden md:block absolute top-8 -right-4 w-8 h-0.5 bg-zinc-700" />
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll variant="slide-right" delay={150}>
              <div className="relative p-6 rounded-2xl bg-zinc-800/20 border border-zinc-700/50 hover:border-cyan-500/20 transition-colors">
                <div className="text-4xl font-bold text-cyan-500/30 mb-2">02</div>
                <p className="text-zinc-300">{t.home.how2}</p>
                <div className="hidden md:block absolute top-8 -right-4 w-8 h-0.5 bg-zinc-700" />
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll variant="slide-right" delay={300}>
              <div className="p-6 rounded-2xl bg-zinc-800/20 border border-zinc-700/50 hover:border-violet-500/20 transition-colors">
                <div className="text-4xl font-bold text-violet-500/30 mb-2">03</div>
                <p className="text-zinc-300">{t.home.how3}</p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-zinc-800/50">
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
