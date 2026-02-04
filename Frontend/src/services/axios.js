import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Logger Interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`📤 [${config.method?.toUpperCase()}] ${config.url}`, {
      data: config.data,
      params: config.params,
    });
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Logger Interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`📥 [${response.status}] ${response.config?.url}`, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ [${error.response?.status}] ${error.config?.url}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export default api;
