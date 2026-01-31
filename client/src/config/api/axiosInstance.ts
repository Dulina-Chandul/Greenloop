import axios from "axios";
import queryClient from "../query-client/queryClient";
import { navigate } from "@/lib/navigation";

const options = {
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
};

const tokenRefreshClient = axios.create(options);
tokenRefreshClient.interceptors.response.use((response) => response.data);

const axiosInstance = axios.create(options);
axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const { config, response } = error;
    const { status, data } = response || {};

    if (status === 401 && data?.errorCode === "InvalidAccessToken") {
      try {
        await tokenRefreshClient.get("/auth/refresh");
        return tokenRefreshClient(config);
      } catch (error) {
        queryClient.clear();
        if (navigate) {
          navigate("/login", {
            state: {
              redirectUrl: window.location.pathname,
            },
          });
        }
      }
    }

    return Promise.reject({ status, ...data });
  },
);

export default axiosInstance;
