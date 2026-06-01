const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

const fetchJson = async <T = any>(path: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message ?? response.statusText);
  }

  return data as T;
};

export const getPaintings = () => fetchJson('/api/paintings');
export const getPaintingById = (id: string) => fetchJson(`/api/paintings/${id}`);
export const getBlogPosts = () => fetchJson('/api/blog-posts');
export const getBlogPostById = (id: string) => fetchJson(`/api/blog-posts/${id}`);
export const submitContactMessage = (message: { name: string; email: string; message: string }) =>
  fetchJson('/api/contact-messages', {
    method: 'POST',
    body: JSON.stringify(message),
  });
export const signIn = (email: string, password: string) =>
  fetchJson('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return fetch(`${API_BASE_URL}/api/storage/upload`, {
    method: 'POST',
    body: formData,
  }).then(async (response) => {
    if (!response.ok) {
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
      throw new Error(data?.message ?? response.statusText);
    }
    return response.json();
  });
};
