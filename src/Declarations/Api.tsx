import axios from "axios";
import { URL } from "./Constant/constant";

const api = axios.create({
  baseURL: URL,
});

// AVANT chaque requête
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// APRÈS chaque réponse
api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const requeteOriginal = error.config;

    if (
      error.response?.status === 401 &&
      !requeteOriginal._retry
    ) {
      requeteOriginal._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        window.location.href = "/login";

        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${URL}/api/token/refresh/`,
          {
            refresh: refreshToken,
          }
        );

        const newAccessToken = response.data.access;

        localStorage.setItem(
          "access_token",
          newAccessToken
        );

        requeteOriginal.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(requeteOriginal);

      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;