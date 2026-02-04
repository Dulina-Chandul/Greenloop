import axiosInstance from "@/config/api/axiosInstance";
import { setAuth } from "@/redux/slices/authSlice";
import type { AppDispatch } from "@/redux/store/store";

type loginDataParams = {
  email?: string;
  phoneNumber?: string;
  password: string;
};

type registerDataParams = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  accountType: "household" | "business";
  address: {
    province: string;
    district: string;
    city: string;
    postalCode?: string;
    street?: string;
  };
  businessInfo?: {
    businessName: string;
    businessRegistration?: string;
    businessType?: string;
  };
  preferences?: any;
};

//* Login user API service this is the login for both sellers and the collectors
export const loginAPI = async (
  data: loginDataParams,
  dispatch: AppDispatch,
) => {
  const response = await axiosInstance.post("/auth/login", data);

  if (response?.data?.user && response?.data?.role) {
    dispatch(
      setAuth({
        user: response.data.user,
        role: response.data.role,
      }),
    );
  }

  return response;
};

//* Register the sellers
export const sellerRegisterAPI = async (
  data: registerDataParams,
  dispatch: AppDispatch,
) => {
  const response = await axiosInstance.post("/seller/register", data);

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

//* Seller login this also worked but recommend to use the unified login
export const loginSellerAPI = async (
  data: loginDataParams,
  dispatch: AppDispatch,
) => {
  const response = await axiosInstance.post("/seller/login", data);

  // Dispatch to Redux
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
