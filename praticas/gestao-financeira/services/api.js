const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:3000";

let _token = null;

function buildQS(params = {}) {
  const pares = Object.entries(params).filter(([, v]) => v != null && v !== "");
  return pares.length ? "?" + new URLSearchParams(pares).toString() : "";
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json" };
  if (_token) headers.Authorization = `Bearer ${_token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    let parsed = {};
    try { parsed = JSON.parse(text); } catch {}
    const err = new Error(parsed.error ?? `HTTP ${response.status}`);
    err.status = response.status;
    err.details = parsed.details;
    throw err;
  }

  return response.status === 204 ? null : response.json();
}

export const api = {
  // Configura o token JWT para as próximas requisições
  setToken(token) { _token = token ?? null; },

  // Auth
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login:    (data) => request("/auth/login",    { method: "POST", body: JSON.stringify(data) }),
  me:       ()     => request("/auth/me"),

  // Categorias
  listCategories:  ()        => request("/categories"),
  createCategory:  (data)    => request("/categories",      { method: "POST",   body: JSON.stringify(data) }),
  updateCategory:  (id, data)=> request(`/categories/${id}`, { method: "PUT",   body: JSON.stringify(data) }),
  deleteCategory:  (id)      => request(`/categories/${id}`, { method: "DELETE" }),

  // Transações
  listTransactions: (filtros = {}) => request(`/transactions${buildQS(filtros)}`),
  getSummary:       (filtros = {}) => request(`/transactions/summary${buildQS(filtros)}`),
  createTransaction:(data)         => request("/transactions",       { method: "POST",   body: JSON.stringify(data) }),
  updateTransaction:(id, data)     => request(`/transactions/${id}`, { method: "PUT",    body: JSON.stringify(data) }),
  deleteTransaction:(id)           => request(`/transactions/${id}`, { method: "DELETE" }),
};
