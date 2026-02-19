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
    <div className="h-full overflow-y-auto bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="pt-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome back, {user?.firstName || "Collector"}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's what's happening with your collections today
          </p>
        </div>

        {/* Live Tracking Toggle */}
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-200 ${
            isLiveTracking
              ? "bg-emerald-500/5 border-emerald-500/25"
              : "bg-gray-900 border-gray-800"
          }`}
        >
          <div className="flex-1">
            <h3 className="text-white font-semibold flex items-center gap-2 text-sm mb-0.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${isLiveTracking ? "bg-emerald-500 animate-pulse" : "bg-gray-600"}`}
              ></span>
              Live Vehicle Tracking
            </h3>
            <p className="text-xs text-gray-500 ml-[18px]">
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
              <p className="text-xs text-red-400 mt-1 ml-[18px]">⚠️ {geoError}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-gray-900 rounded-2xl p-5 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} bg-opacity-20 p-2.5 rounded-xl`}>
                    <Icon className="text-white" size={18} />
                  </div>
                </div>
                <h3 className="text-gray-500 text-xs font-semibold tracking-wider uppercase mb-1.5">{stat.label}</h3>
                <p className="text-3xl font-bold text-white tabular-nums mb-1.5">
                  {stat.value}
                </p>
                <p className="text-emerald-400 text-xs font-medium">{stat.change}</p>
              </div>
            );
          })}
        </div>

        {/* Active Bids & Recent Wins */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Active Bids */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800/80">
              <h2 className="text-white font-semibold text-sm">Active Bids</h2>
              <span className="text-xs text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full">
                {activeBids.length} active
              </span>
            </div>
            <div className="p-3 space-y-2">
              {activeBids.length === 0 ? (
                <div className="text-center py-10">
                  <Hammer className="mx-auto text-gray-700 mb-3" size={36} />
                  <p className="text-gray-500 text-sm">No active bids</p>
                </div>
              ) : (
                activeBids.slice(0, 3).map((bid: any) => (
                  <div
                    key={bid._id}
                    className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-xl cursor-pointer transition-colors"
                    onClick={() =>
                      navigate(`/collector/auctions/${bid.listingId._id}`)
                    }
                  >
                    <img
                      src={bid.listingId?.primaryImage}
                      alt={bid.listingId?.title}
                      className="w-11 h-11 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm truncate">
                        {bid.listingId?.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                        <MapPin size={10} />
                        <span>
                          {bid.collectorInfo?.distance.toFixed(1)} km away
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-emerald-400 font-bold text-sm">
                        {formatCurrency(bid.amount, user?.currency)}
                      </p>
                      <p className="text-gray-600 text-xs">Your bid</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Wins - NOW CLICKABLE */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800/80">
              <h2 className="text-white font-semibold text-sm">Recent Wins</h2>
              <span className="text-xs text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full">
                {wonBids.length} won
              </span>
            </div>
            <div className="p-3 space-y-2">
              {wonBids.length === 0 ? (
                <div className="text-center py-10">
                  <Award className="mx-auto text-gray-700 mb-3" size={36} />
                  <p className="text-gray-500 text-sm">No won auctions yet</p>
                </div>
              ) : (
                wonBids.slice(0, 3).map((bid: any) => (
                  <div
                    key={bid._id}
                    className="bg-gray-800/50 hover:bg-gray-800 rounded-xl p-3.5 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={bid.listingId?.primaryImage}
                        alt={bid.listingId?.title}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm truncate mb-1">
                          {bid.listingId?.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Won {new Date(bid.respondedAt).toLocaleDateString()}
                          </span>
                          <span className="text-emerald-400 font-bold text-sm">
                            {formatCurrency(bid.amount, user?.currency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Seller Contact Info */}
                    {bid.listingId?.sellerId && (
                      <div className="border-t border-gray-700/60 pt-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <User size={12} className="text-gray-600" />
                          <span>
                            {bid.listingId.sellerId.firstName}{" "}
                            {bid.listingId.sellerId.lastName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={12} className="text-gray-600" />
                          <a
                            href={`tel:${bid.listingId.sellerId.phoneNumber}`}
                            className="text-emerald-400 hover:text-emerald-300 text-xs transition-colors"
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
                          className="w-full mt-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Eye size={12} />
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