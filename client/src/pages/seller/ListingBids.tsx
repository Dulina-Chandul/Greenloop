import { useNavigate, useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, User, DollarSign, Calendar, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axiosInstance from "@/config/api/axiosInstance";

export default function ListingBids() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: bidsData, isLoading } = useQuery({
    queryKey: ["listing-bids", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/bids/listing/${id}`);
      return response.data.bids;
    },
    enabled: !!id,
  });

  const { data: listingData } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/listings/${id}`);
      return response.data.listing;
    },
    enabled: !!id,
  });

  const { mutate: acceptBid, isPending: isAccepting } = useMutation({
    mutationFn: async (bidId: string) => {
      await axiosInstance.put(`/bids/${bidId}/accept`);
    },
    onSuccess: () => {
      toast.success("Bid accepted successfully");
      queryClient.invalidateQueries({ queryKey: ["listing-bids", id] });
      queryClient.invalidateQueries({ queryKey: ["listing", id] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to accept bid");
    },
  });

  const { mutate: closeBidding, isPending: isClosing } = useMutation({
    mutationFn: async () => {
      await axiosInstance.put(`/listings/${id}/close-bidding`);
    },
    onSuccess: () => {
      toast.success("Bidding closed successfully");
      queryClient.invalidateQueries({ queryKey: ["listing", id] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to close bidding");
    },
  });

  const bids = bidsData || [];
  const listing = listingData || {};

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900">
        <div className="text-white">Loading bids...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/seller/listings")}
          className="mb-6 text-gray-400 hover:text-white pl-0"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Listings
        </Button>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Manage Bids</h1>
            <p className="text-gray-400">
              {listing.title} • {bids.length} active bids
            </p>
          </div>
          {listing.status === "sold" && (
            <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-2 rounded-lg font-semibold">
              SOLD
            </div>
          )}
          {listing.status === "active" && (
            <Button
              onClick={() => {
                if (confirm("Are you sure you want to close bidding?")) {
                  closeBidding();
                }
              }}
              disabled={isClosing}
              variant="destructive"
            >
              Close Bidding
            </Button>
          )}
        </div>

        <div className="grid gap-4">
          {bids.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
              <p className="text-gray-400">No bids placed yet.</p>
            </div>
          ) : (
            bids.map((bid: any) => (
              <div
                key={bid._id}
                className={`bg-gray-800 rounded-lg p-6 border ${
                  bid.status === "accepted"
                    ? "border-green-500 bg-green-500/5"
                    : "border-gray-700"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="text-gray-400" size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">
                          {bid.bidderId?.firstName} {bid.bidderId?.lastName}
                        </h3>
                        <div className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-xs">
                          ★ {bid.collectorInfo?.rating?.toFixed(1) || "New"}
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        Member since{" "}
                        {new Date(
                          bid.bidderId?.createdAt || Date.now(),
                        ).getFullYear()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">
                      ${bid.amount.toFixed(2)}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {bid.isHighestBid ? "Highest Bid" : "Ranked Bid"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Calendar className="text-gray-500 mt-1" size={16} />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">
                        Proposed Pickup
                      </p>
                      <p className="text-gray-300">
                        {bid.proposedPickupDate
                          ? new Date(
                              bid.proposedPickupDate,
                            ).toLocaleDateString()
                          : "Flexible"}{" "}
                        • {bid.proposedPickupTime || "Any time"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="text-gray-500 mt-1" size={16} />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">
                        Transport
                      </p>
                      <p className="text-gray-300">
                        {bid.hasOwnTransport
                          ? "Has own transport"
                          : "Requires pickup"}
                      </p>
                    </div>
                  </div>
                </div>

                {bid.message && (
                  <div className="mt-4 text-gray-300 text-sm italic border-l-2 border-gray-600 pl-4 py-1">
                    "{bid.message}"
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-3 border-t border-gray-700 pt-4">
                  {bid.status === "pending" &&
                    (listing.status === "active" ||
                      listing.status === "bidding_closed") && (
                      <Button
                        onClick={() => acceptBid(bid._id)}
                        disabled={isAccepting}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="mr-2" size={16} />
                        Accept Bid
                      </Button>
                    )}
                  {bid.status === "accepted" && (
                    <div className="flex items-center text-green-400 font-medium">
                      <Check className="mr-2" size={16} />
                      Bid Accepted
                    </div>
                  )}
                  {bid.status === "rejected" && (
                    <div className="flex items-center text-red-400 font-medium">
                      <X className="mr-2" size={16} />
                      Rejected
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
