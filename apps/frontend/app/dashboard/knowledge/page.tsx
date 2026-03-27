'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useLang } from '@/lib/language-context';

type KnowledgeItem = {
  id: string;
  title: string;
  content: string;
  type: string;
  jsonData?: unknown;
};

export default function KnowledgePage() {
  const { t } = useLang();
  const [companies, setCompanies] = useState<{ company: { id: string } }[]>([]);
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const companyId = companies[0]?.company?.id;

  const load = () => {
    if (!companyId) return;
    api.knowledge(companyId)
      .then((r) => r.json())
      .then(setItems);
  };

  useEffect(() => {
    api.companies()
      .then((r) => r.json())
      .then((data) => {
        setCompanies(data);
        if (data[0]?.company?.id) {
          return api.knowledge(data[0].company.id).then((r) => r.json());
        }
        return [];
      })
      .then((data) => Array.isArray(data) && setItems(data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (companyId) load();
  }, [companyId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    const res = await api.createKnowledge(companyId, { title, content });
    if (res.ok) {
      setTitle('');
      setContent('');
      setShowForm(false);
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!companyId || !confirm(t.knowledge.deleteConfirm)) return;
    const res = await api.deleteKnowledge(companyId, id);
    if (res.ok) {
      load();
      setExpandedId((prev) => (prev === id ? null : prev));
      setEditingId((prev) => (prev === id ? null : prev));
    }
  };

  const startEdit = (item: KnowledgeItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditContent(item.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !editingId) return;
    const res = await api.updateKnowledge(companyId, editingId, {
      title: editTitle,
      content: editContent,
    });
    if (res.ok) {
      load();
      cancelEdit();
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!companyId || !files?.length) return;
    const file = files[0];
    setUploadError(null);
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.uploadKnowledge(companyId, formData);
      if (res.ok) {
        load();
      } else {
        const err = await res.json().catch(() => ({}));
        const msg = Array.isArray(err.message) ? err.message[0] : err.message;
        setUploadError(msg || t.knowledge.uploadError);
      }
    } catch {
      setUploadError(t.knowledge.uploadError);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  if (loading) return <div>{t.common.loading}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t.knowledge.title}</h1>
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition"
        >
          {showForm ? t.common.cancel : t.knowledge.addKnowledge}
        </button>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex-1 min-w-[280px] p-6 rounded-lg border-2 border-dashed transition ${
            dragOver ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-700 hover:border-zinc-600'
          } ${uploading ? 'pointer-events-none opacity-70' : 'cursor-pointer'}`}
        >
          <input
            type="file"
            id="knowledge-upload"
            accept=".pdf,.txt,.jpg,.jpeg,.png,.webp"
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <label htmlFor="knowledge-upload" className="block cursor-pointer text-center">
            {uploading ? (
              <span className="text-zinc-400">{t.knowledge.processing}</span>
            ) : (
              <>
                <span className="font-medium text-zinc-300">{t.knowledge.uploadOrDrop}</span>
                <span className="block text-xs text-zinc-500 mt-1">{t.knowledge.supportedFormats}</span>
              </>
            )}
          </label>
        </div>
      </div>
      {uploadError && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {uploadError}
        </div>
      )}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 p-4 rounded-lg bg-zinc-900 border border-zinc-800 max-w-xl">
          <input
            placeholder={t.knowledge.titlePlaceholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-700 mb-2"
            required
          />
          <textarea
            placeholder={t.knowledge.contentPlaceholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-700 mb-2 min-h-[100px]"
            required
          />
          <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500">
            {t.common.save}
          </button>
        </form>
      )}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden"
          >
            <div
              className="p-4 flex justify-between items-start cursor-pointer hover:bg-zinc-800/50 transition"
              onClick={() => editingId !== item.id && setExpandedId((prev) => (prev === item.id ? null : item.id))}
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{item.title}</h3>
                <span className="text-xs text-zinc-500 mr-2">{item.type}</span>
                <p className={`text-zinc-400 text-sm mt-1 ${expandedId === item.id ? '' : 'line-clamp-2'}`}>
                  {item.content}
                </p>
              </div>
              <div className="flex gap-2 ml-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => startEdit(item)}
                  className="px-2 py-1 rounded text-sm text-zinc-400 hover:text-white hover:bg-zinc-700"
                >
                  {t.common.edit}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-2 py-1 rounded text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10"
                >
                  {t.common.delete}
                </button>
                <span className="text-zinc-600 text-lg">
                  {expandedId === item.id ? '▼' : '▶'}
                </span>
              </div>
            </div>

            {editingId === item.id && (
              <form onSubmit={handleUpdate} className="p-4 border-t border-zinc-800 bg-zinc-950">
                <input
                  placeholder={t.knowledge.titlePlaceholder}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 mb-2"
                  required
                  onClick={(e) => e.stopPropagation()}
                />
                <textarea
                  placeholder={t.knowledge.contentPlaceholder}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 mb-2 min-h-[120px]"
                  required
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500">
                    {t.common.save}
                  </button>
                  <button type="button" onClick={cancelEdit} className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600">
                    {t.common.cancel}
                  </button>
                </div>
              </form>
            )}

            {expandedId === item.id && editingId !== item.id && (
              <div className="p-4 border-t border-zinc-800 bg-zinc-950" onClick={(e) => e.stopPropagation()}>
                <div className="text-sm text-zinc-300 whitespace-pre-wrap mb-4">{item.content}</div>
                {item.type === 'scraper' && item.jsonData && Array.isArray(item.jsonData) ? (
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold text-zinc-500 mb-2">{t.knowledge.parsedData} ({item.jsonData.length})</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {(item.jsonData as { title?: string; description?: string; price?: string; url?: string }[]).map((row, i) => (
                        <div key={i} className="p-2 rounded bg-zinc-800 text-xs">
                          <div className="font-medium">{row.title || '-'}</div>
                          {row.description && <div className="text-zinc-400 truncate">{row.description}</div>}
                          {row.price && <span className="text-emerald-400">{row.price}</span>}
                          {row.url && (
                            <a href={row.url} target="_blank" rel="noreferrer" className="block text-blue-400 truncate hover:underline">
                              {row.url}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
