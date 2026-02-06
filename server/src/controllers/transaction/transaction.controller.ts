import { OK, NOT_FOUND, BAD_REQUEST } from "../../constants/http";
import TransactionModel from "../../models/transaction/transaction.model";
import catchErrors from "../../utils/catchErrors";
import appAssert from "../../utils/appAssert";

export const transactionController = {
  //* Get transactions (Earnings/Orders)
  getTransactions: catchErrors(async (req, res) => {
    const userId = req.userId;
    const { role, status } = req.query; // role: 'seller' | 'buyer', status: 'active' | 'history'

    console.log("getTransactions Debug:", { userId, role, status });

    const filter: any = {};
    if (role === "seller") {
      filter.sellerId = userId;
    } else {
      filter.buyerId = userId;
    }

    if (status === "active") {
      filter.status = { $in: ["scheduled", "in_progress"] };
    } else if (status === "history") {
      filter.status = { $in: ["completed", "cancelled", "disputed"] };
    }

    console.log("Transaction Filter:", JSON.stringify(filter, null, 2));

    const transactions = await TransactionModel.find(filter)
      .populate("listingId", "title primaryImage")
      .populate("sellerId", "firstName lastName")
      .populate("buyerId", "firstName lastName")
      .sort({ createdAt: -1 });

    console.log("Found transactions:", transactions.length);

    // Calculate total earnings/spending for history
    let totalAmount = 0;
    if (status === "history") {
      totalAmount = transactions.reduce((sum, t) => sum + t.agreedPrice, 0);
    }

    return res.status(OK).json({
      data: {
        transactions,
        totalAmount,
      },
    });
  }),

  //* Confirm transaction
  confirmTransaction: catchErrors(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    const { role } = req.body; // 'seller' | 'buyer'

    const transaction = await TransactionModel.findById(id);
    appAssert(transaction, NOT_FOUND, "Transaction not found");

    if (role === "seller") {
      appAssert(
        transaction.sellerId.toString() === userId,
        BAD_REQUEST,
        "Not authorized",
      );
      transaction.sellerConfirmed = true;
    } else if (role === "buyer") {
      appAssert(
        transaction.buyerId.toString() === userId,
        BAD_REQUEST,
        "Not authorized",
      );
      transaction.buyerConfirmed = true;
    } else {
      throw new Error("Invalid role");
    }

    // Check if both confirmed
    // For MVP, user said "seller get the money by collector physically", so maybe just seller confirmation is enough?
    // But user also said "use a simple one for now (not complex onse like sending otp for that) after the complemtion the earning need to update"
    // I'll stick to requiring "Confirm" button click.
    // If BOTH confirmed, mark completed.

    // UPDATE: To make it simpler and robust, if EITHER marks it, we can't just complete it unless we trust one side implicitly.
    // However, usually "Seller" confirming receipt is the money trigger. "Buyer" confirming receipt is the goods trigger.
    // Let's implement: Status becomes 'completed' when BOTH are true.

    if (transaction.sellerConfirmed && transaction.buyerConfirmed) {
      transaction.status = "completed";
      transaction.paymentStatus = "completed";
      transaction.completedAt = new Date();
    }

    await transaction.save();

    return res.status(OK).json({
      message: "Transaction confirmed",
      data: transaction,
    });
  }),
};
