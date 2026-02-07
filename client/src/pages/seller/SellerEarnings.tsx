import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import {
  DollarSign,
  Package,
  TrendingUp,
  Calendar,
  Phone,
  MapPin,
  User,
  Eye,
} from "lucide-react";
import axiosInstance from "@/config/api/axiosInstance";

export default function SellerEarnings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  // Fetch transactions
  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ["seller-transactions", activeTab],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/transactions?role=seller&status=${activeTab}`,
      );
      return response.data;
    },
  });

  const transactions = transactionsData?.transactions || [];
  const totalAmount = transactionsData?.totalAmount || 0;

  // Calculate stats
  const activeOrdersCount = transactions.filter(
    (t: any) => t.status === "scheduled" || t.status === "in_progress",
  ).length;

  const completedCount = transactions.filter(
    (t: any) => t.status === "completed",
  ).length;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900">
        <div className="text-white">Loading earnings...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Earnings & Orders
          </h1>
          <p className="text-gray-400">
            Track your active orders and view your complete earnings history
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Package className="text-blue-400" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Active Orders</p>
                <p className="text-3xl font-bold text-white">
                  {activeOrdersCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <TrendingUp className="text-green-400" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Completed</p>
                <p className="text-3xl font-bold text-white">
                  {completedCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <DollarSign className="text-purple-400" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  {activeTab === "history" ? "Total Earned" : "Pending"}
                </p>
                <p className="text-3xl font-bold text-white">
                  ${totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-8 border-b border-gray-700">
          {[
            { key: "active", label: "Active Orders" },
            { key: "history", label: "Earnings History" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-4 px-2 font-medium transition-colors relative ${
                activeTab === tab.key
                  ? "text-green-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400" />
              )}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="mx-auto mb-4 text-gray-600" size={48} />
              <p>
                No{" "}
                {activeTab === "active" ? "active orders" : "earnings history"}{" "}
                found.
              </p>
            </div>
          ) : (
            transactions.map((transaction: any) => (
              <div
                key={transaction._id}
                className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Listing Info */}
                    <div className="flex gap-4 flex-1">
                      <div className="w-24 h-24 bg-gray-700 rounded-lg overflow-hidden shrink-0">
                        {transaction.listingId?.primaryImage ? (
                          <img
                            src={transaction.listingId.primaryImage}
                            alt="Listing"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            <Package size={32} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-2 truncate">
                          {transaction.listingId?.title || "Unknown Listing"}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Calendar size={14} />
                            <span>
                              Pickup:{" "}
                              {new Date(
                                transaction.scheduledPickupDate,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Package size={14} />
                            <span className="capitalize">
                              Status: {transaction.status.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Collector Info (Active Orders) */}
                    {activeTab === "active" && transaction.buyerId && (
                      <div className="flex-1 bg-gray-700/50 rounded-lg p-4">
                        <p className="text-xs text-gray-400 uppercase mb-3">
                          Collector Details
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-white">
                            <User size={14} className="text-gray-400" />
                            <span className="font-medium">
                              {transaction.buyerId.firstName}{" "}
                              {transaction.buyerId.lastName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-gray-400" />
                            <a
                              href={`tel:${transaction.buyerId.phoneNumber}`}
                              className="text-green-400 hover:text-green-300 text-sm"
                            >
                              {transaction.buyerId.phoneNumber}
                            </a>
                          </div>
                          {transaction.buyerId.address && (
                            <div className="flex items-start gap-2 text-sm text-gray-300">
                              <MapPin
                                size={14}
                                className="text-gray-400 mt-0.5"
                              />
                              <span className="line-clamp-2">
                                {transaction.buyerId.address.city},{" "}
                                {transaction.buyerId.address.district}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Right: Amount */}
                    <div className="flex flex-col justify-between items-end">
                      <div className="text-right">
                        <p className="text-sm text-gray-400 mb-1">Amount</p>
                        <p className="text-3xl font-bold text-green-400">
                          ${transaction.agreedPrice.toFixed(2)}
                        </p>
                      </div>

                      {activeTab === "active" && (
                        <button
                          onClick={() =>
                            navigate(
                              `/seller/listing/${transaction.listingId._id}`,
                            )
                          }
                          className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                      )}

                      {activeTab === "history" && (
                        <div className="mt-4">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                            COMPLETED
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
