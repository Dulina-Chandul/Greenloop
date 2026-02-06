import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { Plus, Clock, DollarSign, Eye, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/config/api/axiosInstance";

export default function MyListings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"active" | "pending" | "sold">(
    "active",
  );

  // Fetch seller listings
  const { data: listingsData, isLoading } = useQuery({
    queryKey: ["seller-listings"],
    queryFn: async () => {
      const response = await axiosInstance.get("/seller/listings");
      return response.data.listings;
    },
  });

  // Close bidding mutation
  const { mutate: closeBidding } = useMutation({
    mutationFn: async (listingId: string) => {
      await axiosInstance.put(`/listings/${listingId}/close-bidding`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-listings"] });
    },
  });

  const listings = listingsData || [];
  const filteredListings = listings.filter((listing: any) => {
    if (activeTab === "active") return listing.status === "active";
    if (activeTab === "pending") return listing.status === "bidding_closed";
    if (activeTab === "sold") return listing.status === "sold";
    return false;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return {
          text: "LIVE AUCTION",
          color: "bg-green-500/20 text-green-400 border-green-500",
        };
      case "draft":
        return {
          text: "ANALYZING",
          color: "bg-blue-500/20 text-blue-400 border-blue-500",
        };
      default:
        return {
          text: status.toUpperCase(),
          color: "bg-gray-500/20 text-gray-400 border-gray-500",
        };
    }
  };

  const getTimeRemaining = (deadline?: string) => {
    if (!deadline) return null;
    const now = new Date().getTime();
    const end = new Date(deadline).getTime();
    const diff = end - now;

    if (diff <= 0) return "Ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Inventory</h1>
            <p className="text-gray-400">
              Manage your active scrap listings and monitor bids.
            </p>
          </div>
          <Button
            onClick={() => navigate("/seller/create-listing")}
            className="bg-green-600 hover:bg-green-700 h-12 px-6"
          >
            <Plus className="mr-2" size={20} />
            New Listing
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-8 border-b border-gray-700">
          {[
            {
              key: "active",
              label: "Active",
              count: listings.filter((l: any) => l.status === "active").length,
            },
            {
              key: "pending",
              label: "Pending Pickup",
              count: listings.filter((l: any) => l.status === "bidding_closed")
                .length,
            },
            {
              key: "sold",
              label: "Sold History",
              count: listings.filter((l: any) => l.status === "sold").length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-4 px-2 font-medium transition-colors relative ${
                activeTab === tab.key
                  ? "text-green-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full text-xs">
                {tab.count}
              </span>
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400" />
              )}
            </button>
          ))}
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing: any) => {
            const badge = getStatusBadge(listing.status);
            const timeLeft = getTimeRemaining(listing.biddingDeadline);

            return (
              <div
                key={listing._id}
                className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors"
              >
                {/* Image */}
                <div className="relative h-48">
                  <img
                    src={listing.primaryImage}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}
                    >
                      {badge.text}
                    </span>
                  </div>
                  {timeLeft && listing.status === "active" && (
                    <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Clock size={12} />
                      {timeLeft === "Ended"
                        ? "ENDING SOON"
                        : `Ends in ${timeLeft}`}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="mb-3">
                    <span className="text-xs text-green-400">
                      {listing.category} •{" "}
                      {listing.finalMaterials?.[0] || "Mixed"}
                    </span>
                    <h3 className="text-lg font-semibold text-white mt-1">
                      {listing.title}
                    </h3>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">
                        {listing.status === "active"
                          ? "Current Bid"
                          : "Est. Value"}
                      </p>
                      <p className="text-xl font-bold text-white">
                        $
                        {(
                          listing.currentHighestBid ||
                          listing.finalValue ||
                          0
                        ).toFixed(2)}
                        <span className="text-sm text-gray-400 ml-1">/kg</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-1">
                        {listing.status === "active" ? "Ends in" : "Status"}
                      </p>
                      <p className="text-sm text-gray-300">
                        {listing.status === "active"
                          ? timeLeft || "No deadline"
                          : listing.status === "draft"
                            ? "Processing..."
                            : "Completed"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {listing.status === "active" ? (
                    <Button
                      onClick={() =>
                        navigate(`/seller/listing/${listing._id}/bids`)
                      }
                      variant="outline"
                      className="w-full border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                    >
                      <Hammer className="mr-2" size={16} />
                      Manage Bids
                    </Button>
                  ) : listing.status === "draft" ? (
                    <Button disabled variant="outline" className="w-full">
                      <Clock className="mr-2 animate-spin" size={16} />
                      Locked
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate(`/seller/listing/${listing._id}`)}
                      variant="outline"
                      className="w-full"
                    >
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add New Item Card */}
          <button
            onClick={() => navigate("/seller/create-listing")}
            className="bg-gray-800 rounded-lg border-2 border-dashed border-gray-700 hover:border-gray-600 transition-colors min-h-[400px] flex flex-col items-center justify-center gap-4 group"
          >
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-gray-600 transition-colors">
              <Plus
                className="text-gray-400 group-hover:text-gray-300"
                size={32}
              />
            </div>
            <div className="text-center">
              <p className="text-gray-300 font-semibold mb-1">
                Add Another Item
              </p>
              <p className="text-gray-500 text-sm">
                Upload photos and set pricing
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
