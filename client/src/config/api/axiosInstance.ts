import axios, { AxiosError } from "axios";
import queryClient from "../query-client/queryClient";
import { navigate } from "@/lib/navigation";

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
axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<apiErrorResponse>) => {
    const { config, response } = error;

    if (!response) {
      return Promise.reject(error);
    }

    const { status, data } = response || {};

    if (status === 401 && data?.errorCode === "InvalidAccessToken" && config) {
      try {
        await tokenRefreshClient.get("/auth/refresh");
        return axiosInstance(config);
      } catch (refreshError) {
        queryClient.clear();
        if (navigate) {
          navigate("/login", {
            state: {
              redirectUrl: window.location.pathname,
            },
          });
        }
        return Promise.reject({ status: 401, message: "Session Expired!" });
      }
    }

    return Promise.reject({ status, ...data });
  },
);

export default axiosInstance;
