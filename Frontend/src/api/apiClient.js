import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  // baseURL: "/api/v1", // netlify setup
  withCredentials: true,
});

export default api;
