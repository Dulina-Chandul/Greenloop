import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/redux/hooks/hooks";
import { selectUser } from "@/redux/slices/authSlice";
import { 
  Gavel, 
  Package, 
  DollarSign, 
  Award,
  TrendingDown
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
  ResponsiveContainer
} from "recharts";

const MATERIAL_COLORS = {
  plastic: "#10b981",
  metal: "#3b82f6",
  paper: "#f59e0b",
  glass: "#8b5cf6",
  electronic: "#ef4444",
  mixed: "#6b7280"
};

const BID_STATUS_COLORS = {
  pending: "#f59e0b",
  accepted: "#10b981",
  rejected: "#ef4444",
  withdrawn: "#6b7280"
};

export default function CollectorAnalytics() {
  const user = useAppSelector(selectUser);

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["collector-analytics"],
    queryFn: async () => {
      const response = await axiosInstance.get("/analytics/collector");
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900">
        <div className="text-white">Loading analytics...</div>
      </div>
    );
  }

  const { stats, rating, bidsByStatus, monthlySpending, materialBreakdown, recentWins } = analyticsData || {};

  // Format monthly data
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const spendingChartData = monthlySpending?.map((item: any) => ({
    month: monthNames[item._id.month - 1],
    spending: item.spending,
    collections: item.count
  })) || [];

  return (
    <div className="h-full overflow-y-auto bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Track your collection performance and spending</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <DollarSign className="text-blue-400" size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">Total Spent</p>
            <p className="text-2xl md:text-3xl font-bold text-white">{formatCurrency(stats?.totalSpent || 0, user?.currency)}</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Gavel className="text-green-400" size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">Total Bids</p>
            <p className="text-2xl md:text-3xl font-bold text-white">{stats?.totalBids || 0}</p>
            <p className="text-xs text-gray-500 mt-1">{stats?.acceptedBids || 0} won</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Package className="text-purple-400" size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">Waste Collected</p>
            <p className="text-2xl md:text-3xl font-bold text-white">{stats?.totalWasteCollected || 0} kg</p>
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
            <p className="text-xs text-gray-500 mt-1">{rating?.totalReviews || 0} reviews</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Spending Trend */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Spending Trend (Last 6 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={spendingChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="spending" stroke="#3b82f6" strokeWidth={2} name="Spending (LKR)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bids by Status */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Bids by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bidsByStatus?.map((item: any) => ({
                    name: item._id,
                    value: item.count
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {bidsByStatus?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={BID_STATUS_COLORS[entry._id as keyof typeof BID_STATUS_COLORS] || "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Material Collection Breakdown */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Material Collection Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={materialBreakdown?.map((item: any) => ({
              category: item._id,
              weight: item.weight,
              spent: item.spent
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="category" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="weight" fill="#10b981" name="Weight (kg)">
                {materialBreakdown?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={MATERIAL_COLORS[entry._id as keyof typeof MATERIAL_COLORS] || "#6b7280"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Wins */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Wins</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentWins?.map((bid: any) => (
              <div key={bid._id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <img 
                  src={bid.listingId?.primaryImage} 
                  alt={bid.listingId?.title}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h4 className="text-white font-semibold mb-1 line-clamp-1">{bid.listingId?.title}</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">{bid.listingId?.finalWeight} kg</span>
                  <span className="text-green-400 font-semibold">{formatCurrency(bid.amount, user?.currency)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}