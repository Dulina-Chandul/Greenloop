import axiosInstance from "@/config/api/axiosInstance";

interface CreateBidParams {
  listingId: string;
  amount: number;
  message?: string;
  proposedPickupDate?: string;
  proposedPickupTime?: string;
  hasOwnTransport?: boolean;
  collectorLocation?: { lat: number; lng: number };
}

export const createBidAPI = async (data: CreateBidParams) => {
  const response = await axiosInstance.post("/bids", data);
  return response;
};

export const getMyBidsAPI = async (status?: string) => {
  const url = status ? `/bids/my-bids?status=${status}` : "/bids/my-bids";
  const response = await axiosInstance.get(url);
  return response;
};

export const getListingBidsAPI = async (listingId: string) => {
  const response = await axiosInstance.get(`/bids/listing/${listingId}`);
  return response;
};

export const updateBidAPI = async (bidId: string, amount: number) => {
  const response = await axiosInstance.put(`/bids/${bidId}`, { amount });
  return response;
};

export const withdrawBidAPI = async (bidId: string) => {
  const response = await axiosInstance.delete(`/bids/${bidId}`);
  return response;
};
