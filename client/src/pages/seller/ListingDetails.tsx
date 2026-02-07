import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAppSelector } from "@/redux/hooks/hooks";
import { selectUser } from "@/redux/slices/authSlice";
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
  CheckCircle,
  Gavel,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axiosInstance from "@/config/api/axiosInstance";
import { formatCurrency } from "@/config/currency";

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);

  const { data: listingData, isLoading } = useQuery({
    queryKey: ["listing-detail", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/listings/${id}`);
      return response.data.listing;
    },
    enabled: !!id,
  });

  // Fetch transaction for this listing
  const { data: transactionData, refetch: refetchTransaction } = useQuery({
    queryKey: ["listing-transaction", id],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/transactions?listingId=${id}&role=seller`,
      );
      return response.data.data.transactions[0];
    },
    enabled: !!id && !!listingData && listingData.status !== "active",
  });

  const { mutate: confirmPickup, isPending: isConfirming } = useMutation({
    mutationFn: async (transactionId: string) => {
      await axiosInstance.post(`/transactions/${transactionId}/confirm`, {
        role: "seller",
      });
    },
    onSuccess: () => {
      toast.success("Pickup confirmed successfully");
      refetchTransaction();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to confirm pickup");
    },
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

  // Determine collector to show (prefer transaction data as it's more relevant for the deal)
  const collector =
    transactionData?.buyerId || listing?.acceptedBuyerId || null;

  return (
    <div className="h-full overflow-y-auto bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Button
          variant="ghost"
          onClick={() => navigate("/seller/listings")}
          className="mb-6 text-gray-400 hover:text-green-400 hover:bg-transparent pl-0"
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
                        ? collector
                          ? "PENDING PICKUP"
                          : "BIDDING ENDED"
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
                      {formatCurrency(
                        listing.currentHighestBid || listing.finalValue || 0,
                        user?.currency,
                      )}
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
            collector ? (
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
                        {collector.firstName} {collector.lastName}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3 p-4 bg-gray-700 rounded-lg">
                    <Phone className="text-gray-400 mt-1" size={18} />
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">Phone Number</p>
                      <a
                        href={`tel:${collector.phoneNumber}`}
                        className="text-green-400 hover:text-green-300 font-medium"
                      >
                        {collector.phoneNumber}
                      </a>
                    </div>
                  </div>

                  {collector.email && (
                    <div className="flex items-start gap-3 p-4 bg-gray-700 rounded-lg">
                      <Mail className="text-gray-400 mt-1" size={18} />
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-1">Email</p>
                        <a
                          href={`mailto:${collector.email}`}
                          className="text-green-400 hover:text-green-300 font-medium break-all"
                        >
                          {collector.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  {collector.address && (
                    <div className="flex items-start gap-3 p-4 bg-gray-700 rounded-lg">
                      <MapPin className="text-gray-400 mt-1" size={18} />
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-1">Location</p>
                        <p className="text-white">
                          {collector.address.street &&
                            `${collector.address.street}, `}
                          {collector.address.city}, {collector.address.district}
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
                          {collector.rating?.average?.toFixed(1) || "New"}
                        </span>
                        {collector.stats?.completedTransactions > 0 && (
                          <span className="text-gray-400 text-sm">
                            ({collector.stats.completedTransactions} completed)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Actions */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-600">
                    <Button
                      onClick={() =>
                        window.open(`tel:${collector.phoneNumber}`)
                      }
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Phone size={16} className="mr-2" />
                      Call
                    </Button>
                    <Button
                      onClick={() =>
                        window.open(`sms:${collector.phoneNumber}`)
                      }
                      variant="outline"
                      className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                    >
                      <Mail size={16} className="mr-2" />
                      SMS
                    </Button>
                  </div>

                  {/* Confirm Pickup Button */}
                  {transactionData &&
                    !transactionData.sellerConfirmed &&
                    (transactionData.status === "scheduled" ||
                      transactionData.status === "in_progress") && (
                      <div className="pt-4 border-t border-gray-600">
                        <Button
                          onClick={() => confirmPickup(transactionData._id)}
                          disabled={isConfirming}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {isConfirming ? (
                            <>
                              <Clock className="mr-2 animate-spin" size={16} />
                              Confirming...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2" size={16} />
                              Confirm Pickup & Payment
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-gray-400 mt-2 text-center">
                          Click this after the collector has picked up the items
                          and paid you.
                        </p>
                      </div>
                    )}

                  {transactionData?.sellerConfirmed && (
                    <div className="pt-4 border-t border-gray-600 text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400 border border-green-500/50">
                        <CheckCircle size={16} />
                        <span className="text-sm font-medium">
                          Pickup Confirmed
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                {listing.status === "bidding_closed" && !collector ? (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Gavel className="text-amber-400" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Select a Winner
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Bidding has ended. Please review the bids and select a
                      winner to proceed.
                    </p>
                    <Button
                      onClick={() =>
                        navigate(`/seller/listing/${listing._id}/bids`)
                      }
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      View Bids
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center">
                    Collector information will be available once the listing is
                    sold.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
