import axios from 'axios';
import { getAccessToken, notifyAuthLost, setAccessToken } from './authToken.js';

const config = {
  // In production the API is on the same address as the site, so a relative path is enough.
  baseURL: import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '/api/v1' : 'http://localhost:5000/api/v1'),
  withCredentials: true, // send the httpOnly refresh-token cookie
  timeout: 15000,
};

// A bare client with NO interceptors. Login, refresh and logout use it, so a failing refresh can
// never trigger "refresh again" in an endless loop.
export const rawApi = axios.create(config);

// The client for everything else. Every API call goes through it, so the base URL, cookies and the
// login token are defined in a single place.
const api = axios.create(config);

// The token is sent only to the routes that need it. Public pages (services, projects...) never carry it.
const needsToken = (url = '') => url.startsWith('/admin') || url.startsWith('/auth/me');

api.interceptors.request.use((request) => {
  const token = getAccessToken();
  if (token && needsToken(request.url)) request.headers.Authorization = `Bearer ${token}`;
  return request;
});

// ---- Renewing the session ----
// While several requests fail at the same moment (the token just expired), they all share ONE refresh call.
let refreshing = null;

export function refreshSession() {
  refreshing ??= rawApi
    .post('/auth/refresh')
    .then((response) => {
      setAccessToken(response.data.data.accessToken);
      return response.data.data.user;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

// Access tokens live 15 minutes. When one expires the server answers 401 TOKEN_EXPIRED. Instead of
// bothering the user, we get a new token with the refresh cookie and repeat the request, once.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const code = error.response?.data?.error?.code;
    const renewable = error.response?.status === 401 && (code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN');

    if (!renewable || original._retried) return Promise.reject(error);
    original._retried = true; // never retry twice: a second failure is final

    try {
      await refreshSession();
    } catch {
      notifyAuthLost(); // the refresh token is gone too: the user must sign in again
      return Promise.reject(error);
    }
    original.headers.Authorization = `Bearer ${getAccessToken()}`;
    return api(original);
  }
);

export default api;
