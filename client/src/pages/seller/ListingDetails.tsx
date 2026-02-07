import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  User,
  Calendar,
  DollarSign,
  Package,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/config/api/axiosInstance";

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: listingData, isLoading } = useQuery({
    queryKey: ["listing-detail", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/listings/${id}`);
      return response.data.listing;
    },
    enabled: !!id,
  });

  const listing = listingData || null;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900">
        <div className="text-white">Listing not found</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sold":
        return "bg-blue-500/20 text-blue-400 border-blue-500";
      case "bidding_closed":
        return "bg-amber-500/20 text-amber-400 border-amber-500";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500";
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Button
          variant="ghost"
          onClick={() => navigate("/seller/listings")}
          className="mb-6 text-gray-400 hover:text-white pl-0"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Listings
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Listing Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image and Basic Info */}
            <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
              <div className="relative">
                <img
                  src={listing.primaryImage}
                  alt={listing.title}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(listing.status)}`}
                  >
                    {listing.status === "sold"
                      ? "SOLD"
                      : listing.status === "bidding_closed"
                        ? "PENDING PICKUP"
                        : listing.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {listing.title}
                    </h1>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400 mb-1">Final Price</p>
                    <p className="text-3xl font-bold text-green-400">
                      $
                      {(
                        listing.currentHighestBid ||
                        listing.finalValue ||
                        0
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <Package
                      className="mx-auto text-green-400 mb-2"
                      size={24}
                    />
                    <p className="text-xs text-gray-400 mb-1">Category</p>
                    <p className="text-white font-semibold capitalize">
                      {listing.category}
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <DollarSign
                      className="mx-auto text-green-400 mb-2"
                      size={24}
                    />
                    <p className="text-xs text-gray-400 mb-1">Weight</p>
                    <p className="text-white font-semibold">
                      {listing.finalWeight} kg
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <Clock className="mx-auto text-green-400 mb-2" size={24} />
                    <p className="text-xs text-gray-400 mb-1">Listed</p>
                    <p className="text-white font-semibold">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Description
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {listing.description}
                  </p>
                </div>

                {/* Materials */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Detected Materials
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.finalMaterials?.map(
                      (material: string, index: number) => (
                        <span
                          key={index}
                          className="bg-green-500/20 text-green-400 border border-green-500/50 px-3 py-1 rounded-full text-sm"
                        >
                          {material}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Collector Information */}
          <div className="lg:col-span-1">
            {(listing.status === "sold" ||
              listing.status === "bidding_closed") &&
            listing.acceptedBuyerId ? (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 sticky top-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <User className="text-green-400" size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Collector Information
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Collector Name */}
                  <div className="flex items-start gap-3 p-4 bg-gray-700 rounded-lg">
                    <User className="text-gray-400 mt-1" size={18} />
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">
                        Collector Name
                      </p>
                      <p className="text-white font-semibold">
                        {listing.acceptedBuyerId?.firstName}{" "}
                        {listing.acceptedBuyerId?.lastName}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3 p-4 bg-gray-700 rounded-lg">
                    <Phone className="text-gray-400 mt-1" size={18} />
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">Phone Number</p>
                      <a
                        href={`tel:${listing.acceptedBuyerId?.phoneNumber}`}
                        className="text-green-400 hover:text-green-300 font-medium"
                      >
                        {listing.acceptedBuyerId?.phoneNumber}
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  {listing.acceptedBuyerId?.email && (
                    <div className="flex items-start gap-3 p-4 bg-gray-700 rounded-lg">
                      <Mail className="text-gray-400 mt-1" size={18} />
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-1">Email</p>
                        <a
                          href={`mailto:${listing.acceptedBuyerId?.email}`}
                          className="text-green-400 hover:text-green-300 font-medium break-all"
                        >
                          {listing.acceptedBuyerId?.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  {listing.acceptedBuyerId?.address && (
                    <div className="flex items-start gap-3 p-4 bg-gray-700 rounded-lg">
                      <MapPin className="text-gray-400 mt-1" size={18} />
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-1">Location</p>
                        <p className="text-white">
                          {listing.acceptedBuyerId.address.street &&
                            `${listing.acceptedBuyerId.address.street}, `}
                          {listing.acceptedBuyerId.address.city},{" "}
                          {listing.acceptedBuyerId.address.district}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="flex items-start gap-3 p-4 bg-gray-700 rounded-lg">
                    <Calendar className="text-gray-400 mt-1" size={18} />
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">
                        Collector Rating
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 text-xl">★</span>
                        <span className="text-white font-semibold">
                          {listing.acceptedBuyerId?.rating?.average?.toFixed(
                            1,
                          ) || "New"}
                        </span>
                        {listing.acceptedBuyerId?.stats?.completedTransactions >
                          0 && (
                          <span className="text-gray-400 text-sm">
                            (
                            {
                              listing.acceptedBuyerId.stats
                                .completedTransactions
                            }{" "}
                            completed)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Actions */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-600">
                    <Button
                      onClick={() =>
                        window.open(
                          `tel:${listing.acceptedBuyerId?.phoneNumber}`,
                        )
                      }
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Phone size={16} className="mr-2" />
                      Call
                    </Button>
                    <Button
                      onClick={() =>
                        window.open(
                          `sms:${listing.acceptedBuyerId?.phoneNumber}`,
                        )
                      }
                      variant="outline"
                      className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                    >
                      <Mail size={16} className="mr-2" />
                      SMS
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <p className="text-gray-400 text-center">
                  Collector information will be available once the listing is
                  sold.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
