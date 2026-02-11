import { useAppSelector } from "@/redux/hooks/hooks";
import { selectUser } from "@/redux/slices/authSlice";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import {
  DollarSign,
  Package,
  TrendingUp,
  Award,
  Hammer,
  MapPin,
  Eye,
  Phone,
  User,
} from "lucide-react";
import { getMyBidsAPI } from "@/apiservices/bid/bidAPI";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import useGeolocation from "@/hooks/useGeolocation";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/config/currency";

export default function CollectorDashboard() {
  const user = useAppSelector(selectUser);
  const navigate = useNavigate();
  const [isLiveTracking, setIsLiveTracking] = useState(() => {
    const saved = localStorage.getItem("isLiveTracking");
    return saved === "true";
  });
  const socketRef = useRef<Socket | null>(null);
  const [manualLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [useManualLocation] = useState(false);

  // Persist live tracking state
  useEffect(() => {
    localStorage.setItem("isLiveTracking", isLiveTracking.toString());
  }, [isLiveTracking]);

  // Use high-accuracy geolocation for vehicle tracking
  const { location, error: geoError } = useGeolocation(isLiveTracking, {
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 0,
  });

  // Get effective location (manual override or GPS)
  const effectiveLocation =
    useManualLocation && manualLocation
      ? manualLocation
      : location
        ? { lat: location.latitude, lng: location.longitude }
        : null;

  // Socket connection for live tracking
  useEffect(() => {
    if (isLiveTracking) {
      const socketUrl = import.meta.env.VITE_API_URL.replace(
        /\/api\/v1\/?$/,
        "",
      );

      socketRef.current = io(socketUrl, {
        withCredentials: true,
      });

      socketRef.current.emit("collector:join", {
        collectorId: user?._id,
        location: effectiveLocation || null,
      });

      console.log("Collector socket connected for live tracking");

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [isLiveTracking, user?._id]);

  // Emit location updates when position changes
  useEffect(() => {
    if (isLiveTracking && effectiveLocation && socketRef.current) {
      console.log("Broadcasting collector location:", effectiveLocation);
      socketRef.current.emit("collector:location_update", {
        collectorId: user?._id,
        location: {
          lat: effectiveLocation.lat,
          lng: effectiveLocation.lng,
          heading: location?.heading || null,
          speed: location?.speed || null,
          accuracy: useManualLocation ? 0 : location?.accuracy || 999,
          timestamp: location?.timestamp || Date.now(),
        },
      });
    }
  }, [
    isLiveTracking,
    effectiveLocation,
    location,
    user?._id,
    useManualLocation,
  ]);

  // Clear location cache on mount for better accuracy
  useEffect(() => {
    if ("geolocation" in navigator) {
      try {
        navigator.permissions
          ?.query({ name: "geolocation" as PermissionName })
          .then((result) => {
            console.log("Geolocation permission status:", result.state);
          });
      } catch (e) {
        console.log("Permission query not supported");
      }
    }
  }, []);

  // Fetch my bids
  const { data: bidsData } = useQuery({
    queryKey: ["my-bids"],
    queryFn: () => getMyBidsAPI(),
  });

  const bids = bidsData?.data?.bids || [];
  const activeBids = bids.filter((b: any) => b.status === "pending");
  const wonBids = bids.filter((b: any) => b.status === "accepted");

  const stats = [
    {
      label: "Active Bids",
      value: activeBids.length.toString(),
      icon: Package,
      color: "bg-blue-500",
      change:
        activeBids.length > 0
          ? `${activeBids.length} pending`
          : "No active bids",
    },
    {
      label: "Won Auctions",
      value: wonBids.length.toString(),
      icon: TrendingUp,
      color: "bg-green-500",
      change: "",
    },
    {
      label: "Total Spent",
      value: formatCurrency(
        bids.reduce(
          (sum: number, b: any) =>
            b.status === "accepted" ? sum + b.amount : sum,
          0,
        ),
        user?.currency,
      ),
      icon: DollarSign,
      color: "bg-purple-500",
      change: "",
    },
    {
      label: "Rating",
      value: user?.rating?.average?.toFixed(1) || "N/A",
      icon: Award,
      color: "bg-yellow-500",
      change: user?.rating?.totalReviews
        ? `${user.rating.totalReviews} reviews`
        : "No reviews yet",
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.firstName || "Collector"}! 👋
          </h1>
          <p className="text-gray-400">
            Here's what's happening with your collections today
          </p>
        </div>

        {/* Live Tracking Toggle */}
        <div className="mb-6 bg-gray-800 p-5 rounded-lg border border-gray-700 flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-1">
              <span
                className={`w-3 h-3 rounded-full ${isLiveTracking ? "bg-green-500 animate-pulse" : "bg-gray-500"}`}
              ></span>
              Live Vehicle Tracking
            </h3>
            <p className="text-sm text-gray-400">
              Share your real-time location while collecting scrap
            </p>
            {/* {location && isLiveTracking && (
              <div className="mt-2 text-xs text-green-400 flex items-center gap-3">
                <span>
                  📍 {location.latitude.toFixed(6)},{" "}
                  {location.longitude.toFixed(6)}
                </span>
                {location.speed && (
                  <span>🚗 {(location.speed * 3.6).toFixed(1)} km/h</span>
                )}
                {location.accuracy && (
                  <span>🎯 ±{location.accuracy.toFixed(0)}m</span>
                )}
              </div>
            )} */}
            {geoError && (
              <p className="text-xs text-red-400 mt-1">⚠️ {geoError}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="live-tracking"
              checked={isLiveTracking}
              onCheckedChange={setIsLiveTracking}
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
                <h3 className="text-gray-400 text-sm mb-1">{stat.label}</h3>
                <p className="text-3xl font-bold text-white mb-2">
                  {stat.value}
                </p>
                <p className="text-green-400 text-sm">{stat.change}</p>
              </div>
            );
          })}
        </div>

        {/* Active Bids & Recent Wins */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Bids */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Active Bids</h2>
              <span className="text-sm text-gray-400">
                {activeBids.length} active
              </span>
            </div>
            <div className="space-y-3">
              {activeBids.length === 0 ? (
                <div className="text-center py-8">
                  <Hammer className="mx-auto text-gray-600 mb-2" size={48} />
                  <p className="text-gray-400 text-sm">No active bids</p>
                </div>
              ) : (
                activeBids.slice(0, 3).map((bid: any) => (
                  <div
                    key={bid._id}
                    className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600"
                    onClick={() =>
                      navigate(`/collector/auctions/${bid.listingId._id}`)
                    }
                  >
                    <img
                      src={bid.listingId?.primaryImage}
                      alt={bid.listingId?.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm truncate">
                        {bid.listingId?.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <MapPin size={12} />
                        <span>
                          {bid.collectorInfo?.distance.toFixed(1)} km away
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-semibold">
                        {formatCurrency(bid.amount, user?.currency)}
                      </p>
                      <p className="text-gray-400 text-xs">Your bid</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Wins - NOW CLICKABLE */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Recent Wins</h2>
              <span className="text-sm text-gray-400">
                {wonBids.length} won
              </span>
            </div>
            <div className="space-y-3">
              {wonBids.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="mx-auto text-gray-600 mb-2" size={48} />
                  <p className="text-gray-400 text-sm">No won auctions yet</p>
                </div>
              ) : (
                wonBids.slice(0, 3).map((bid: any) => (
                  <div
                    key={bid._id}
                    className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <img
                        src={bid.listingId?.primaryImage}
                        alt={bid.listingId?.title}
                        className="w-16 h-16 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm truncate mb-1">
                          {bid.listingId?.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            Won {new Date(bid.respondedAt).toLocaleDateString()}
                          </span>
                          <span className="text-green-400 font-bold">
                            {formatCurrency(bid.amount, user?.currency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Seller Contact Info */}
                    {bid.listingId?.sellerId && (
                      <div className="border-t border-gray-600 pt-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <User size={14} className="text-gray-400" />
                          <span>
                            {bid.listingId.sellerId.firstName}{" "}
                            {bid.listingId.sellerId.lastName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-gray-400" />
                          <a
                            href={`tel:${bid.listingId.sellerId.phoneNumber}`}
                            className="text-green-400 hover:text-green-300 text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {bid.listingId.sellerId.phoneNumber}
                          </a>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/collector/auctions/${bid.listingId._id}`,
                            );
                          }}
                          className="w-full mt-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye size={14} />
                          View Full Details
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
