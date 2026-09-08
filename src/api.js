const API_BASE_URL = 'http://127.0.0.1:8000';

export async function apiFetch(path) {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export default API_BASE_URL;
