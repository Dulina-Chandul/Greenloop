import axiosInstance from "@/config/api/axiosInstance";

type loginDataParams = {
  email: string;
  password: string;
};

type registerDataParams = {
  email: string;
  password: string;
  confirmPassword: string;
};

//* Login user API service
export const loginAPI = async (data: loginDataParams) => {
  const response = await axiosInstance.post("/auth/login", data);
  return response;
};

//* Register new user API service
export const registerAPI = async (data: registerDataParams) => {
  const response = await axiosInstance.post("/auth/register", data);
  return response;
};
