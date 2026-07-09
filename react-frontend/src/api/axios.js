// react-frontend/src/api/axios.js
import axios from "axios";

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default api;