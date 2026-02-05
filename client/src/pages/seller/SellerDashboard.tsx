import { useAppSelector } from "@/redux/hooks/hooks";
import { selectUser } from "@/redux/slices/authSlice";
import { Link } from "react-router";
import { Package, TrendingUp, DollarSign, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SellerDashboard() {
  const user = useAppSelector(selectUser);

  const stats = [
    {
      label: "Total Listings",
      value: "0",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      label: "Active Listings",
      value: "0",
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      label: "Total Earnings",
      value: "Rs. 0",
      icon: DollarSign,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome, {user?.firstName || "Seller"}! 👋
          </h1>
          <p className="text-gray-400">
            Start creating listings to connect with collectors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <div className={`${stat.color} p-3 rounded-lg w-fit mb-4`}>
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="text-gray-400 text-sm mb-1">{stat.label}</h3>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            No listings yet
          </h2>
          <p className="text-gray-400 mb-6">
            Create your first listing to start selling your recyclables
          </p>
          <Link to="/seller/create-listing">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Listing
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
