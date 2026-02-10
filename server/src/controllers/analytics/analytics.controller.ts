import { OK } from "../../constants/http";
import ListingModel from "../../models/listing/listing.model";
import TransactionModel from "../../models/transaction/transaction.model";
import BidModel from "../../models/bid/bid.model";
import SellerModel from "../../models/seller/seller.model";
import CollectorModel from "../../models/collector/collector.model";
import catchErrors from "../../utils/catchErrors";
import appAssert from "../../utils/appAssert";
import { UNAUTHORIZED } from "../../constants/http";

export const analyticsController = {
  // Seller Analytics
  getSellerAnalytics: catchErrors(async (req, res) => {
    const sellerId = req.userId;
    appAssert(sellerId, UNAUTHORIZED, "Authentication required");

    const seller = await SellerModel.findById(sellerId);

    // Get listings by category
    const listingsByCategory = await ListingModel.aggregate([
      { $match: { sellerId: seller?._id } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalValue: { $sum: "$finalValue" },
        },
      },
    ]);

    // Get listings by status
    const listingsByStatus = await ListingModel.aggregate([
      { $match: { sellerId: seller?._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Get monthly earnings (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyEarnings = await TransactionModel.aggregate([
      {
        $match: {
          sellerId: seller?._id,
          status: "completed",
          completedAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$completedAt" },
            year: { $year: "$completedAt" },
          },
          earnings: { $sum: "$agreedPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Top performing listings
    const topListings = await (ListingModel as any)
      .find({ sellerId: seller?._id })
      .sort({ currentHighestBid: -1, totalBids: -1 })
      .limit(5)
      .select("title currentHighestBid totalBids category status");

    return res.status(OK).json({
      data: {
        stats: seller?.stats,
        rating: seller?.rating,
        listingsByCategory,
        listingsByStatus,
        monthlyEarnings,
        topListings,
      },
    });
  }),

  // Collector Analytics
  getCollectorAnalytics: catchErrors(async (req, res) => {
    const collectorId = req.userId;
    appAssert(collectorId, UNAUTHORIZED, "Authentication required");

    const collector = await CollectorModel.findById(collectorId);

    // Get bids by status
    const bidsByStatus = await BidModel.aggregate([
      { $match: { bidderId: collector?._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Get monthly spending (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySpending = await TransactionModel.aggregate([
      {
        $match: {
          buyerId: collector?._id,
          status: "completed",
          completedAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$completedAt" },
            year: { $year: "$completedAt" },
          },
          spending: { $sum: "$agreedPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Material collection breakdown
    const materialBreakdown = await TransactionModel.aggregate([
      {
        $match: {
          buyerId: collector?._id,
          status: "completed",
        },
      },
      {
        $lookup: {
          from: "listings",
          localField: "listingId",
          foreignField: "_id",
          as: "listing",
        },
      },
      { $unwind: "$listing" },
      {
        $group: {
          _id: "$listing.category",
          weight: { $sum: "$listing.finalWeight" },
          spent: { $sum: "$agreedPrice" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Recent wins
    const recentWins = await (BidModel as any)
      .find({
        bidderId: collector?._id,
        status: "accepted",
      })
      .populate("listingId", "title finalWeight primaryImage")
      .sort({ respondedAt: -1 })
      .limit(5);

    return res.status(OK).json({
      data: {
        stats: collector?.stats,
        rating: collector?.rating,
        bidsByStatus,
        monthlySpending,
        materialBreakdown,
        recentWins,
      },
    });
  }),
};
