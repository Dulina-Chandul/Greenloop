import { useState } from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutGrid,
  Gavel,
  DollarSign,
  Star,
  Settings,
  Menu,
  X,
  FileText,
  TrendingUp,
} from "lucide-react";
import UserMenu from "@/pages/common/UserMenu";

interface CollectorLayoutProps {
  children: React.ReactNode;
}

export default function CollectorLayout({ children }: CollectorLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: LayoutGrid, label: "Overview", path: "/collector/dashboard" },
    { icon: Gavel, label: "Auctions", path: "/collector/auctions" },
    { icon: FileText, label: "My Bids", path: "/collector/my-bids" },
    { icon: DollarSign, label: "Earnings", path: "/collector/earnings" },
    { icon: TrendingUp, label: "Analytics", path: "/collector/analytics" },
    { icon: Settings, label: "Settings", path: "/collector/settings" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 bg-gray-800 border-r border-gray-700 transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {/* User Profile Section */}
        <div className="p-6 border-b border-gray-700">
          <UserMenu />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-green-600 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Pro Tip Section */}
        <div className="p-4 m-4 bg-green-900 border border-green-700 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 bg-green-600 rounded">
              <Star size={16} className="text-white" />
            </div>
            <span className="text-green-400 font-semibold text-sm">
              Pro Tip
            </span>
          </div>
          <p className="text-gray-300 text-xs mb-3">
            Complete 3 more pickups today to reach a new milestone bonus!
          </p>
          <button className="w-full py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
            View Details
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">{children}</main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
