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
} from "lucide-react";
import { getMyBidsAPI } from "@/apiservices/bid/bidAPI";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import useGeolocation from "@/hooks/useGeolocation";
import { Switch } from "@/components/ui/switch";

export default function CollectorDashboard() {
  const user = useAppSelector(selectUser);
  const navigate = useNavigate();
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const [manualLocation, setManualLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [useManualLocation, setUseManualLocation] = useState(false);

  // Use high-accuracy geolocation for vehicle tracking
  const { location, error: geoError } = useGeolocation(isLiveTracking, {
    enableHighAccuracy: true,
    timeout: 5000,
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
    // Clear any cached geolocation data
    if ("geolocation" in navigator) {
      try {
        // Force fresh location request
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

  // Manual location refresh function
  const refreshLocation = () => {
    // Toggle tracking to force fresh GPS reading
    if (isLiveTracking) {
      setIsLiveTracking(false);
      setTimeout(() => setIsLiveTracking(true), 100);
    }
  };

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
      change: "+12% this month",
    },
    {
      label: "Total Spent",
      value: `$${bids.reduce((sum: number, b: any) => (b.status === "accepted" ? sum + b.amount : sum), 0).toFixed(2)}`,
      icon: DollarSign,
      color: "bg-purple-500",
      change: "+8% this month",
    },
    {
      label: "Rating",
      value: "4.8",
      icon: Award,
      color: "bg-yellow-500",
      change: "Top 10% collectors",
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
            {location && isLiveTracking && (
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
            )}
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

        {/* Manual Location Adjustment */}
        {isLiveTracking && (
          <div className="mb-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-5 rounded-lg border border-blue-700">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-semibold mb-1">
                  🎯 Manual Location Adjustment
                </h3>
                <p className="text-sm text-gray-300">
                  {useManualLocation
                    ? "Using your custom location"
                    : "GPS inaccurate? Set your exact location"}
                </p>
              </div>
              <button
                onClick={() => {
                  if (useManualLocation) {
                    setUseManualLocation(false);
                    setManualLocation(null);
                  } else if (location) {
                    setManualLocation({
                      lat: location.latitude,
                      lng: location.longitude,
                    });
                    setUseManualLocation(true);
                  }
                }}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  useManualLocation
                    ? "bg-gray-600 hover:bg-gray-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {useManualLocation ? "Use GPS" : "Set Manual"}
              </button>
            </div>

            {useManualLocation && (
              <div className="space-y-3 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-300 mb-1 block">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={manualLocation?.lat || ""}
                      onChange={(e) =>
                        setManualLocation((prev) => ({
                          lat: parseFloat(e.target.value) || 0,
                          lng: prev?.lng || 0,
                        }))
                      }
                      className="w-full p-2 bg-gray-700 text-white rounded text-sm border border-gray-600 focus:border-blue-500 outline-none"
                      placeholder="6.5854"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-300 mb-1 block">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={manualLocation?.lng || ""}
                      onChange={(e) =>
                        setManualLocation((prev) => ({
                          lat: prev?.lat || 0,
                          lng: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full p-2 bg-gray-700 text-white rounded text-sm border border-gray-600 focus:border-blue-500 outline-none"
                      placeholder="79.9607"
                    />
                  </div>
                </div>
                <div className="bg-blue-900/30 p-3 rounded">
                  <p className="text-xs text-blue-300 mb-2">
                    💡 <strong>How to get your exact coordinates:</strong>
                  </p>
                  <ol className="text-xs text-gray-300 space-y-1 ml-4">
                    <li>
                      1. Open{" "}
                      <a
                        href="https://www.google.com/maps"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline"
                      >
                        Google Maps
                      </a>
                    </li>
                    <li>2. Right-click on your exact location</li>
                    <li>3. Click the coordinates to copy them</li>
                    <li>
                      4. Paste them above (latitude first, then longitude)
                    </li>
                  </ol>
                </div>
                {manualLocation && (
                  <div className="text-xs text-green-400">
                    ✅ Broadcasting: {manualLocation.lat.toFixed(6)},{" "}
                    {manualLocation.lng.toFixed(6)}
                  </div>
                )}
              </div>
            )}

            {!useManualLocation && location && location.accuracy > 100 && (
              <div className="mt-3 bg-yellow-900/30 p-3 rounded border border-yellow-700">
                <p className="text-sm text-yellow-300">
                  ⚠️{" "}
                  <strong>
                    GPS Accuracy: ±{location.accuracy.toFixed(0)}m
                  </strong>{" "}
                  - This is very inaccurate!
                </p>
                <p className="text-xs text gray-300 mt-1">
                  Showing {location.latitude.toFixed(6)},{" "}
                  {location.longitude.toFixed(6)}
                </p>
              </div>
            )}
          </div>
        )}

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

        {/* Active Bids & Recent Collections */}
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
                        ${bid.amount.toFixed(2)}
                      </p>
                      <p className="text-gray-400 text-xs">Your bid</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Won Bids */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Recent Wins</h2>
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
                    className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg"
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
                      <p className="text-gray-400 text-xs">
                        Won {new Date(bid.respondedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">
                        ${bid.amount.toFixed(2)}
                      </p>
                      <span className="text-xs text-green-400">Won</span>
                    </div>
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
