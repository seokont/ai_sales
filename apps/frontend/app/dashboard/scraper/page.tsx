'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useLang } from '@/lib/language-context';

export default function ScraperPage() {
  const { t } = useLang();
  const [companies, setCompanies] = useState<{ company: { id: string; plan?: string } }[]>([]);
  const [jobs, setJobs] = useState<{ id: string; url: string; status: string; createdAt: string }[]>([]);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const companyId = companies[0]?.company?.id;
  const plan = companies[0]?.company?.plan || 'free';
  const canScrape = plan === 'pro' || plan === 'enterprise';

  const load = () => {
    if (!companyId || !canScrape) return;
    api.scraperJobs(companyId).then((r) => (r.ok ? r.json() : [])).then(setJobs);
  };

  useEffect(() => {
    api.companies()
      .then((r) => r.json())
      .then((data) => {
        setCompanies(data);
        const c = data[0]?.company;
        if (c?.id && (c.plan === 'pro' || c.plan === 'enterprise')) {
          return api.scraperJobs(c.id).then((r) => (r.ok ? r.json() : []));
        }
        return [];
      })
      .then((data) => Array.isArray(data) && setJobs(data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (companyId && canScrape) load();
  }, [companyId, canScrape]);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !canScrape) return;
    setSubmitting(true);
    const res = await api.scraperRun(companyId, url);
    if (res.ok) {
      setUrl('');
      load();
    }
    setSubmitting(false);
  };

  if (loading) return <div>{t.common.loading}</div>;

  if (!canScrape) {
    return (
      <div className="p-6 rounded-lg bg-amber-500/10 border border-amber-500/30 max-w-xl">
        <h2 className="text-lg font-semibold text-amber-400 mb-2">{t.scraper.upgradeTitle}</h2>
        <p className="text-zinc-400 text-sm mb-4">{t.scraper.upgradeDesc}</p>
        <Link href="/#pricing" className="text-emerald-400 hover:underline text-sm">
          {t.scraper.upgradeLink}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t.scraper.title}</h1>
      <form onSubmit={handleRun} className="mb-6 flex gap-2">
        <input
          type="url"
          placeholder={t.scraper.urlPlaceholder}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
        >
          {submitting ? t.scraper.running : t.scraper.scrape}
        </button>
      </form>
      <div className="space-y-2">
        {jobs.map((job) => (
          <div key={job.id} className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 flex justify-between">
            <div>
              <p className="font-mono text-sm">{job.url}</p>
              <span className={`text-xs ${job.status === 'completed' ? 'text-emerald-500' : job.status === 'failed' ? 'text-red-500' : 'text-zinc-500'}`}>
                {job.status}
              </span>
            </div>
            <span className="text-zinc-500 text-sm">{new Date(job.createdAt).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
