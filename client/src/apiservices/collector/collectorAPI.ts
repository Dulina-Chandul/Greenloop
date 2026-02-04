import axiosInstance from "@/config/api/axiosInstance";
import { setAuth } from "@/redux/slices/authSlice";
import type { AppDispatch } from "@/redux/store/store";

type LoginDataParams = {
  email?: string;
  phoneNumber?: string;
  password: string;
};

type RegisterDataParams = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  address: {
    province: string;
    district: string;
    city: string;
    postalCode?: string;
    street?: string;
  };
  businessName?: string;
  businessRegistration?: string;
  preferences?: any;
};

//* Register the collectors
export const registerCollectorAPI = async (
  data: RegisterDataParams,
  dispatch: AppDispatch,
) => {
  const response = await axiosInstance.post("/collector/register", data);

  if (response.data?.user && response.data?.role) {
    dispatch(
      setAuth({
        user: response.data.user,
        role: response.data.role,
      }),
    );
  }

  return response;
};

//* Collector login this also worked but recommend to use the unified login
export const loginCollectorAPI = async (
  data: LoginDataParams,
  dispatch: AppDispatch,
) => {
  const response = await axiosInstance.post("/collector/login", data);

  if (response.data?.user && response.data?.role) {
    dispatch(
      setAuth({
        user: response.data.user,
        role: response.data.role,
      }),
    );
  }

  return response;
};
