// Lightweight fetch wrapper for the Django backend (DRF + SimpleJWT)

export const BASE_URL =
  (typeof window !== "undefined" && window.__API_BASE__) ||
  "http://localhost:8000/api";

const ACCESS_KEY = "kt_access";
const REFRESH_KEY = "kt_refresh";
const USER_KEY = "kt_user";

export const tokenStore = {
  get access() {
    return typeof localStorage !== "undefined"
      ? localStorage.getItem(ACCESS_KEY)
      : null;
  },
  get refresh() {
    return typeof localStorage !== "undefined"
      ? localStorage.getItem(REFRESH_KEY)
      : null;
  },
  get user() {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  set(access, refresh, user) {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
  } catch {
    return null;
  }
}

async function refreshAccess() {
  const refresh = tokenStore.refresh;
  if (!refresh) return null;

  const res = await fetch(`${BASE_URL}/token/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    tokenStore.clear();
    return null;
  }

  const data = await res.json();
  const user = tokenStore.user;

  if (user) tokenStore.set(data.access, refresh, user);

  return data.access;
}

export class ApiError extends Error {
  constructor(msg, status, data) {
    super(msg);
    this.status = status;
    this.data = data;
  }
}

export async function api(path, init = {}) {
  const { auth = true, json, headers, ...rest } = init;

  const h = new Headers(headers);

  // JSON body
  if (json !== undefined) {
    h.set("Content-Type", "application/json");
    rest.body = JSON.stringify(json);
  }

  // FormData detect → DON'T set content-type manually
  if (rest.body instanceof FormData) {
    h.delete("Content-Type");
  }

  // Auth token
  if (auth) {
    const token = tokenStore.access;
    if (token) {
      h.set("Authorization", `Bearer ${token}`);
    }
  }

  let res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: h,
  });

  // token refresh
  if (res.status === 401 && auth) {
    const newToken = await refreshAccess();

    if (newToken) {
      h.set("Authorization", `Bearer ${newToken}`);

      res = await fetch(`${BASE_URL}${path}`, {
        ...rest,
        headers: h,
      });
    }
  }

  const text = await res.text();

  const data = text
    ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      })()
    : null;

  if (!res.ok) {
    const msg =
      typeof data === "object" && data
        ? data.detail ||
          data.message ||
          Object.values(data).flat().join(" ") ||
          res.statusText
        : res.statusText;

    throw new ApiError(String(msg), res.status, data);
  }

  return data;
}

// ─── Auth ─────────────────────────────

export async function login(username, password) {
  const data = await api("/auth/login/", {
    method: "POST",
    json: { username, password },
    auth: false,
  });

  const payload = decodeJwt(data.access) || {};

  const user = {
    username: payload.username || username,
    role: payload.role || "chef",
    id: payload.user_id,
  };

  tokenStore.set(data.access, data.refresh, user);

  return user;
}

export async function signup(payload) {
  await api("/auth/signup/", {
    method: "POST",
    json: payload,
    auth: false,
  });

  return login(payload.username, payload.password);
}

export async function logout() {
  const refresh = tokenStore.refresh;

  try {
    if (refresh) {
      await api("/accounts/logout/", {
        method: "POST",
        json: { refresh },
      });
    }
  } catch {}

  tokenStore.clear();
}

// ─── Menu API ─────────────────────────

export const menuApi = {
  categories: () =>
    api("/menu/categories/"),

  items: (params) => {
    const q = new URLSearchParams();

    if (params?.category) {
      q.set("category", String(params.category));
    }

    if (params?.available !== undefined) {
      q.set("is_available", String(params.available));
    }

    if (params?.search) {
      q.set("search", params.search);
    }

    const qs = q.toString();

    return api(`/menu/items/${qs ? `?${qs}` : ""}`);
  },

createItem: (data) =>
  api("/menu/items/", {
    method: "POST",
    body: data,
  }),

updateItem: (id, data) =>
  api(`/menu/items/${id}/`, {
    method: "PATCH",
    body: data,
  }),
  deleteItem: (id) =>
    api(`/menu/items/${id}/`, {
      method: "DELETE",
    }),

  toggleAvailability: (id) =>
    api(`/menu/items/${id}/toggle-availability/`, {
      method: "POST",
    }),

  createCategory: (name) =>
    api("/menu/categories/", {
      method: "POST",
      json: { name },
    }),
};

// ─── Helper ───────────────────────────

export const unwrap = (r) =>
  Array.isArray(r) ? r : r.results;

// ─── Orders API ───────────────────────

export const ordersApi = {
  all: () => api("/orders/"),

  pending: () => api("/orders/pending/"),

  kitchenQueue: () =>
    api("/orders/kitchen-queue/"),

  delivered: () =>
    api("/orders/delivered/"),

  history: () =>
    api("/orders/history/"),

  setStatus: (id, status) => {
  const formData = new FormData();
  formData.append("status", status);

  return api(`/orders/${id}/update-status/`, {
    method: "PATCH",
    body: formData,
  });
},
    create: (data) =>
    api("/orders/", {
      method: "POST",
      body: data,
    }),
 

 verifyPayment: (id) =>
  api(`/orders/${id}/update-payment/`, {
    method: "PATCH",
    json: {
      payment_status: "paid",
    },
  }),
   
};