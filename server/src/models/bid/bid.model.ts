import mongoose from "mongoose";
import { boolean } from "zod";

export interface BidDocument extends mongoose.Document {
  listingId: mongoose.Types.ObjectId;
  bidderId: mongoose.Types.ObjectId;

  amount: number;
  message?: string | undefined;

  collectorInfo: {
    name: string;
    rating: number;
    distance: number;
    completedJobs: number;
  };

  isHighestBid?: boolean | undefined;

  proposedPickupDate?: Date | undefined;
  proposedPickupTime?: string | undefined;
  hasOwnTransport: boolean;
  status: "pending" | "accepted" | "rejected" | "withdrawn" | "expired";

  createdAt: Date;
  updatedAt: Date;
  respondedAt?: Date;
  expiresAt?: Date;
}

const bidSchema = new mongoose.Schema<BidDocument>(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },
    bidderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collector",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    message: {
      type: String,
      maxlength: 500,
    },

    collectorInfo: {
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        default: 0,
      },
      distance: {
        type: Number,
        required: true,
      },
      completedJobs: {
        type: Number,
        default: 0,
      },
    },

    isHighestBid: {
      type: Boolean,
      default: false,
    },

    proposedPickupDate: Date,
    proposedPickupTime: String,
    hasOwnTransport: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn", "expired"],
      default: "pending",
      required: true,
    },

    respondedAt: Date,
    expiresAt: Date,
  },
  {
    timestamps: true,
  },
);

bidSchema.index({ listingId: 1, amount: -1 });
bidSchema.index({ listingId: 1, createdAt: -1 });
bidSchema.index({ bidderId: 1, createdAt: -1 });
bidSchema.index({ status: 1 });
bidSchema.index({ listingId: 1, bidderId: 1 }, { unique: true });

const BidModel = mongoose.model<BidDocument>("Bid", bidSchema);
export default BidModel;
