const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  }
}

export function getAccessToken() {
  if (typeof window !== 'undefined' && !accessToken) {
    accessToken = localStorage.getItem('accessToken');
    refreshToken = localStorage.getItem('refreshToken');
  }
  return accessToken;
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

  let res = await fetch(`${API_URL}${url}`, { ...options, headers });

  if (res.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      setTokens(data.accessToken, data.refreshToken);
      (headers as Record<string, string>)['Authorization'] = `Bearer ${data.accessToken}`;
      res = await fetch(`${API_URL}${url}`, { ...options, headers });
    } else {
      clearTokens();
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
  }

  return res;
}

async function fetchWithAuthUpload(url: string, formData: FormData) {
  const token = getAccessToken();
  const headers: HeadersInit = {};
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  // Do NOT set Content-Type - browser sets multipart/form-data with boundary

  let res = await fetch(`${API_URL}${url}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (res.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      setTokens(data.accessToken, data.refreshToken);
      (headers as Record<string, string>)['Authorization'] = `Bearer ${data.accessToken}`;
      res = await fetch(`${API_URL}${url}`, { method: 'POST', headers, body: formData });
    } else {
      clearTokens();
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
  }

  return res;
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; name?: string; companyName: string }) =>
      fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    me: () => fetchWithAuth('/auth/me'),
    updateProfile: (data: { name?: string; password?: string }) =>
      fetchWithAuth('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },
  companies: () => fetchWithAuth('/companies'),
  company: (id: string) => fetchWithAuth(`/companies/${id}`),
  updateCompany: (id: string, data: Record<string, unknown>) =>
    fetchWithAuth(`/companies/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  uploadCompanyAvatar: (companyId: string, file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return fetchWithAuthUpload(`/companies/${companyId}/avatar`, formData);
  },
  chats: (companyId: string) => fetchWithAuth(`/chats/company/${companyId}`),
  chat: (companyId: string, chatId: string) =>
    fetchWithAuth(`/chats/company/${companyId}/${chatId}`),
  knowledge: (companyId: string) => fetchWithAuth(`/knowledge/company/${companyId}`),
  createKnowledge: (companyId: string, data: { title: string; content: string; jsonData?: object }) =>
    fetchWithAuth(`/knowledge/company/${companyId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateKnowledge: (companyId: string, id: string, data: { title?: string; content?: string }) =>
    fetchWithAuth(`/knowledge/company/${companyId}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteKnowledge: (companyId: string, id: string) =>
    fetchWithAuth(`/knowledge/company/${companyId}/${id}`, { method: 'DELETE' }),
  uploadKnowledge: (companyId: string, formData: FormData) =>
    fetchWithAuthUpload(`/knowledge/company/${companyId}/upload`, formData),
  adminCheck: () => fetchWithAuth('/admin/check'),
  adminCompanies: () => fetchWithAuth('/admin/companies'),
  adminCompany: (id: string) => fetchWithAuth(`/admin/companies/${id}`),
  adminUpdateCompany: (
    companyId: string,
    data: {
      plan?: string;
      name?: string;
      domain?: string | null;
      groqKey?: string | null;
      systemPrompt?: string | null;
      telegramBotToken?: string | null;
      telegramChatId?: string | null;
      language?: string;
      widgetGreeting?: string | null;
      widgetHeader?: string | null;
      websiteUrl?: string | null;
    },
  ) =>
    fetchWithAuth(`/admin/companies/${companyId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  adminDeleteCompany: (companyId: string) =>
    fetchWithAuth(`/admin/companies/${companyId}`, { method: 'DELETE' }),
  adminUsers: () => fetchWithAuth('/admin/users'),
  adminUser: (id: string) => fetchWithAuth(`/admin/users/${id}`),
  adminDeleteUser: (userId: string) =>
    fetchWithAuth(`/admin/users/${userId}`, { method: 'DELETE' }),
  adminUpdateUser: (userId: string, data: { role?: string; name?: string | null; email?: string; password?: string }) =>
    fetchWithAuth(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  adminSettings: () => fetchWithAuth('/admin/settings'),
  adminUpdateSettings: (data: {
    emailHost?: string | null;
    emailPort?: number | null;
    emailSecure?: boolean;
    emailUser?: string | null;
    emailPass?: string | null;
    emailFrom?: string | null;
    emailTo?: string | null;
  }) =>
    fetchWithAuth('/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  contact: (data: { name: string; email: string; message: string; plan?: string }) =>
    fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  scraperRun: (companyId: string, url: string) =>
    fetchWithAuth(`/scraper/company/${companyId}/run`, {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),
  scraperJobs: (companyId: string) => fetchWithAuth(`/scraper/company/${companyId}/jobs`),
};
