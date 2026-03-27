'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useLang } from '@/lib/language-context';

type CompanyRow = {
  id: string;
  name: string;
  plan: string;
  apiKey: string;
  apiKeyShort?: string;
  websiteUrl: string | null;
  createdAt: string;
  users: { id: string; email: string; name: string | null; role: string }[];
};

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  companies: { id: string; name: string; plan: string; role: string }[];
};

export default function AdminPage() {
  const { t } = useLang();
  const [tab, setTab] = useState<'companies' | 'users' | 'settings'>('companies');
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [planEdits, setPlanEdits] = useState<Record<string, string>>({});
  const [nameEdits, setNameEdits] = useState<Record<string, string>>({});
  const [websiteUrlEdits, setWebsiteUrlEdits] = useState<Record<string, string>>({});
  const [roleEdits, setRoleEdits] = useState<Record<string, string>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'company' | 'user'; id: string } | null>(null);
  const [editCompany, setEditCompany] = useState<CompanyRow | null>(null);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [companyForm, setCompanyForm] = useState<Record<string, string>>({});
  const [userForm, setUserForm] = useState<Record<string, string>>({});
  const [settingsForm, setSettingsForm] = useState<{
    emailHost: string;
    emailPort: string;
    emailSecure: boolean;
    emailUser: string;
    emailPass: string;
    emailFrom: string;
    emailTo: string;
  }>({
    emailHost: '',
    emailPort: '587',
    emailSecure: false,
    emailUser: '',
    emailPass: '',
    emailFrom: '',
    emailTo: '',
  });

  const loadCompanies = () =>
    api
      .adminCompanies()
      .then((r) => {
        if (!r.ok) throw new Error('Access denied');
        return r.json();
      })
      .then(setCompanies);

  const loadUsers = () =>
    api
      .adminUsers()
      .then((r) => {
        if (!r.ok) throw new Error('Access denied');
        return r.json();
      })
      .then(setUsers);

  const loadSettings = () =>
    api
      .adminSettings()
      .then((r) => {
        if (!r.ok) throw new Error('Access denied');
        return r.json();
      })
      .then((data) => {
        setSettingsForm({
          emailHost: data.emailHost || '',
          emailPort: String(data.emailPort ?? 587),
          emailSecure: !!data.emailSecure,
          emailUser: data.emailUser || '',
          emailPass: data.emailPass || '',
          emailFrom: data.emailFrom || '',
          emailTo: data.emailTo || '',
        });
      });

  useEffect(() => {
    Promise.all([loadCompanies(), loadUsers()])
      .catch(() => setError(t.admin.accessDenied))
      .finally(() => setLoading(false));
  }, [t.admin.accessDenied]);

  useEffect(() => {
    if (tab === 'settings') loadSettings();
  }, [tab]);

  useEffect(() => {
    setPlanEdits(companies.reduce((acc, c) => ({ ...acc, [c.id]: c.plan }), {} as Record<string, string>));
    setNameEdits(companies.reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {} as Record<string, string>));
    setWebsiteUrlEdits(companies.reduce((acc, c) => ({ ...acc, [c.id]: c.websiteUrl ?? '' }), {} as Record<string, string>));
  }, [companies]);

  useEffect(() => {
    setRoleEdits(users.reduce((acc, u) => ({ ...acc, [u.id]: u.role || 'user' }), {} as Record<string, string>));
  }, [users]);

  const handleSaveCompany = async (id: string) => {
    const plan = planEdits[id];
    const name = nameEdits[id];
    const websiteUrl = websiteUrlEdits[id]?.trim() || null;
    if (!plan) return;
    setSavingId(id);
    const res = await api.adminUpdateCompany(id, { plan, name, websiteUrl });
    setSavingId(null);
    if (res.ok) {
      setCompanies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, plan, name: name || c.name, websiteUrl } : c)),
      );
    }
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDeleteCompany = async (id: string) => {
    const res = await api.adminDeleteCompany(id);
    if (res.ok) {
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirm(null);
    }
  };

  const handleDeleteUser = async (id: string) => {
    const res = await api.adminDeleteUser(id);
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setDeleteConfirm(null);
    }
  };

  const openEditCompany = async (c: CompanyRow) => {
    setEditCompany(c);
    try {
      const r = await api.adminCompany(c.id);
      const data = await r.json();
      setCompanyForm({
        name: data.name || '',
        plan: data.plan || 'free',
        domain: data.domain || '',
        groqKey: data.groqKey || '',
        systemPrompt: data.systemPrompt || '',
        telegramBotToken: data.telegramBotToken || '',
        telegramChatId: data.telegramChatId || '',
        language: data.language || 'en',
        widgetGreeting: data.widgetGreeting || '',
        widgetHeader: data.widgetHeader || '',
        websiteUrl: data.websiteUrl || '',
      });
    } catch {
      setEditCompany(null);
    }
  };

  const openEditUser = async (u: UserRow) => {
    setEditUser(u);
    setUserForm({
      email: u.email || '',
      name: u.name || '',
      role: u.role || 'user',
      password: '',
    });
  };

  const handleSaveCompanyFull = async () => {
    if (!editCompany) return;
    setSavingId(editCompany.id);
    const res = await api.adminUpdateCompany(editCompany.id, {
      name: companyForm.name || undefined,
      plan: companyForm.plan,
      domain: companyForm.domain || null,
      groqKey: companyForm.groqKey || null,
      systemPrompt: companyForm.systemPrompt || null,
      telegramBotToken: companyForm.telegramBotToken || null,
      telegramChatId: companyForm.telegramChatId || null,
      language: companyForm.language || undefined,
      widgetGreeting: companyForm.widgetGreeting || null,
      widgetHeader: companyForm.widgetHeader || null,
      websiteUrl: companyForm.websiteUrl || null,
    });
    setSavingId(null);
    if (res.ok) {
      loadCompanies();
      setEditCompany(null);
    }
  };

  const handleSaveUserFull = async () => {
    if (!editUser) return;
    setSavingId(editUser.id);
    const res = await api.adminUpdateUser(editUser.id, {
      email: userForm.email || undefined,
      name: userForm.name || null,
      role: userForm.role,
      password: userForm.password || undefined,
    });
    setSavingId(null);
    if (res.ok) {
      loadUsers();
      setEditUser(null);
    }
  };

  const handleSaveSettings = async () => {
    setSavingId('settings');
    const res = await api.adminUpdateSettings({
      emailHost: settingsForm.emailHost || null,
      emailPort: settingsForm.emailPort ? parseInt(settingsForm.emailPort, 10) : null,
      emailSecure: settingsForm.emailSecure,
      emailUser: settingsForm.emailUser || null,
      emailPass: settingsForm.emailPass === '••••••••' ? undefined : settingsForm.emailPass || null,
      emailFrom: settingsForm.emailFrom || null,
      emailTo: settingsForm.emailTo || null,
    });
    setSavingId(null);
    if (res.ok) loadSettings();
  };

  const handleSaveUserRole = async (id: string) => {
    const role = roleEdits[id];
    if (!role) return;
    setSavingId(id);
    const res = await api.adminUpdateUser(id, { role });
    setSavingId(null);
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role } : u)),
      );
    }
  };

  if (loading) return <div>{t.common.loading}</div>;
  if (error)
    return (
      <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
        {error}
      </div>
    );

  const planLabels: Record<string, string> = {
    free: t.admin.free,
    pro: t.admin.pro,
    enterprise: t.admin.enterprise,
  };

  const roleLabels: Record<string, string> = {
    user: t.admin.roleUser,
    admin: t.admin.roleAdmin,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t.admin.title}</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('companies')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'companies' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          {t.admin.tabCompanies}
        </button>
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'users' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          {t.admin.tabUsers}
        </button>
        <button
          onClick={() => setTab('settings')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'settings' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          {t.admin.tabSettings}
        </button>
      </div>

      {tab === 'companies' && (
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          {companies.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              Немає компаній. Користувачі зʼявляться після реєстрації.
            </div>
          ) : (
          <table className="w-full text-left">
            <thead className="bg-zinc-900">
              <tr>
                <th className="px-4 py-3 font-semibold">{t.admin.company}</th>
                <th className="px-4 py-3 font-semibold">{t.admin.plan}</th>
                <th className="px-4 py-3 font-semibold">{t.admin.websiteUrl}</th>
                <th className="px-4 py-3 font-semibold">{t.admin.users}</th>
                <th className="px-4 py-3 font-semibold">API Key</th>
                <th className="px-4 py-3 font-semibold">{t.admin.createdAt}</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {companies.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-3">
                    <input
                      value={nameEdits[c.id] ?? c.name}
                      onChange={(e) =>
                        setNameEdits((prev) => ({ ...prev, [c.id]: e.target.value }))
                      }
                      className="w-full max-w-[180px] px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={planEdits[c.id] ?? c.plan}
                      onChange={(e) =>
                        setPlanEdits((prev) => ({ ...prev, [c.id]: e.target.value }))
                      }
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-sm"
                    >
                      <option value="free">{planLabels.free}</option>
                      <option value="pro">{planLabels.pro}</option>
                      <option value="enterprise">{planLabels.enterprise}</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="url"
                      value={websiteUrlEdits[c.id] ?? (c.websiteUrl ?? '')}
                      onChange={(e) =>
                        setWebsiteUrlEdits((prev) => ({ ...prev, [c.id]: e.target.value }))
                      }
                      placeholder="https://..."
                      className="w-full max-w-[200px] px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400">
                    {c.users.map((u) => u.email).join(', ')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleCopyApiKey(c.apiKey)}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-mono"
                    >
                      {copiedKey === c.apiKey ? t.admin.copied : t.admin.copyApiKey}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => openEditCompany(c)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm"
                    >
                      {t.common.edit}
                    </button>
                    <button
                      onClick={() => handleSaveCompany(c.id)}
                      disabled={
                        savingId === c.id ||
                        ((planEdits[c.id] ?? c.plan) === c.plan &&
                          (nameEdits[c.id] ?? c.name) === c.name &&
                          (websiteUrlEdits[c.id] ?? c.websiteUrl ?? '') === (c.websiteUrl ?? ''))
                      }
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {savingId === c.id ? '...' : t.admin.save}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'company', id: c.id })}
                      className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-sm"
                    >
                      {t.common.delete}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          {users.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              Немає користувачів.
            </div>
          ) : (
          <table className="w-full text-left">
            <thead className="bg-zinc-900">
              <tr>
                <th className="px-4 py-3 font-semibold">{t.admin.email}</th>
                <th className="px-4 py-3 font-semibold">{t.admin.name}</th>
                <th className="px-4 py-3 font-semibold">{t.admin.role}</th>
                <th className="px-4 py-3 font-semibold">{t.admin.companies}</th>
                <th className="px-4 py-3 font-semibold">{t.admin.createdAt}</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-3 font-medium">{u.email}</td>
                  <td className="px-4 py-3 text-zinc-400">{u.name || '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={roleEdits[u.id] ?? (u.role || 'user')}
                      onChange={(e) =>
                        setRoleEdits((prev) => ({ ...prev, [u.id]: e.target.value }))
                      }
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-sm"
                    >
                      <option value="user">{roleLabels.user}</option>
                      <option value="admin">{roleLabels.admin}</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400">
                    {u.companies.map((c) => `${c.name} (${c.role})`).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => openEditUser(u)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm"
                    >
                      {t.common.edit}
                    </button>
                    <button
                      onClick={() => handleSaveUserRole(u.id)}
                      disabled={
                        savingId === u.id ||
                        (roleEdits[u.id] ?? u.role ?? 'user') === (u.role || 'user')
                      }
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {savingId === u.id ? '...' : t.admin.save}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'user', id: u.id })}
                      className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-sm"
                    >
                      {t.common.delete}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      )}

      {tab === 'settings' && (
        <div className="max-w-xl rounded-lg border border-zinc-800 p-6 bg-zinc-900/50">
          <h2 className="text-lg font-semibold mb-4">{t.admin.emailSettings}</h2>
          <p className="text-zinc-500 text-sm mb-6">
            {t.admin.emailSettingsDesc}
          </p>
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-zinc-400 mb-1">{t.admin.emailHost}</label>
              <input
                value={settingsForm.emailHost}
                onChange={(e) => setSettingsForm((f) => ({ ...f, emailHost: e.target.value }))}
                placeholder="smtp.gmail.com"
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 mb-1">{t.admin.emailPort}</label>
                <input
                  type="number"
                  value={settingsForm.emailPort}
                  onChange={(e) => setSettingsForm((f) => ({ ...f, emailPort: e.target.value }))}
                  placeholder="587"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700"
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.emailSecure}
                    onChange={(e) => setSettingsForm((f) => ({ ...f, emailSecure: e.target.checked }))}
                    className="rounded"
                  />
                  {t.admin.emailSecure}
                </label>
              </div>
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">{t.admin.emailUser}</label>
              <input
                value={settingsForm.emailUser}
                onChange={(e) => setSettingsForm((f) => ({ ...f, emailUser: e.target.value }))}
                placeholder="user@example.com"
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">{t.admin.emailPass}</label>
              <input
                type="password"
                value={settingsForm.emailPass}
                onChange={(e) => setSettingsForm((f) => ({ ...f, emailPass: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700"
              />
              <p className="text-zinc-500 text-xs mt-1">{t.admin.emailPassHint}</p>
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">{t.admin.emailFrom}</label>
              <input
                type="email"
                value={settingsForm.emailFrom}
                onChange={(e) => setSettingsForm((f) => ({ ...f, emailFrom: e.target.value }))}
                placeholder="noreply@example.com"
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">{t.admin.emailTo}</label>
              <input
                type="email"
                value={settingsForm.emailTo}
                onChange={(e) => setSettingsForm((f) => ({ ...f, emailTo: e.target.value }))}
                placeholder="admin@example.com"
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700"
              />
            </div>
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={savingId === 'settings'}
            className="mt-6 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
          >
            {savingId === 'settings' ? '...' : t.admin.save}
          </button>
        </div>
      )}

      {editCompany && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-y-auto p-4"
          onClick={() => setEditCompany(null)}
        >
          <div
            className="p-6 rounded-xl bg-zinc-900 border border-zinc-700 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">{t.admin.company} — {t.common.edit}</h2>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-zinc-400 mb-1">{t.admin.name}</label>
                <input
                  value={companyForm.name ?? ''}
                  onChange={(e) => setCompanyForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">{t.admin.plan}</label>
                <select
                  value={companyForm.plan ?? 'free'}
                  onChange={(e) => setCompanyForm((f) => ({ ...f, plan: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700"
                >
                  <option value="free">{planLabels.free}</option>
                  <option value="pro">{planLabels.pro}</option>
                  <option value="enterprise">{planLabels.enterprise}</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">{t.admin.websiteUrl}</label>
                <input
                  type="url"
                  value={companyForm.websiteUrl ?? ''}
                  onChange={(e) => setCompanyForm((f) => ({ ...f, websiteUrl: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Domain</label>
                <input
                  value={companyForm.domain ?? ''}
                  onChange={(e) => setCompanyForm((f) => ({ ...f, domain: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Language</label>
                <select
                  value={companyForm.language ?? 'en'}
                  onChange={(e) => setCompanyForm((f) => ({ ...f, language: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700"
                >
                  <option value="en">English</option>
                  <option value="uk">Українська</option>
                  <option value="ru">Русский</option>
                  <option value="he">עברית</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Widget greeting</label>
                <input
                  value={companyForm.widgetGreeting ?? ''}
                  onChange={(e) => setCompanyForm((f) => ({ ...f, widgetGreeting: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Widget header</label>
                <input
                  value={companyForm.widgetHeader ?? ''}
                  onChange={(e) => setCompanyForm((f) => ({ ...f, widgetHeader: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">System prompt</label>
                <textarea
                  value={companyForm.systemPrompt ?? ''}
                  onChange={(e) => setCompanyForm((f) => ({ ...f, systemPrompt: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 min-h-[80px]"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">GROQ API Key</label>
                <input
                  type="password"
                  value={companyForm.groqKey ?? ''}
                  onChange={(e) => setCompanyForm((f) => ({ ...f, groqKey: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Telegram Bot Token</label>
                <input
                  type="password"
                  value={companyForm.telegramBotToken ?? ''}
                  onChange={(e) => setCompanyForm((f) => ({ ...f, telegramBotToken: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Telegram Chat ID</label>
                <input
                  value={companyForm.telegramChatId ?? ''}
                  onChange={(e) => setCompanyForm((f) => ({ ...f, telegramChatId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setEditCompany(null)}
                className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleSaveCompanyFull}
                disabled={savingId === editCompany.id}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
              >
                {savingId === editCompany.id ? '...' : t.admin.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {editUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setEditUser(null)}
        >
          <div
            className="p-6 rounded-xl bg-zinc-900 border border-zinc-700 max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">{t.admin.tabUsers} — {t.common.edit}</h2>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-zinc-400 mb-1">{t.admin.email}</label>
                <input
                  type="email"
                  value={userForm.email ?? ''}
                  onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">{t.admin.name}</label>
                <input
                  value={userForm.name ?? ''}
                  onChange={(e) => setUserForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">{t.admin.role}</label>
                <select
                  value={userForm.role ?? 'user'}
                  onChange={(e) => setUserForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700"
                >
                  <option value="user">{roleLabels.user}</option>
                  <option value="admin">{roleLabels.admin}</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">New password</label>
                <input
                  type="password"
                  value={userForm.password ?? ''}
                  onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700"
                  placeholder="Leave empty to keep current"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setEditUser(null)}
                className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleSaveUserFull}
                disabled={savingId === editUser.id}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
              >
                {savingId === editUser.id ? '...' : t.admin.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-700 max-w-md">
            <p className="mb-4">{t.admin.deleteConfirm}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={() =>
                  deleteConfirm.type === 'company'
                    ? handleDeleteCompany(deleteConfirm.id)
                    : handleDeleteUser(deleteConfirm.id)
                }
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500"
              >
                {t.common.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
