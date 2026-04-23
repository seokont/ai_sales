'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { useLang } from '@/lib/language-context';
import { Lang } from '@/lib/i18n';

export default function SettingsPage() {
  const { t, lang, setLang } = useLang();
  const [companies, setCompanies] = useState<{ company: { id: string; name: string; systemPrompt: string; groqKey: string; plan?: string; telegramBotToken?: string; telegramChatId?: string; language?: string; widgetGreeting?: string; widgetHeader?: string; websiteUrl?: string; avatarPath?: string | null } }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [widgetGreeting, setWidgetGreeting] = useState('');
  const [widgetHeader, setWidgetHeader] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [language, setLanguage] = useState<Lang>('en');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  const companyId = companies[0]?.company?.id;

  useEffect(() => {
    api.companies()
      .then((r) => r.json())
      .then((data) => {
        setCompanies(data);
        const c = data[0]?.company;
        if (c) {
          setSystemPrompt(c.systemPrompt || '');
          setGroqKey(c.groqKey || '');
          setTelegramBotToken(c.telegramBotToken || '');
          setTelegramChatId(c.telegramChatId || '');
          setWidgetGreeting(c.widgetGreeting || '');
          setWidgetHeader(c.widgetHeader || '');
          setWebsiteUrl(c.websiteUrl || '');
          if (c.language && (c.language === 'en' || c.language === 'uk' || c.language === 'ru' || c.language === 'he')) {
            setLanguage(c.language);
            setLang(c.language);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const avatarUrlRef = useRef<string | null>(null);
  useEffect(() => {
    if (!companyId || !companies[0]?.company?.avatarPath) {
      setAvatarPreviewUrl(null);
      return;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    fetch(`${apiUrl}/companies/${companyId}/avatar`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => (r.ok ? r.blob() : null))
      .then((blob) => {
        if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current);
        avatarUrlRef.current = blob ? URL.createObjectURL(blob) : null;
        setAvatarPreviewUrl(avatarUrlRef.current);
      })
      .catch(() => setAvatarPreviewUrl(null));
    return () => {
      if (avatarUrlRef.current) {
        URL.revokeObjectURL(avatarUrlRef.current);
        avatarUrlRef.current = null;
      }
    };
  }, [companyId, companies[0]?.company?.avatarPath]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSaving(true);
    await api.updateCompany(companyId, {
      systemPrompt,
      groqKey: groqKey || undefined,
      telegramBotToken: telegramBotToken || undefined,
      telegramChatId: telegramChatId || undefined,
      widgetGreeting: widgetGreeting || undefined,
      widgetHeader: widgetHeader || undefined,
      websiteUrl: websiteUrl || undefined,
      language,
    });
    setLang(language);
    setSaving(false);
  };

  if (loading) return <div>{t.common.loading}</div>;

  const planLabels: Record<string, string> = {
    free: t.settings.planFree,
    pro: t.settings.planPro,
    enterprise: t.settings.planEnterprise,
  };
  const currentPlan = companies[0]?.company?.plan || 'free';

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t.settings.title}</h1>
      <div className="mb-8 p-4 rounded-lg bg-zinc-900 border border-zinc-800 max-w-xl">
        <label className="block text-sm text-zinc-400 mb-1">{t.settings.plan}</label>
        <span className="inline-block px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-medium">
          {planLabels[currentPlan] || currentPlan}
        </span>
      </div>
      <form onSubmit={handleSave} className="max-w-xl space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">{t.settings.language}</label>
          <div className="flex gap-2">
            {(['en', 'uk', 'ru', 'he'] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguage(l)}
                className={`px-4 py-2 rounded-lg ${language === l ? 'bg-emerald-600' : 'bg-zinc-800 hover:bg-zinc-700'}`}
              >
                {l === 'en' ? 'English' : l === 'uk' ? 'Українська' : l === 'ru' ? 'Русский' : 'עברית'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">{t.settings.systemPrompt}</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 min-h-[150px]"
            placeholder={t.settings.systemPromptPlaceholder}
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">{t.settings.groqKey}</label>
          <input
            type="password"
            value={groqKey}
            onChange={(e) => setGroqKey(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700"
            placeholder={t.settings.groqKeyPlaceholder}
          />
        </div>
        <div className="border-t border-zinc-800 pt-4">
          <h3 className="font-semibold mb-2">{t.settings.widgetGreeting}</h3>
          <p className="text-sm text-zinc-400 mb-3">{t.settings.widgetGreetingDesc}</p>
          <input
            type="text"
            value={widgetGreeting}
            onChange={(e) => setWidgetGreeting(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 mb-4"
            placeholder={t.settings.widgetGreetingPlaceholder}
          />
          <label className="block text-sm text-zinc-400 mb-1 mt-4">{t.settings.widgetHeader}</label>
          <p className="text-sm text-zinc-400 mb-3">{t.settings.widgetHeaderDesc}</p>
          <input
            type="text"
            value={widgetHeader}
            onChange={(e) => setWidgetHeader(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 mb-4"
            placeholder={t.settings.widgetHeaderPlaceholder}
          />
          <label className="block text-sm text-zinc-400 mb-1 mt-4">{t.settings.websiteUrl}</label>
          <p className="text-sm text-zinc-400 mb-3">{t.settings.websiteUrlDesc}</p>
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700"
            placeholder={t.settings.websiteUrlPlaceholder}
          />
          <label className="block text-sm text-zinc-400 mb-1 mt-4">{t.settings.widgetAvatar}</label>
          <p className="text-sm text-zinc-400 mb-3">{t.settings.widgetAvatarDesc}</p>
          <div className="flex items-center gap-4">
            {avatarPreviewUrl && (
              <img
                src={avatarPreviewUrl}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-zinc-700"
              />
            )}
            <div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !companyId) return;
                  const maxAvatarBytes = 10 * 1024 * 1024;
                  if (file.size > maxAvatarBytes) {
                    alert(t.settings.widgetAvatarTooLarge);
                    e.target.value = '';
                    return;
                  }
                  setAvatarUploading(true);
                  const res = await api.uploadCompanyAvatar(companyId, file);
                  setAvatarUploading(false);
                  if (res.ok) {
                    const data = await res.json();
                    setCompanies((prev) =>
                      prev.map((c) =>
                        c.company.id === companyId
                          ? { ...c, company: { ...c.company, avatarPath: data.avatarPath } }
                          : c,
                      ),
                    );
                  }
                  e.target.value = '';
                }}
                disabled={avatarUploading}
                className="text-sm text-zinc-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-emerald-600 file:text-white file:text-sm hover:file:bg-emerald-500"
              />
              {avatarUploading && <span className="text-xs text-zinc-500 ml-2">{t.settings.uploading}</span>}
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-800 pt-4">
          <h3 className="font-semibold mb-2">{t.settings.telegramTitle}</h3>
          <p className="text-sm text-zinc-400 mb-3">{t.settings.telegramDesc}</p>
          <div className="space-y-2">
            <input
              type="password"
              value={telegramBotToken}
              onChange={(e) => setTelegramBotToken(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700"
              placeholder={t.settings.telegramTokenPlaceholder}
            />
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700"
              placeholder={t.settings.telegramChatPlaceholder}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
        >
          {saving ? t.settings.saving : t.common.save}
        </button>
      </form>
    </div>
  );
}
