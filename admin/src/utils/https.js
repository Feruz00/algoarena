import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.replace("/login");
      return Promise.reject(error);
    }

    // Don't retry if there is no request config
    if (!config) {
      return Promise.reject(error);
    }

    // Don't retry authentication errors or other 4xx errors
    if (error.response?.status >= 400 && error.response.status < 500) {
      return Promise.reject(error);
    }

    config._retryCount = config._retryCount || 0;

    if (config._retryCount < 3) {
      config._retryCount += 1;
      return http(config);
    }

    return Promise.reject(error);
  },
);

export default http;
