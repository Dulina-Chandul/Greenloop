import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTransactions, confirmTransaction } from "@/lib/api/transaction";
import { CheckCircle, Clock, DollarSign, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatCurrency } from "@/config/currency";
import { useAppSelector } from "@/redux/hooks/hooks";
import { selectUser } from "@/redux/slices/authSlice";

interface EarningsProps {
  role: "seller" | "buyer"; // 'buyer' is collector in our context
}

export default function Earnings({ role }: EarningsProps) {
  const user = useAppSelector(selectUser);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const queryClient = useQueryClient();

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ["transactions", role, activeTab],
    queryFn: () => getTransactions(role, activeTab),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => confirmTransaction(id, role),
    onSuccess: () => {
      toast.success("Order confirmed successfully");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error) => {
      toast.error("Failed to confirm order");
      console.error(error);
    },
  });

  // The API response is already unwrapped to the data object
  const transactions = transactionsData?.transactions || [];
  const totalAmount = transactionsData?.totalAmount || 0;

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
        <h1 className="text-3xl font-bold text-white mb-2">
          {role === "seller" ? "Earnings & Orders" : "Spending & Orders"}
        </h1>
        <p className="text-gray-400 mb-8">
          Manage your active orders and view your{" "}
          {role === "seller" ? "earnings" : "spending"} history.
        </p>

        {/* Tabs */}
        <div className="flex gap-6 mb-8 border-b border-gray-700">
          {[
            { key: "active", label: "Active Orders" },
            {
              key: "history",
              label:
                role === "seller" ? "Earnings History" : "Spending History",
            },
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

        {/* Total Stats for History */}
        {activeTab === "history" && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <DollarSign size={32} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  Total {role === "seller" ? "Earned" : "Spent"}
                </p>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(totalAmount, user?.currency)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Transactions list */}
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No {activeTab === "active" ? "active orders" : "history"} found.
            </div>
          ) : (
            transactions.map((transaction: any) => (
              <div
                key={transaction._id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  {/* Info */}
                  <div className="flex gap-4">
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
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {transaction.listingId?.title || "Unknown Listing"}
                      </h3>
                      <div className="flex flex-col gap-1 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>
                            Pickup:{" "}
                            {new Date(
                              transaction.scheduledPickupDate,
                            ).toLocaleDateString()}{" "}
                            at {transaction.scheduledPickupTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle size={14} />
                          <span>
                            Status:{" "}
                            <span className="capitalize text-gray-300">
                              {transaction.status.replace("_", " ")}
                            </span>
                          </span>
                        </div>
                        {role === "seller" ? (
                          <span>
                            Buyer: {transaction.buyerId?.firstName}{" "}
                            {transaction.buyerId?.lastName}
                          </span>
                        ) : (
                          <span>
                            Seller: {transaction.sellerId?.firstName}{" "}
                            {transaction.sellerId?.lastName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions / Price */}
                  <div className="flex flex-col items-end justify-between">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Amount</p>
                      <p className="text-2xl font-bold text-green-400">
                        {formatCurrency(
                          transaction.agreedPrice,
                          user?.currency,
                        )}
                      </p>
                    </div>

                    {activeTab === "active" && (
                      <div className="mt-4 flex flex-col items-end gap-2">
                        {(role === "seller" && transaction.sellerConfirmed) ||
                        (role === "buyer" && transaction.buyerConfirmed) ? (
                          <div className="flex items-center gap-2 text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded text-sm">
                            <Clock size={16} />
                            <span>Waiting for other party</span>
                          </div>
                        ) : (
                          <Button
                            onClick={() =>
                              confirmMutation.mutate(transaction._id)
                            }
                            disabled={confirmMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {confirmMutation.isPending
                              ? "Confirming..."
                              : "Confirm Order Complete"}
                          </Button>
                        )}
                      </div>
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
