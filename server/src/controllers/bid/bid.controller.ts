import z from "zod";
import {
  BAD_REQUEST,
  CREATED,
  FORBIDDEN,
  NOT_FOUND,
  OK,
} from "../../constants/http";
import BidModel from "../../models/bid/bid.model";
import ListingModel from "../../models/listing/listing.model";
import CollectorModel from "../../models/collector/collector.model";
import appAssert from "../../utils/appAssert";
import catchErrors from "../../utils/catchErrors";
import { io } from "../../utils/socket";
import TransactionModel from "../../models/transaction/transaction.model";

const createBidSchema = z.object({
  listingId: z.string(),
  amount: z.number().min(0),
  message: z.string().max(500).optional(),
  proposedPickupDate: z.string().optional(),
  proposedPickupTime: z.string().optional(),
  hasOwnTransport: z.boolean().default(true),
});

export const bidController = {
  //* Create a new bid
  createBid: catchErrors(async (req, res) => {
    const collectorId = req.userId;
    appAssert(collectorId, FORBIDDEN, "Only collectors can place bids");

    const data = createBidSchema.parse(req.body);

    // Verify listing exists and is active
    const listing = await ListingModel.findById(data.listingId);
    appAssert(listing, NOT_FOUND, "Listing not found");
    appAssert(
      listing.status === "active",
      BAD_REQUEST,
      "Listing is not active",
    );

    // Check if collector already has a bid on this listing (any status)
    let bid = await BidModel.findOne({
      listingId: data.listingId,
      bidderId: collectorId,
    });

    if (bid) {
      // If bid exists, check status
      if (bid.status === "pending" || bid.status === "accepted") {
        appAssert(
          false,
          BAD_REQUEST,
          "You already have an active bid on this listing",
        );
      }

      // If bid was withdrawn or rejected, we can update it to pending
      bid.amount = data.amount;
      bid.message = data.message;
      bid.proposedPickupDate = data.proposedPickupDate
        ? new Date(data.proposedPickupDate)
        : undefined;
      bid.proposedPickupTime = data.proposedPickupTime;
      bid.hasOwnTransport = data.hasOwnTransport;
      bid.status = "pending";
      bid.isHighestBid = false; // Will be checked later
      // Update collector info in case it changed
      // ... (optional, but good practice)
    } else {
      // Get collector info
      const collector = await CollectorModel.findById(collectorId);
      appAssert(collector, NOT_FOUND, "Collector not found");

      // Calculate distance (simplified - you may want to use a proper distance calculation)
      const calculateDistance = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
      ): number => {
        const R = 6371; // Earth's radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      // Get collector's location (you'll need to pass this from frontend)
      const collectorLocation = req.body.collectorLocation || {
        lat: 0,
        lng: 0,
      };
      const [listingLng, listingLat] = listing.location.coordinates;

      const distance = calculateDistance(
        collectorLocation.lat,
        collectorLocation.lng,
        listingLat ?? 0,
        listingLng ?? 0,
      );

      // Create bid
      bid = await (BidModel as any).create({
        listingId: data.listingId,
        bidderId: collectorId,
        amount: data.amount,
        message: data.message,
        collectorInfo: {
          name: `${collector.firstName} ${collector.lastName}`,
          rating: collector.rating.average,
          distance: distance,
          completedJobs: collector.stats.completedTransactions,
        },
        proposedPickupDate: data.proposedPickupDate,
        proposedPickupTime: data.proposedPickupTime,
        hasOwnTransport: data.hasOwnTransport,
        status: "pending",
      });
    }

    if (!bid) {
      throw new Error("Failed to create or update bid");
    }

    // Update listing with new bid count and highest bid
    const wasHighestBid =
      !listing.currentHighestBid || data.amount > listing.currentHighestBid;

    if (wasHighestBid) {
      // Mark previous highest bid as not highest
      await BidModel.updateMany(
        {
          listingId: data.listingId,
          isHighestBid: true,
          _id: { $ne: bid._id },
        },
        { isHighestBid: false },
      );

      // Mark this bid as highest
      bid.isHighestBid = true;
      await bid.save();

      listing.currentHighestBid = data.amount;
    } else {
      await bid.save();
    }

    // Only increment totalBids if it's a NEW bid or if logic requires total interaction count.
    // If reactivating, we should probably increment totalBids again if we decremented it on withdraw.
    // withdrawBid decrements totalBids. So yes, increment it here.
    listing.totalBids += 1;
    await listing.save();

    // Emit socket event to seller
    io.to(`seller:${listing.sellerId}`).emit("bid:new", {
      listingId: listing._id,
      bid: bid.toObject(),
    });

    // Emit socket event to update auction for all collectors
    io.emit("listing:updated", {
      listingId: listing._id,
      updates: {
        currentHighestBid: listing.currentHighestBid,
        totalBids: listing.totalBids,
      },
    });

    return res.status(CREATED).json({
      message: "Bid placed successfully",
      data: { bid },
    });
  }),

  //* Get bids for a listing
  getListingBids: catchErrors(async (req, res) => {
    const { listingId } = req.params;

    const bids = await (BidModel as any)
      .find({
        listingId,
        status: { $ne: "withdrawn" },
      })
      .populate("bidderId", "firstName lastName avatar rating")
      .sort({ amount: -1, createdAt: -1 });

    return res.status(OK).json({
      data: { bids, total: bids.length },
    });
  }),

  //* Get collector's own bids
  getMyBids: catchErrors(async (req, res) => {
    const collectorId = req.userId;
    const { status } = req.query;

    const filter: any = { bidderId: collectorId };
    if (status) {
      filter.status = status;
    }

    const bids = await BidModel.find(filter)
      .populate({
        path: "listingId",
        select:
          "title primaryImage finalWeight address status currentHighestBid sellerId location",
        populate: {
          path: "sellerId",
          select: "firstName lastName phoneNumber address email",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(OK).json({
      data: { bids, total: bids.length },
    });
  }),

  //* Update bid (increase amount)
  updateBid: catchErrors(async (req, res) => {
    const { id } = req.params;
    const collectorId = req.userId;
    const { amount } = z.object({ amount: z.number().min(0) }).parse(req.body);

    const bid = await BidModel.findById(id);
    appAssert(bid, NOT_FOUND, "Bid not found");
    appAssert(
      bid.bidderId.toString() === collectorId,
      FORBIDDEN,
      "Not your bid",
    );
    appAssert(bid.status === "pending", BAD_REQUEST, "Cannot update this bid");

    const listing = await ListingModel.findById(bid.listingId);
    appAssert(listing, NOT_FOUND, "Listing not found");
    appAssert(
      listing.status === "active",
      BAD_REQUEST,
      "Listing is not active",
    );

    // Update bid amount
    bid.amount = amount;

    // Check if this is now the highest bid
    const wasHighestBid = amount > (listing.currentHighestBid || 0);

    if (wasHighestBid) {
      await BidModel.updateMany(
        { listingId: listing._id, isHighestBid: true },
        { isHighestBid: false },
      );

      bid.isHighestBid = true;
      listing.currentHighestBid = amount;
      await listing.save();
    }

    await bid.save();

    // Emit socket events
    io.to(`seller:${listing.sellerId}`).emit("bid:updated", {
      listingId: listing._id,
      bid: bid.toObject(),
    });

    io.emit("listing:updated", {
      listingId: listing._id,
      updates: {
        currentHighestBid: listing.currentHighestBid,
      },
    });

    return res.status(OK).json({
      message: "Bid updated successfully",
      data: { bid },
    });
  }),

  //* Withdraw bid
  withdrawBid: catchErrors(async (req, res) => {
    const { id } = req.params;
    const collectorId = req.userId;

    const bid = await BidModel.findById(id);
    appAssert(bid, NOT_FOUND, "Bid not found");
    appAssert(
      bid.bidderId.toString() === collectorId,
      FORBIDDEN,
      "Not your bid",
    );
    appAssert(
      bid.status === "pending",
      BAD_REQUEST,
      "Cannot withdraw this bid",
    );

    bid.status = "withdrawn";
    await bid.save();

    // Update listing
    const listing = await ListingModel.findById(bid.listingId);
    if (listing) {
      listing.totalBids = Math.max(0, listing.totalBids - 1);

      // Recalculate highest bid if this was the highest
      if (bid.isHighestBid) {
        const highestBid = await BidModel.findOne({
          listingId: listing._id,
          status: "pending",
        }).sort({ amount: -1 });

        listing.currentHighestBid = highestBid?.amount || 0;

        if (highestBid) {
          await BidModel.updateMany(
            { listingId: listing._id, isHighestBid: true },
            { isHighestBid: false },
          );
          highestBid.isHighestBid = true;
          await highestBid.save();
        }
      }

      await listing.save();
    }

    return res.status(OK).json({
      message: "Bid withdrawn successfully",
    });
  }),

  //* Accept bid
  acceptBid: catchErrors(async (req, res) => {
    const { id } = req.params;
    const sellerId = req.userId;

    const bid = await BidModel.findById(id);
    appAssert(bid, NOT_FOUND, "Bid not found");

    const listing = await ListingModel.findById(bid.listingId);
    appAssert(listing, NOT_FOUND, "Listing not found");
    appAssert(
      listing.sellerId.toString() === sellerId,
      FORBIDDEN,
      "You can only accept bids on your own listings",
    );
    appAssert(
      listing.status === "active" ||
        listing.status === "bidding_closed" ||
        listing.status === "expired",
      BAD_REQUEST,
      "Listing is not active, expired, or awaiting winner selection",
    );

    // If there was a previously accepted bid, reject it
    if (listing.acceptedBidId) {
      await BidModel.findByIdAndUpdate(listing.acceptedBidId, {
        status: "rejected",
        respondedAt: new Date(),
      });
    }

    // Update bid status
    bid.status = "accepted";
    bid.respondedAt = new Date();
    await bid.save();

    // Update listing
    listing.status = "bidding_closed";
    listing.acceptedBidId = bid._id as any;
    listing.acceptedBuyerId = bid.bidderId;
    listing.closedAt = new Date();
    await listing.save();

    // Create transaction
    const transaction = await (TransactionModel as any).create({
      listingId: listing._id,
      acceptedBidId: bid._id,
      sellerId: listing.sellerId,
      buyerId: bid.bidderId,
      agreedPrice: bid.amount, // No platform fee for now
      sellerReceives: bid.amount,
      paymentStatus: "pending",
      status: "scheduled",
      scheduledPickupDate:
        bid.proposedPickupDate || new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to tomorrow if not set
      scheduledPickupTime: bid.proposedPickupTime || "12:00",
      sellerConfirmed: false,
      buyerConfirmed: false,
    });

    // Reject all other pending bids
    await BidModel.updateMany(
      { listingId: listing._id, _id: { $ne: bid._id }, status: "pending" },
      { status: "rejected", respondedAt: new Date() },
    );

    // Emit socket events
    io.emit("listing:updated", {
      listingId: listing._id,
      updates: { status: "bidding_closed", acceptedBuyerId: bid.bidderId },
    });

    io.to(`collector:${bid.bidderId}`).emit("bid:accepted", {
      listingId: listing._id,
      bidId: bid._id,
    });

    return res.status(OK).json({
      message: "Bid accepted successfully",
      data: { bid, listing },
    });
  }),
};
