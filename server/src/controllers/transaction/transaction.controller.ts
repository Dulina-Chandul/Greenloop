import { OK, NOT_FOUND, BAD_REQUEST } from "../../constants/http";
import TransactionModel from "../../models/transaction/transaction.model";
import catchErrors from "../../utils/catchErrors";
import appAssert from "../../utils/appAssert";
import SellerModel from "../../models/seller/seller.model";
import ListingModel from "../../models/lising/listing.model";

export const transactionController = {
  //* Get transactions (Earnings/Orders)
  getTransactions: catchErrors(async (req, res) => {
    const userId = req.userId;
    const { role, status } = req.query;

    const filter: any = {};
    if (role === "seller") {
      filter.sellerId = userId;
    } else {
      filter.buyerId = userId;
    }

    if (req.query.listingId) {
      filter.listingId = req.query.listingId;
    }

    if (status === "active") {
      filter.status = { $in: ["scheduled", "in_progress"] };
    } else if (status === "history") {
      filter.status = { $in: ["completed", "cancelled", "disputed"] };
    }

    const transactions = await TransactionModel.find(filter)
      .populate("listingId", "title primaryImage _id")
      .populate("sellerId", "firstName lastName")
      .populate("buyerId", "firstName lastName phoneNumber address email")
      .sort({ createdAt: -1 });

    const totalAmount = transactions.reduce((sum, t) => sum + t.agreedPrice, 0);

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

      // Update seller stats
      const seller = await SellerModel.findById(transaction.sellerId);
      if (seller) {
        seller.stats.totalEarnings += transaction.agreedPrice;
        seller.stats.completedTransactions += 1;
        if (transaction.actualWeight) {
          seller.stats.totalWasteSold += transaction.actualWeight;
        } else {
          // If actual weight isn't set, maybe use estimated/final weight from listing if available?
          // For now, let's try to fetch it from listing if we really need it, or just skip.
          // Let's check listing for finalWeight
          const listing = await ListingModel.findById(transaction.listingId);
          if (listing && listing.finalWeight) {
            seller.stats.totalWasteSold += listing.finalWeight;
          }
        }
        await seller.save();
      }
    }

    await transaction.save();

    return res.status(OK).json({
      message: "Transaction confirmed",
      data: transaction,
    });
  }),
};
