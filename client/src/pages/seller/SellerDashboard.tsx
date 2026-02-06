import { useAppSelector } from "@/redux/hooks/hooks";
import { selectUser } from "@/redux/slices/authSlice";
import { Link, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  TrendingUp,
  DollarSign,
  Plus,
  Sparkles,
  Play,
  BarChart3,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/config/api/axiosInstance";

export default function SellerDashboard() {
  const user = useAppSelector(selectUser);
  const navigate = useNavigate();

  // Fetch listings
  const { data: listingsData } = useQuery({
    queryKey: ["seller-listings"],
    queryFn: async () => {
      const response = await axiosInstance.get("/seller/listings");
      return response.data.listings;
    },
  });

  const listings = listingsData || [];
  const activeListings = listings.filter((l: any) => l.status === "active");
  const totalEarnings = listings
    .filter((l: any) => l.status === "sold")
    .reduce((sum: number, l: any) => sum + (l.currentHighestBid || 0), 0);

  return (
    <div className="h-full overflow-y-auto bg-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-gray-900 border-b border-gray-700">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1920"
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold border border-green-500 flex items-center gap-1">
                <Sparkles size={14} />
                AI POWERED
              </span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Turn Waste Into <span className="text-green-400">Cash</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl">
              Use our advanced AI to identify recyclables instantly from your
              camera. Get accurate pricing estimates and list items in seconds.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => navigate("/seller/analysis")}
              className="bg-green-600 hover:bg-green-700 h-14 px-8 text-lg"
            >
              <BarChart3 className="mr-2" size={20} />
              Scan Waste with AI
            </Button>
            <Button
              onClick={() => navigate("/seller/create-listing")}
              variant="outline"
              className="h-14 px-8 text-lg border-gray-600 hover:bg-gray-800"
            >
              <Play className="mr-2" size={20} />
              Watch Tutorial
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Eye className="text-blue-400" size={24} />
              </div>
              <span className="text-xs text-gray-400">Updated 2m ago</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Active Listings</h3>
            <p className="text-4xl font-bold text-white">
              {activeListings.length}
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-500/20 p-3 rounded-lg">
                <Package className="text-orange-400" size={24} />
              </div>
              <span className="text-xs text-red-400">Action required</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Pending Bids</h3>
            <p className="text-4xl font-bold text-white">
              {activeListings.reduce(
                (sum: number, l: any) => sum + (l.totalBids || 0),
                0,
              )}
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <DollarSign className="text-green-400" size={24} />
              </div>
              <span className="text-xs text-green-400 flex items-center gap-1">
                <TrendingUp size={12} />
                +12%
              </span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Total Earnings</h3>
            <p className="text-4xl font-bold text-white">
              ${totalEarnings.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            <Link
              to="/seller/listings"
              className="text-green-400 hover:text-green-300 text-sm font-medium"
            >
              View All →
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No listings yet
              </h3>
              <p className="text-gray-400 mb-6">
                Create your first listing to start selling recyclables
              </p>
              <Button
                onClick={() => navigate("/seller/create-listing")}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="mr-2" size={18} />
                Create Your First Listing
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Item Name
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Category
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Date Listed
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Status
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-gray-400">
                      Current Bid/Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {listings.slice(0, 5).map((listing: any) => (
                    <tr
                      key={listing._id}
                      className="hover:bg-gray-700/30 transition-colors cursor-pointer"
                      onClick={() =>
                        navigate(`/seller/listing/${listing._id}/bids`)
                      }
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={listing.primaryImage}
                            alt={listing.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div>
                            <p className="text-white font-medium">
                              {listing.title}
                            </p>
                            <p className="text-gray-400 text-xs">
                              Batch #{listing._id.slice(-4)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                          {listing.category}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-sm">
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            listing.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-gray-700 text-gray-400"
                          }`}
                        >
                          {listing.status === "active"
                            ? "Bidding Live"
                            : listing.status}
                        </span>
                      </td>
                      <td className="p-4 text-right text-white font-semibold">
                        $
                        {(
                          listing.currentHighestBid ||
                          listing.finalValue ||
                          0
                        ).toFixed(2)}
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
