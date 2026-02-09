import axiosInstance from "@/config/api/axiosInstance";
import { clearAuth, setAuth } from "@/redux/slices/authSlice";
import type { AppDispatch } from "@/redux/store/store";

type resetPasswordParams = {
  verificationCode: string;
  password: string;
  confirmPassword: string;
};

export const verifyEmailAPI = async (code: string) => {
  const response = await axiosInstance.get(`/auth/email/verify/${code}`);
  return response as any;
};

export const forgotPasswordAPI = async (email: string) => {
  const response = await axiosInstance.post(`/auth/password/forgot`, { email });
  return response as any;
};

export const resetPasswordAPI = async ({
  verificationCode,
  password,
}: resetPasswordParams) => {
  const response = await axiosInstance.post("/auth/password/reset", {
    verificationCode,
    password,
  });
  return response as any;
};

//TODO : get the user from the store
export const getUserAPI = async (dispatch?: AppDispatch) => {
  const response = await axiosInstance.get("/user");

  if (dispatch && response?.data?.user && response?.data?.role) {
    dispatch(
      setAuth({
        user: response.data.user,
        role: response.data.role,
      }),
    );
  }

  return response.data as any;
};

export const logout = async (dispatch: AppDispatch) => {
  try {
    const response = await axiosInstance.get("/auth/logout");
    return response as any;
  } finally {
    dispatch(clearAuth());
  }
};

export const getSessionsAPI = async () => {
  const response = await axiosInstance.get("/sessions");
  return response as any;
};

export const deleteSessionAPI = async (id: string) => {
  const response = await axiosInstance.delete(`/sessions/${id}`);
  return response as any;
};
