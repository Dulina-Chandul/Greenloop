import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { Clock, Package, MapPin, Phone, User } from "lucide-react";
import { formatCurrency } from "@/config/currency";
import { useAppSelector } from "@/redux/hooks/hooks";
import { selectUser } from "@/redux/slices/authSlice";
import axiosInstance from "@/config/api/axiosInstance";

export default function MyBids() {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const [activeTab, setActiveTab] = useState<"active" | "won" | "lost">(
    "active",
  );

  const { data: bidsData, isLoading } = useQuery({
    queryKey: ["my-bids"],
    queryFn: async () => {
      const response = await axiosInstance.get("/bids/my-bids");
      console.log("MyBids API response:", response);
      // The response from axiosInstance interceptor is the data body: { data: { bids: [...] } }
      // So we access response.data.bids
      if (response?.data?.bids) {
        return response.data.bids;
      }
      return [];
    },
  });

  const bids = Array.isArray(bidsData) ? bidsData : [];

  const filteredBids = bids.filter((bid: any) => {
    // Safety check for missing listing data
    if (!bid.listingId) return false;

    if (activeTab === "active")
      return bid.status === "pending" && bid.listingId.status === "active";
    if (activeTab === "won") return bid.status === "accepted";
    if (activeTab === "lost")
      return (
        bid.status === "rejected" ||
        bid.status === "withdrawn" ||
        (bid.status === "pending" && bid.listingId.status !== "active")
      );
    return false;
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900">
        <div className="text-white">Loading bids...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">My Bids</h1>
        <p className="text-gray-400 mb-8">
          Track your active bids and past auctions.
        </p>

        {/* Tabs */}
        <div className="flex gap-6 mb-8 border-b border-gray-700">
          {[
            { key: "active", label: "Active Bids" },
            { key: "won", label: "Won Auctions" },
            { key: "lost", label: "History" },
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
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400" />
              )}
            </button>
          ))}
        </div>

        {/* Bids Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBids.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <p className="text-gray-500">No bids found in this category.</p>
              {activeTab === "active" && (
                <button
                  onClick={() => navigate("/collector/map")}
                  className="mt-4 text-green-400 hover:text-green-300 underline"
                >
                  Browse live listings
                </button>
              )}
            </div>
          ) : (
            filteredBids.map((bid: any) => (
              <div
                key={bid._id}
                className={`bg-gray-800 rounded-lg overflow-hidden border ${
                  bid.isHighestBid && activeTab === "active"
                    ? "border-green-500/50 shadow-[0_0_15px_rgba(74,222,128,0.1)]"
                    : "border-gray-700"
                } hover:border-gray-600 transition-colors cursor-pointer`}
                onClick={() => {
                  if (bid.listingId?._id) {
                    navigate(`/collector/auctions/${bid.listingId._id}`);
                  }
                }}
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-900">
                  {bid.listingId?.primaryImage ? (
                    <img
                      src={bid.listingId.primaryImage}
                      alt="Listing"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-600">
                      <Package size={32} />
                    </div>
                  )}

                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        bid.status === "accepted"
                          ? "bg-green-500 text-white"
                          : bid.status === "rejected"
                            ? "bg-red-500 text-white"
                            : bid.isHighestBid
                              ? "bg-green-500 text-white"
                              : "bg-yellow-500 text-white"
                      }`}
                    >
                      {bid.status === "accepted"
                        ? "WON"
                        : bid.status === "rejected"
                          ? "LOST"
                          : bid.isHighestBid
                            ? "HIGHEST BIDDER"
                            : "OUTBID"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-1 truncate">
                    {bid.listingId?.title || "Unknown Listing"}
                  </h3>
                  <div className="flex items-center text-gray-400 text-xs mb-4">
                    <MapPin size={12} className="mr-1" />
                    {bid.listingId?.address?.city || "Location N/A"}
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-gray-900/50 rounded-lg p-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">My Bid</p>
                      <p className="text-sm font-bold text-green-400">
                        {formatCurrency(bid.amount, user?.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">
                        Current Highest
                      </p>
                      <p className="text-xs text-gray-500">
                        Top Bid:{" "}
                        {formatCurrency(
                          bid.listingId?.currentHighestBid || 0,
                          user?.currency,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-700">
                    {activeTab === "won" && bid.listingId?.sellerId ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
                            <User size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {bid.listingId.sellerId.firstName}{" "}
                              {bid.listingId.sellerId.lastName}
                            </p>
                            <p className="text-xs text-gray-500">Seller</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          <a
                            href={`tel:${bid.listingId.sellerId.phoneNumber}`}
                            className="flex items-center gap-2 text-sm text-gray-300 hover:text-green-400 transition-colors p-2 bg-gray-900/50 rounded"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Phone size={14} />
                            {bid.listingId.sellerId.phoneNumber}
                          </a>
                          <div className="flex items-start gap-2 text-sm text-gray-300 p-2 bg-gray-900/50 rounded">
                            <MapPin size={14} className="mt-1 shrink-0" />
                            <span className="break-words">
                              {bid.listingId.sellerId.address?.street},{" "}
                              {bid.listingId.sellerId.address?.city}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const location = bid.listingId.location;
                            let mapsUrl = "";

                            if (
                              location?.coordinates &&
                              location.coordinates.length === 2
                            ) {
                              const [lng, lat] = location.coordinates;
                              mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                            } else {
                              const addressParts = [
                                bid.listingId.address?.street,
                                bid.listingId.address?.city,
                                bid.listingId.address?.district,
                              ].filter((part) => part);
                              const address = addressParts.join(", ");
                              mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                                address,
                              )}`;
                            }

                            window.open(mapsUrl, "_blank");
                          }}
                          className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded transition-colors"
                        >
                          Get Directions
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">
                          {new Date(bid.createdAt).toLocaleDateString()}
                        </span>
                        {activeTab === "active" && (
                          <span className="text-green-400 font-medium flex items-center">
                            <Clock size={14} className="mr-1" />
                            Active
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
