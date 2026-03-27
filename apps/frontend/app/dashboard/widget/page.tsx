'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useLang } from '@/lib/language-context';

export default function WidgetPage() {
  const { t } = useLang();
  const [companies, setCompanies] = useState<{ company: { id: string; name: string; apiKey: string; language?: string } }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.companies()
      .then((r) => r.json())
      .then(setCompanies)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>{t.common.loading}</div>;
  const company = companies[0]?.company;
  if (!company) return <div>{t.dashboard.noCompany}</div>;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const script = `<script src="${apiUrl}/widget.js" data-key="${company.apiKey}"></script>`;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t.nav.widget}</h1>
      <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 max-w-2xl">
        <h2 className="font-semibold mb-2">{t.widget.embedLabel}</h2>
        <p className="text-zinc-400 text-sm mb-2">{t.widget.embedDesc}</p>
        <p className="text-zinc-500 text-xs mb-3 leading-relaxed">{t.widget.embedLangNote}</p>
        <pre className="p-4 rounded bg-zinc-950 text-sm overflow-x-auto">{script}</pre>
        <button
          onClick={() => navigator.clipboard.writeText(script)}
          className="mt-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition text-sm"
        >
          {t.widget.copyScript}
        </button>
      </div>
    </div>
  );
}
