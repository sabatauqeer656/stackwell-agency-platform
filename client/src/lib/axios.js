import axios from 'axios';

// One configured HTTP client for the whole app. Every API call goes through it,
// so base URL, cookies and (later) auth headers are defined in a single place.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1',
  withCredentials: true, // send the httpOnly refresh-token cookie (used in the auth step)
  timeout: 15000,
});

export default api;
