import axios, { AxiosError } from "axios";
import queryClient from "../query-client/queryClient";
import { navigate } from "@/lib/navigation";
import { store } from "@/redux/store/store";
import { clearAuth } from "@/redux/slices/authSlice";

interface apiErrorResponse {
  errorCode?: string;
  [key: string]: any;
}

const options = {
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
};

const tokenRefreshClient = axios.create(options);
tokenRefreshClient.interceptors.response.use((response) => response.data);

const axiosInstance = axios.create(options);
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<apiErrorResponse>) => {
    const { config, response } = error;
    const originalRequest = config;

    console.log(
      "Axios Error Interceptor:",
      response?.status,
      response?.data?.errorCode,
    );

    if (!response) {
      return Promise.reject(error);
    }

    const { status, data } = response || {};

    if (
      status === 401 &&
      data?.errorCode === "INVALID_ACCESS_TOKEN" &&
      originalRequest
    ) {
      if (isRefreshing) {
        console.log("Token refresh already in progress, queuing request");
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;
      console.log("Attempting to refresh token...");

      try {
        await tokenRefreshClient.get("/auth/refresh");
        console.log("Token refresh successful");
        processQueue(null, true);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.log("Token refresh failed:", refreshError);
        processQueue(refreshError, null);
        store.dispatch(clearAuth());
        queryClient.clear();
        if (navigate) {
          navigate("/login", {
            state: {
              redirectUrl: window.location.pathname,
            },
          });
        }
        return Promise.reject({ status: 401, message: "Session Expired!" });
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject({ status, ...data });
  },
);

export default axiosInstance;
