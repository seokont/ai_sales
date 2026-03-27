'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useLang } from '@/lib/language-context';

type Profile = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
};

export default function ProfilePage() {
  const { t } = useLang();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    api.auth
      .me()
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setName(data.name || '');
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    const res = await api.auth.updateProfile({
      name: name.trim() || undefined,
      password: password.trim() || undefined,
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setProfile(data);
      setPassword('');
    }
  };

  if (loading) return <div>{t.common.loading}</div>;
  if (!profile)
    return (
      <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
        Failed to load profile
      </div>
    );

  const roleLabels: Record<string, string> = {
    user: t.admin.roleUser,
    admin: t.admin.roleAdmin,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t.profile.title}</h1>

      <div className="max-w-xl space-y-6">
        <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <h2 className="font-semibold mb-4">{t.profile.title}</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-zinc-500">{t.profile.email}</dt>
              <dd className="font-medium">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">{t.profile.role}</dt>
              <dd className="font-medium">{roleLabels[profile.role] || profile.role}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">{t.profile.memberSince}</dt>
              <dd>{new Date(profile.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>

        <form onSubmit={handleSave} className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-4">
          <h2 className="font-semibold mb-4">{t.common.edit}</h2>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">{t.profile.name}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700"
              placeholder={t.profile.name}
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">{t.profile.changePassword}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700"
              placeholder={t.profile.newPasswordPlaceholder}
            />
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
    </div>
  );
}
