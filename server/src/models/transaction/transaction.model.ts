import mongoose from "mongoose";

export interface TransactionDocument extends mongoose.Document {
  listingId: mongoose.Types.ObjectId;
  acceptedBidId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;

  agreedPrice: number;
  platformFee?: number;
  sellerReceives: number;
  paymentMethod?: string;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";

  scheduledPickupDate: Date;
  scheduledPickupTime: string;
  actualPickupDate?: Date;

  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "disputed";

  completedAt?: Date;
  actualWeight?: number;

  sellerConfirmed: boolean;
  buyerConfirmed: boolean;
  verificationCode?: string;

  pickupPhotos?: string[];

  cancelledBy?: mongoose.Types.ObjectId;
  cancellationReason?: string;
  cancelledAt?: Date;

  disputeStatus?: "none" | "open" | "resolved";
  disputeDetails?: {
    raisedBy: mongoose.Types.ObjectId;
    reason: string;
    raisedAt: Date;
    resolvedAt?: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new mongoose.Schema<TransactionDocument>(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },
    acceptedBidId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bid",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      index: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collector",
      required: true,
      index: true,
    },

    agreedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    sellerReceives: {
      type: Number,
      required: true,
    },
    paymentMethod: String,
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },

    scheduledPickupDate: {
      type: Date,
      required: true,
    },
    scheduledPickupTime: {
      type: String,
      required: true,
    },
    actualPickupDate: Date,

    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "cancelled", "disputed"],
      default: "scheduled",
      required: true,
    },

    completedAt: Date,
    actualWeight: Number,

    sellerConfirmed: {
      type: Boolean,
      default: false,
    },
    buyerConfirmed: {
      type: Boolean,
      default: false,
    },
    verificationCode: String,

    //* Photos
    pickupPhotos: [String],

    //* Cancellation details
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancellationReason: String,
    cancelledAt: Date,

    //* Dispute details
    disputeStatus: {
      type: String,
      enum: ["none", "open", "resolved"],
      default: "none",
    },
    disputeDetails: {
      raisedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
      },
      reason: String,
      raisedAt: Date,
      resolvedAt: Date,
    },
  },
  {
    timestamps: true,
  },
);

transactionSchema.index({ sellerId: 1, status: 1 });
transactionSchema.index({ buyerId: 1, status: 1 });
// listingId index is already defined in schema
transactionSchema.index({ status: 1, scheduledPickupDate: 1 });

const TransactionModel = mongoose.model<TransactionDocument>(
  "Transaction",
  transactionSchema,
);
export default TransactionModel;
