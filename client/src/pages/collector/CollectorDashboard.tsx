import { useAppSelector } from "@/redux/hooks/hooks";
import { selectUser } from "@/redux/slices/authSlice";
import { DollarSign, Package, TrendingUp, Award } from "lucide-react";

export default function CollectorDashboard() {
  const user = useAppSelector(selectUser);

  const stats = [
    {
      label: "Active Bids",
      value: "3",
      icon: Package,
      color: "bg-blue-500",
      change: "+2 from yesterday",
    },
    {
      label: "Total Collections",
      value: "47",
      icon: TrendingUp,
      color: "bg-green-500",
      change: "+12% this month",
    },
    {
      label: "Total Earnings",
      value: "Rs. 245,000",
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

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Bids */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Active Bids</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg"
                >
                  <div className="w-12 h-12 bg-gray-600 rounded"></div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-sm">
                      Metal Scrap Collection
                    </h3>
                    <p className="text-gray-400 text-xs">
                      Dehiwala • 2.5 km away
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-semibold">Rs. 8,500</p>
                    <p className="text-gray-400 text-xs">Your bid</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Collections */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              Recent Collections
            </h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg"
                >
                  <div className="w-12 h-12 bg-gray-600 rounded"></div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-sm">
                      Plastic Bottles - 25kg
                    </h3>
                    <p className="text-gray-400 text-xs">
                      Completed 2 days ago
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">Rs. 12,500</p>
                    <span className="text-xs text-green-400">Paid</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
