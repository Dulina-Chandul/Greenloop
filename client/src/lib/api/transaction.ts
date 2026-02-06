import axiosInstance from "@/config/api/axiosInstance";

export const getTransactions = async (
  role: "seller" | "buyer",
  status: "active" | "history",
) => {
  const response = await axiosInstance.get(
    `/transactions?role=${role}&status=${status}`,
  );
  return response.data;
};

export const confirmTransaction = async (
  id: string,
  role: "seller" | "buyer",
) => {
  const response = await axiosInstance.post(`/transactions/${id}/confirm`, {
    role,
  });
  return response.data;
};
