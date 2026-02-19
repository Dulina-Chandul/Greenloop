import { useAppSelector } from "@/redux/hooks/hooks";
import { selectUser } from "@/redux/slices/authSlice";
import { Link, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  DollarSign,
  Plus,
  Sparkles,
  Play,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { formatCurrency } from "@/config/currency";
import { sellerListingAPI } from "@/apiservices/seller/sellerAPI";

//* Status
const STATUS_CONFIG = {
  active: {
    label: "BIDDING LIVE",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    icon: Clock,
    dotColor: "bg-emerald-400",
  },
  sold: {
    label: "SOLD",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    icon: CheckCircle2,
    dotColor: "bg-blue-400",
  },
  bidding_closed: {
    label: "PENDING PICKUP",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    icon: AlertCircle,
    dotColor: "bg-amber-400",
  },
  draft: {
    label: "ANALYZING",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    icon: Sparkles,
    dotColor: "bg-purple-400",
  },
  cancelled: {
    label: "CANCELLED",
    color: "bg-red-500/10 text-red-400 border-red-500/30",
    icon: XCircle,
    dotColor: "bg-red-400",
  },
  expired: {
    label: "EXPIRED",
    color: "bg-gray-500/10 text-gray-400 border-gray-500/30",
    icon: XCircle,
    dotColor: "bg-gray-400",
  },
};

export default function SellerDashboard() {
  const user = useAppSelector(selectUser);
  const navigate = useNavigate();

  const { data: listingsData } = useQuery({
    queryKey: ["seller-listings"],
    queryFn: sellerListingAPI,
  });

  const listings = listingsData || [];
  const activeListings = listings.filter(
    (list: any) => list.status === "active",
  );
  const totalEarnings = listings
    .filter((list: any) => list.status === "sold")
    .reduce((sum: number, list: any) => sum + (list.currentHighestBid || 0), 0);

  const getStatusBadge = (status: string) => {
    const config =
      STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ||
      STATUS_CONFIG.draft;

    return (
      <span
        className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider border ${config.color} flex items-center gap-1.5 w-fit uppercase`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${config.dotColor} ${status === "active" ? "animate-pulse" : ""}`}
        />
        {config.label}
      </span>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-gray-800/60">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1920"
            alt="Background"
            className="w-full h-full object-cover opacity-[0.07]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/95 to-gray-950/80" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-10">
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold tracking-widest border border-emerald-500/20 flex items-center gap-1.5 uppercase">
                <Sparkles size={11} />
                AI POWERED
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Turn Waste Into{" "}
              <span className="text-emerald-400">Cash</span>
            </h1>
            <p className="text-gray-400 max-w-xl text-sm leading-relaxed">
              Use our advanced AI to identify recyclables instantly from your
              camera. Get accurate pricing estimates and list items in seconds.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate("/seller/create-listing")}
              className="bg-emerald-600 hover:bg-emerald-500 h-11 px-6 text-sm font-semibold rounded-xl shadow-lg shadow-emerald-900/40 transition-all"
            >
              <Plus className="mr-1.5" size={16} />
              Create New Listing
            </Button>
            <Button
              variant="outline"
              className="h-11 px-6 text-sm border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-800 hover:text-white rounded-xl transition-all"
            >
              <Play className="mr-1.5" size={15} />
              Watch Tutorial
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-7 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 hover:border-blue-500/30 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/10 p-2.5 rounded-xl">
                <Eye className="text-blue-400" size={18} />
              </div>
              {/* // TODO : Change the updated time later */}
            </div>
            <p className="text-gray-500 text-xs font-semibold tracking-wider uppercase mb-1.5">Active Listings</p>
            <p className="text-4xl font-bold text-white tabular-nums">
              {activeListings.length}
            </p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 hover:border-orange-500/30 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-500/10 p-2.5 rounded-xl">
                <Package className="text-orange-400" size={18} />
              </div>
              {/* // TODO : Change this later */}
            </div>
            <p className="text-gray-500 text-xs font-semibold tracking-wider uppercase mb-1.5">Pending Bids</p>
            <p className="text-4xl font-bold text-white tabular-nums">
              {activeListings.reduce(
                (sum: number, list: any) => sum + (list.totalBids || 0),
                0,
              )}
            </p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 hover:border-emerald-500/30 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-500/10 p-2.5 rounded-xl">
                <DollarSign className="text-emerald-400" size={18} />
              </div>
              {/* // TODO : Change the percentage later */}
            </div>
            <p className="text-gray-500 text-xs font-semibold tracking-wider uppercase mb-1.5">Total Earnings</p>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(totalEarnings, user?.currency)}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/80">
            <h2 className="text-white font-semibold">Recent Activity</h2>
            <Link
              to="/seller/listings"
              className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              View All →
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="p-14 text-center">
              <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="text-gray-600" size={26} />
              </div>
              <h3 className="text-white font-semibold mb-1.5">
                No listings yet
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Create your first listing to start selling recyclables
              </p>
              <Button
                onClick={() => navigate("/seller/create-listing")}
                className="bg-emerald-600 hover:bg-emerald-500 rounded-xl h-10 px-5 text-sm"
              >
                <Plus className="mr-1.5" size={15} />
                Create Your First Listing
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800/60">
                    <th className="text-left px-6 py-3 text-gray-500 text-xs font-semibold tracking-wider uppercase">
                      Item Name
                    </th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-semibold tracking-wider uppercase">
                      Category
                    </th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-semibold tracking-wider uppercase">
                      Date Listed
                    </th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-semibold tracking-wider uppercase">
                      Status
                    </th>
                    <th className="text-right px-6 py-3 text-gray-500 text-xs font-semibold tracking-wider uppercase">
                      Current Bid/Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {listings.slice(0, 5).map((listing: any) => (
                    <tr
                      key={listing._id}
                      className="hover:bg-gray-800/40 transition-colors cursor-pointer"
                      onClick={() => {
                        if (
                          listing.status === "sold" ||
                          listing.status === "bidding_closed"
                        ) {
                          navigate(`/seller/listing/${listing._id}`);
                        } else {
                          // TODO : Nothing happens change the URL
                          navigate(`/seller/listing/${listing._id}/bids`);
                        }
                      }}
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={listing.primaryImage}
                            alt={listing.title}
                            className="w-11 h-11 rounded-xl object-cover"
                          />
                          <div>
                            <p className="text-white text-sm font-medium">
                              {listing.title}
                            </p>
                            <p className="text-gray-500 text-xs mt-0.5">
                              {listing.finalWeight} kg
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="bg-gray-800 text-gray-300 border border-gray-700 px-2.5 py-1 rounded-lg text-xs capitalize font-medium">
                          {listing.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 text-sm">
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5">{getStatusBadge(listing.status)}</td>
                      <td className="px-6 py-3.5 text-right">
                        <p className="font-semibold text-white text-sm">
                          {formatCurrency(
                            listing.currentHighestBid ||
                              listing.finalValue ||
                              0,
                            user?.currency,
                          )}
                        </p>
                        <p className="text-gray-600 text-xs mt-0.5">
                          {listing.status === "sold"
                            ? "Final Price"
                            : "Est. Value"}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}