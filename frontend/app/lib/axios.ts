import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL,
});

export default api;
