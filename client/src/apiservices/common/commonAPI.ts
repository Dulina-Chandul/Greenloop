import axiosInstance from "@/config/api/axiosInstance";

type resetPasswordParams = {
  verificationCode: string;
  password: string;
  confirmPassword: string;
};

export const verifyEmailAPI = async (code: string) => {
  const response = await axiosInstance.get(`/auth/email/verify/${code}`);
  return response;
};

export const forgotPasswordAPI = async (email: string) => {
  const response = await axiosInstance.post(`/auth/password/forgot`, { email });
  return response;
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
  return response;
};
