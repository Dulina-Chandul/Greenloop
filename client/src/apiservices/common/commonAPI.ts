import axiosInstance from "@/config/api/axiosInstance";

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
  confirmPassword,
}: resetPasswordParams) => {
  const response = await axiosInstance.post("/auth/password/reset", {
    verificationCode,
    password,
    confirmPassword,
  });
  return response as any;
};

export const getUserAPI = async () => {
  const response = await axiosInstance.get("/user");
  return response as any;
};

export const logout = async () => {
  const response = await axiosInstance.get("/auth/logout");
  return response as any;
};

export const getSessionsAPI = async () => {
  const response = await axiosInstance.get("/sessions");
  return response as any;
};

export const deleteSessionAPI = async (id: string) => {
  const response = await axiosInstance.delete(`/sessions/${id}`);
  return response as any;
};
