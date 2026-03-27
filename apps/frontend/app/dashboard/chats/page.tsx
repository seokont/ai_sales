'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useLang } from '@/lib/language-context';

export default function ChatsPage() {
  const { t } = useLang();
  const [companies, setCompanies] = useState<{ company: { id: string } }[]>([]);
  const [chats, setChats] = useState<{ id: string; messages: { content: string; role: string }[] }[]>([]);
  const [selected, setSelected] = useState<{ id: string; messages: { content: string; role: string }[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const companyId = companies[0]?.company?.id;

  useEffect(() => {
    api.companies()
      .then((r) => r.json())
      .then((data) => {
        setCompanies(data);
        if (data[0]?.company?.id) {
          return api.chats(data[0].company.id).then((r) => r.json());
        }
        return [];
      })
      .then((data) => {
        if (Array.isArray(data)) setChats(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const loadChat = async (chatId: string) => {
    if (!companyId) return;
    const res = await api.chat(companyId, chatId);
    const data = await res.json();
    setSelected(data);
  };

  if (loading) return <div>{t.common.loading}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t.chats.title}</h1>
      <div className="flex gap-4">
        <div className="w-64 space-y-2">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => loadChat(chat.id)}
              className={`w-full p-3 rounded-lg text-left border transition ${
                selected?.id === chat.id ? 'border-emerald-500 bg-zinc-800' : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <p className="text-sm truncate">{chat.messages?.[0]?.content || t.chats.newChat}</p>
            </button>
          ))}
        </div>
        <div className="flex-1 p-4 rounded-lg bg-zinc-900 border border-zinc-800 min-h-[400px]">
          {selected ? (
            <div className="space-y-4">
              {selected.messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
                  <span className="text-xs text-zinc-500">{m.role}</span>
                  <p className={m.role === 'user' ? 'text-emerald-400' : ''}>{m.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500">{t.chats.selectChat}</p>
          )}
        </div>
      </div>
    </div>
  );
}
