import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/redux/hooks/hooks";
import { selectUser } from "@/redux/slices/authSlice";
import {
  TrendingUp,
  Package,
  DollarSign,
  Award,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import axiosInstance from "@/config/api/axiosInstance";
import { formatCurrency } from "@/config/currency";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  plastic: "#10b981",
  metal: "#3b82f6",
  paper: "#f59e0b",
  glass: "#8b5cf6",
  electronic: "#ef4444",
  mixed: "#6b7280",
};

const STATUS_COLORS = {
  active: "#10b981",
  sold: "#3b82f6",
  bidding_closed: "#f59e0b",
  expired: "#6b7280",
  cancelled: "#ef4444",
};

export default function SellerAnalytics() {
  const user = useAppSelector(selectUser);

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["seller-analytics"],
    queryFn: async () => {
      const response = await axiosInstance.get("/analytics/seller");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900">
        <div className="text-white">Loading analytics...</div>
      </div>
    );
  }

  const {
    stats,
    rating,
    listingsByCategory,
    listingsByStatus,
    monthlyEarnings,
    topListings,
  } = analyticsData || {};

  // Format monthly data for charts
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const earningsChartData =
    monthlyEarnings?.map((item: any) => ({
      month: monthNames[item._id.month - 1],
      earnings: item.earnings,
      transactions: item.count,
    })) || [];

  // Calculate trends
  const earningsTrend =
    monthlyEarnings?.length >= 2
      ? ((monthlyEarnings[monthlyEarnings.length - 1].earnings -
          monthlyEarnings[monthlyEarnings.length - 2].earnings) /
          monthlyEarnings[monthlyEarnings.length - 2].earnings) *
        100
      : 0;

  return (
    <div className="h-full overflow-y-auto bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-400">
            Track your selling performance and insights
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <DollarSign className="text-green-400" size={24} />
              </div>
              {earningsTrend !== 0 && (
                <div
                  className={`flex items-center gap-1 text-sm ${earningsTrend > 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {earningsTrend > 0 ? (
                    <ArrowUpRight size={16} />
                  ) : (
                    <ArrowDownRight size={16} />
                  )}
                  {Math.abs(earningsTrend).toFixed(1)}%
                </div>
              )}
            </div>
            <p className="text-sm text-gray-400 mb-1">Total Earnings</p>
            <p className="text-2xl md:text-3xl font-bold text-white">
              {formatCurrency(stats?.totalEarnings || 0, user?.currency)}
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Package className="text-blue-400" size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">Total Listings</p>
            <p className="text-2xl md:text-3xl font-bold text-white">
              {stats?.totalListings || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.activeListings || 0} active
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <TrendingUp className="text-purple-400" size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">Completed Sales</p>
            <p className="text-2xl md:text-3xl font-bold text-white">
              {stats?.completedTransactions || 0}
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Award className="text-yellow-400" size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">Rating</p>
            <p className="text-2xl md:text-3xl font-bold text-white">
              ★ {rating?.average?.toFixed(1) || "N/A"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {rating?.totalReviews || 0} reviews
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Earnings Trend */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Earnings Trend (Last 6 Months)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={earningsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Earnings (LKR)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Listings by Category */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Listings by Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={listingsByCategory?.map((item: any) => ({
                    name: item._id,
                    value: item.count,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {listingsByCategory?.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        COLORS[entry._id as keyof typeof COLORS] || "#6b7280"
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Listings by Status */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            Listings by Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={listingsByStatus?.map((item: any) => ({
                status: item._id,
                count: item.count,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="status" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                }}
                labelStyle={{ color: "#fff" }}
              />
              <Bar dataKey="count" fill="#10b981">
                {listingsByStatus?.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      STATUS_COLORS[entry._id as keyof typeof STATUS_COLORS] ||
                      "#6b7280"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performing Listings */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Top Performing Listings
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-left border-b border-gray-700">
                <tr>
                  <th className="pb-3 text-sm font-medium text-gray-400">
                    Title
                  </th>
                  <th className="pb-3 text-sm font-medium text-gray-400">
                    Category
                  </th>
                  <th className="pb-3 text-sm font-medium text-gray-400 text-right">
                    Highest Bid
                  </th>
                  <th className="pb-3 text-sm font-medium text-gray-400 text-right">
                    Total Bids
                  </th>
                </tr>
              </thead>
              <tbody>
                {topListings?.map((listing: any) => (
                  <tr key={listing._id} className="border-b border-gray-700/50">
                    <td className="py-3 text-white">{listing.title}</td>
                    <td className="py-3">
                      <span
                        className="px-2 py-1 rounded-full text-xs capitalize"
                        style={{
                          backgroundColor:
                            COLORS[listing.category as keyof typeof COLORS] +
                            "20",
                          color:
                            COLORS[listing.category as keyof typeof COLORS],
                        }}
                      >
                        {listing.category}
                      </span>
                    </td>
                    <td className="py-3 text-right text-green-400 font-semibold">
                      {formatCurrency(
                        listing.currentHighestBid || 0,
                        user?.currency,
                      )}
                    </td>
                    <td className="py-3 text-right text-gray-300">
                      {listing.totalBids}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
