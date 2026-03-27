'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useLang } from '@/lib/language-context';

export default function DashboardPage() {
  const { t } = useLang();
  const [companies, setCompanies] = useState<{ company: { id: string; name: string; apiKey: string; language?: string } }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.companies()
      .then((r) => r.json())
      .then((data) => {
        setCompanies(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>{t.common.loading}</div>;

  const company = companies[0]?.company;
  if (!company) return <div>{t.dashboard.noCompany}</div>;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const script = `<script src="${apiUrl}/widget.js" data-key="${company.apiKey}"></script>`;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t.dashboard.title}</h1>
      <div className="space-y-6">
        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
          <h2 className="font-semibold mb-2">{t.dashboard.scriptLabel}</h2>
          <p className="text-zinc-400 text-sm mb-3">{t.dashboard.scriptDesc}</p>
          <p className="text-zinc-500 text-xs mb-3 leading-relaxed">{t.widget.embedLangNote}</p>
          <pre className="p-4 rounded bg-zinc-950 text-sm overflow-x-auto">{script}</pre>
          <button
            onClick={() => navigator.clipboard.writeText(script)}
            className="mt-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition text-sm"
          >
            {t.dashboard.copy}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/dashboard/widget" className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition">
            <h3 className="font-semibold">{t.nav.widget}</h3>
            <p className="text-zinc-400 text-sm">{t.dashboard.widgetCard}</p>
          </Link>
          <Link href="/dashboard/knowledge" className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition">
            <h3 className="font-semibold">{t.nav.knowledge}</h3>
            <p className="text-zinc-400 text-sm">{t.dashboard.knowledgeCard}</p>
          </Link>
          <Link href="/dashboard/scraper" className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition">
            <h3 className="font-semibold">{t.nav.scraper}</h3>
            <p className="text-zinc-400 text-sm">{t.dashboard.scraperCard}</p>
          </Link>
          <Link href="/dashboard/chats" className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition">
            <h3 className="font-semibold">{t.nav.chats}</h3>
            <p className="text-zinc-400 text-sm">{t.dashboard.chatsCard}</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
