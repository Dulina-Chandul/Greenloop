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
  Clock,
} from "lucide-react";
import { getMyBidsAPI } from "@/apiservices/bid/bidAPI";

export default function CollectorDashboard() {
  const user = useAppSelector(selectUser);
  const navigate = useNavigate();

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
