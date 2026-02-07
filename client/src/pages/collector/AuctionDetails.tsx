import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Hammer,
  TrendingUp,
  MapPin,
  Clock,
  Package,
  Scale,
  User,
  X,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/config/api/axiosInstance";
import { createBidAPI, getListingBidsAPI } from "@/apiservices/bid/bidAPI";
import { io, Socket } from "socket.io-client";
import { useAppSelector } from "@/redux/hooks/hooks";
import { selectUser } from "@/redux/slices/authSlice";

import { useLocation } from "react-router";

export default function AuctionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const user = useAppSelector(selectUser);

  const [bidAmount, setBidAmount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);

  // Fetch listing details
  const { data: listingData, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/listings/${id}`);
      return response.data.listing;
    },
    enabled: !!id,
  });

  // Fetch bids
  const { data: bidsData } = useQuery({
    queryKey: ["listing-bids", id],
    queryFn: () => getListingBidsAPI(id!),
    enabled: !!id,
  });

  const listing = listingData;
  const bids = bidsData?.data?.bids || [];

  // Place bid mutation
  const { mutate: placeBid, isPending } = useMutation({
    mutationFn: createBidAPI,
    onSuccess: () => {
      setToastMessage("Bid placed successfully!");
      setShowToast(true);
      setBidAmount(0);
      queryClient.invalidateQueries({ queryKey: ["listing", id] });
      queryClient.invalidateQueries({ queryKey: ["listing-bids", id] });
      setTimeout(() => setShowToast(false), 3000);
    },
    onError: (error: any) => {
      setToastMessage(error?.message || "Failed to place bid");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
  });

  // Socket setup
  useEffect(() => {
    if (!id) return;

    const socketUrl = import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, "");
    const newSocket = io(socketUrl, { withCredentials: true });
    setSocket(newSocket);

    newSocket.on("listing:updated", (data) => {
      if (data.listingId === id) {
        queryClient.invalidateQueries({ queryKey: ["listing", id] });
        queryClient.invalidateQueries({ queryKey: ["listing-bids", id] });
      }
    });

    newSocket.on("bid:new", (data) => {
      if (data.listingId === id) {
        queryClient.invalidateQueries({ queryKey: ["listing-bids", id] });
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [id, queryClient]);

  // Update bid mutation
  const { mutate: updateBid, isPending: isUpdating } = useMutation({
    mutationFn: async (data: { bidId: string; amount: number }) => {
      await axiosInstance.put(`/bids/${data.bidId}`, { amount: data.amount });
    },
    onSuccess: () => {
      setToastMessage("Bid updated successfully!");
      setShowToast(true);
      queryClient.invalidateQueries({ queryKey: ["listing", id] });
      queryClient.invalidateQueries({ queryKey: ["listing-bids", id] });
      setTimeout(() => setShowToast(false), 3000);
    },
    onError: (error: any) => {
      setToastMessage(error?.message || "Failed to update bid");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
  });

  // Withdraw bid mutation
  const { mutate: withdrawBid, isPending: isWithdrawing } = useMutation({
    mutationFn: async (bidId: string) => {
      await axiosInstance.delete(`/bids/${bidId}`);
    },
    onSuccess: () => {
      setToastMessage("Bid withdrawn successfully");
      setShowToast(true);
      queryClient.invalidateQueries({ queryKey: ["listing", id] });
      queryClient.invalidateQueries({ queryKey: ["listing-bids", id] });
      setBidAmount(0); // Reset bid input? Or set to min
      setTimeout(() => setShowToast(false), 3000);
    },
    onError: (error: any) => {
      setToastMessage(error?.message || "Failed to withdraw bid");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
  });

  // Socket setup (omitted for brevity, assume present)
  // ...

  // Set initial bid amount
  useEffect(() => {
    // Check if user has an active bid
    const myBid = bids?.find(
      (b: any) => b.bidderId._id === user?._id && b.status === "pending",
    );

    if (location.state?.initialBid) {
      setBidAmount(location.state.initialBid);
    } else if (myBid) {
      setBidAmount(myBid.amount);
    } else if (listing?.currentHighestBid) {
      setBidAmount(listing.currentHighestBid + 0.5);
    } else if (listing?.minimumBid) {
      setBidAmount(listing.minimumBid);
    } else {
      setBidAmount(listing?.finalValue || 0);
    }
  }, [listing, bids, user, location.state]);

  // Countdown timer effect
  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!listing?.biddingDeadline) {
        setTimeLeft("No Deadline");
        return;
      }
      const now = new Date().getTime();
      const deadline = new Date(listing.biddingDeadline).getTime();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft("Ended");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);

      // Calculate progress
      if (listing.createdAt && listing.biddingDeadline) {
        const totalDuration =
          new Date(listing.biddingDeadline).getTime() -
          new Date(listing.createdAt).getTime();
        const elapsed = now - new Date(listing.createdAt).getTime();
        const calculatedProgress = Math.min(
          100,
          Math.max(0, (elapsed / totalDuration) * 100),
        );
        setProgress(calculatedProgress);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [listing]);

  const handlePlaceBid = async () => {
    if (!id) return;

    const myBid = bids?.find(
      (b: any) => b.bidderId._id === user?._id && b.status === "pending",
    );

    if (bidAmount <= (listing?.currentHighestBid || 0) && !myBid) {
      // Allow updating to same amount? No, must be higher usually unless just updating time/msg. But logic says new bid > current highest?
      // Actually if I am highest bidder I might want to increase my bid?
      // Or if I am outbid.
      // Let's stick to standard: amount > currentHighestBid
      setToastMessage("Bid must be higher than current highest bid");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    if (myBid) {
      // Update existing bid
      updateBid({ bidId: myBid._id, amount: bidAmount });
    } else {
      // Place new bid
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            placeBid({
              listingId: id,
              amount: bidAmount,
              hasOwnTransport: true,
              collectorLocation: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
            });
          },
          () => {
            placeBid({
              listingId: id,
              amount: bidAmount,
              hasOwnTransport: true,
              collectorLocation: { lat: 0, lng: 0 }, // Fallback
            });
          },
        );
      } else {
        placeBid({
          listingId: id,
          amount: bidAmount,
          hasOwnTransport: true,
          collectorLocation: { lat: 0, lng: 0 },
        });
      }
    }
  };

  const handleWithdrawBid = () => {
    const myBid = bids?.find(
      (b: any) => b.bidderId._id === user?._id && b.status === "pending",
    );
    if (myBid) {
      if (
        confirm(
          "Are you sure you want to withdraw your bid? This cannot be undone.",
        )
      ) {
        withdrawBid(myBid._id);
      }
    }
  };

  const handleQuickBid = (increment: number) => {
    setBidAmount((prev) => parseFloat((prev + increment).toFixed(2)));
  };

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!listing?.biddingDeadline) return "No deadline set";
    const now = new Date().getTime();
    const deadline = new Date(listing.biddingDeadline).getTime();
    const diff = deadline - now;

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

  if (!listing) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900">
        <div className="text-white">Listing not found</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-900">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            Back to Auctions
          </button>

          <h1 className="text-3xl font-bold text-white mb-2">
            Active Auction Details
          </h1>
          <p className="text-gray-400">
            Review material specifications, analyze seller ratings, and place
            real-time bids to win this listing.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Listing Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
              <div className="relative">
                <img
                  src={listing.primaryImage}
                  alt={listing.title}
                  className="w-full h-96 object-cover"
                />
                {listing.isUrgent && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Clock size={14} />
                    Ends in {getTimeRemaining()}
                  </div>
                )}
              </div>

              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {listing.title}
                </h2>
                <div className="flex items-center gap-2 text-gray-400 mb-4">
                  <MapPin size={16} />
                  <span>
                    {listing.address.city}, {listing.address.district}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <Package size={14} />
                    {listing.category}
                  </span>
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <Scale size={14} />
                    {listing.finalWeight} kg
                  </span>
                </div>

                {/* Seller Info */}
                <div className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg mb-4">
                  <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="text-gray-400" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      Listed by: {listing.sellerId?.firstName}{" "}
                      {listing.sellerId?.lastName}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>
                        ★ {listing.sellerId?.rating?.average.toFixed(1)}
                      </span>
                      <span>•</span>
                      <span>2.5km away</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Description
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {listing.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Bids */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Recent Bids
                </h3>
                <span className="text-sm text-gray-400">
                  {bids.length} total bids
                </span>
              </div>

              <div className="space-y-3">
                {bids.slice(0, 5).map((bid: any, index: number) => (
                  <div
                    key={bid._id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      index === 0
                        ? "bg-green-900/30 border border-green-700"
                        : "bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                        {index === 0 && (
                          <TrendingUp className="text-green-400" size={18} />
                        )}
                        {index !== 0 && (
                          <User className="text-gray-400" size={18} />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {bid.bidderId?._id === user?._id
                            ? "You"
                            : `Bidder ${index + 1}`}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {new Date(bid.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${index === 0 ? "text-green-400 text-lg" : "text-white"}`}
                      >
                        ${bid.amount.toFixed(2)}
                      </p>
                      {index === 0 && (
                        <span className="text-green-400 text-xs">
                          Highest Bid
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Bidding Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 sticky top-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold">
                    New High-Value Listing Nearby!
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gray-700 rounded-lg flex items-center justify-center">
                    <Package className="text-green-400" size={20} />
                  </div>
                  <p className="text-xs text-gray-400 mb-1">MATERIAL</p>
                  <p className="text-white font-semibold text-sm">
                    {listing.category}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gray-700 rounded-lg flex items-center justify-center">
                    <Scale className="text-green-400" size={20} />
                  </div>
                  <p className="text-xs text-gray-400 mb-1">WEIGHT</p>
                  <p className="text-white font-semibold text-sm">
                    {listing.finalWeight} kg
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gray-700 rounded-lg flex items-center justify-center">
                    <MapPin className="text-green-400" size={20} />
                  </div>
                  <p className="text-xs text-gray-400 mb-1">DISTANCE</p>
                  <p className="text-white font-semibold text-sm">2.5 km</p>
                </div>
              </div>

              {/* Current Highest Bid */}
              <div className="bg-gray-700 rounded-lg p-4 mb-6 text-center">
                <p className="text-gray-400 text-sm mb-1">
                  CURRENT HIGHEST BID
                </p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="text-green-400" size={24} />
                  <p className="text-4xl font-bold text-white">
                    ${(listing.currentHighestBid || 0).toFixed(2)}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  +{bids.length} active bidders
                </span>
              </div>

              {/* Winner Display */}
              {(listing.status === "bidding_closed" ||
                listing.status === "sold") &&
              listing.acceptedBuyerId ? (
                <div className="bg-green-900/30 border border-green-500 rounded-lg p-6 mb-6 text-center">
                  <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-green-500">
                    <CheckCircle className="text-green-400" size={32} />
                  </div>
                  <p className="text-green-400 font-bold text-lg mb-1">
                    AUCTION ENDED
                  </p>
                  <p className="text-white text-sm mb-4">
                    Winner:{" "}
                    <span className="font-semibold text-green-300">
                      {listing.acceptedBuyerId.firstName}{" "}
                      {listing.acceptedBuyerId.lastName}
                    </span>
                  </p>
                  <div className="bg-gray-800 rounded p-3 inline-block">
                    <p className="text-xs text-gray-400 uppercase">
                      Winning Bid
                    </p>
                    <p className="text-xl font-bold text-white">
                      $
                      {bids
                        .find((b: any) => b.status === "accepted")
                        ?.amount.toFixed(2) ||
                        listing.currentHighestBid?.toFixed(2)}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Bid Input */}
                  <div className="mb-4">
                    <Input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(parseFloat(e.target.value))}
                      placeholder="Enter your bid"
                      step="0.1"
                      min={(listing.currentHighestBid || 0) + 0.1}
                      className="bg-gray-700 border-green-600 border-2 text-white text-xl h-14 text-center"
                      disabled={listing.status !== "active"}
                    />
                  </div>

                  {/* Place Bid Button */}
                  <Button
                    onClick={handlePlaceBid}
                    disabled={
                      isPending ||
                      bidAmount <= (listing.currentHighestBid || 0) ||
                      listing.status !== "active"
                    }
                    className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg font-semibold"
                  >
                    <Hammer className="mr-2" size={20} />
                    {isPending || isUpdating
                      ? "Processing..."
                      : bids?.find(
                            (b: any) =>
                              b.bidderId._id === user?._id &&
                              b.status === "pending",
                          )
                        ? "Update Bid"
                        : "Place Bid Now"}
                  </Button>

                  <div className="mt-3 flex gap-2 justify-center">
                    {[0.5, 1.0, 5.0, 10.0].map((inc) => (
                      <button
                        key={inc}
                        onClick={() => handleQuickBid(inc)}
                        disabled={listing.status !== "active"}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-green-400 border border-green-500/30 rounded-full text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +${inc}
                      </button>
                    ))}
                  </div>

                  {bids?.find(
                    (b: any) =>
                      b.bidderId._id === user?._id && b.status === "pending",
                  ) && (
                    <Button
                      onClick={handleWithdrawBid}
                      disabled={isWithdrawing || listing.status !== "active"}
                      variant="outline"
                      className="w-full mt-3 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      Withdraw Bid
                    </Button>
                  )}
                </>
              )}

              {/* Timer */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-red-400 text-sm font-semibold">
                    {listing.status === "active"
                      ? "CLOSING SOON"
                      : "AUCTION ENDED"}
                  </span>
                  <span className="text-white text-xl font-bold">
                    {timeLeft}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-linear ${
                      listing.status === "active"
                        ? "bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                        : "bg-gray-500"
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
