import mongoose from "mongoose";

export interface ListingDocument extends mongoose.Document {
  //* Seller
  sellerId: mongoose.Types.ObjectId;

  //* Basic information about the listing
  title: string;
  description: string;
  category: "plastic" | "metal" | "paper" | "glass" | "electronic" | "mixed";

  //* AI Analysis from ScrapLens
  aiAnalysis: {
    detectedMaterials: Array<{
      materialType: string;
      confidence: number;
      estimatedWeight?: number;
      estimatedValue?: number;
    }>;
    totalEstimatedWeight: number;
    totalEstimatedValue: number;
    analysisTimestamp: Date;
    modelVersion?: string;
  };

  //* If user manually edits the listing
  manualOverrides?: {
    weight?: number;
    value?: number;
    materials?: string[];
    description?: string;
    isManuallyEdited: boolean;
    editedAt?: Date;
  };

  //* Final value (AI + USER)
  finalWeight: number;
  finalMaterials: string[];
  finalValue: number;

  //* Images of the scrape
  images: string[];
  primaryImage: string;

  //* Location
  location: {
    type: "Point";
    coordinates: number[];
  };
  address: {
    street?: string;
    city: string;
    district: string;
  };
  pickupRadius: number; //KM

  //* Pickup details
  availableFrom: Date;
  availableUntil?: Date;
  preferredPickupTime?: {
    date: Date;
    timeSlot: string;
  };

  minimumBid?: number;
  currentHighestBid?: number;
  totalBids: number;
  biddingDeadline?: Date;

  status:
    | "draft"
    | "active"
    | "bidding_closed"
    | "sold"
    | "cancelled"
    | "expired";

  acceptedBidId?: mongoose.Types.ObjectId;
  acceptedBuyerId?: mongoose.Types.ObjectId;

  views: number;
  isUrgent?: boolean;
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

const listingSchema = new mongoose.Schema<ListingDocument>(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      enum: ["plastic", "metal", "paper", "glass", "electronic", "mixed"],
      required: true,
    },

    aiAnalysis: {
      detectedMaterials: [
        {
          materialType: {
            type: String,
            required: true,
          },
          confidence: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
          },
          estimatedWeight: Number,
          estimatedValue: Number,
        },
      ],
      totalEstimatedWeight: {
        type: Number,
        required: true,
        min: 0,
      },
      totalEstimatedValue: {
        type: Number,
        required: true,
        min: 0,
      },
      analysisTimestamp: {
        type: Date,
        default: Date.now,
      },
      modelVersion: String,
    },

    manualOverrides: {
      weight: {
        type: Number,
        min: 0,
      },
      value: {
        type: Number,
        min: 0,
      },
      materials: [String],
      description: String,
      isManuallyEdited: {
        type: Boolean,
        default: false,
      },
      editedAt: Date,
    },

    finalWeight: {
      type: Number,
      required: true,
      min: 0,
    },
    finalMaterials: {
      type: [String],
      required: true,
    },
    finalValue: {
      type: Number,
      required: true,
      min: 0,
    },

    images: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "At least one image is required",
      },
    },
    primaryImage: {
      type: String,
      required: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    address: {
      street: String,
      city: {
        type: String,
        required: true,
      },
      district: {
        type: String,
        required: true,
      },
    },
    pickupRadius: {
      type: Number,
      required: true,
      min: 1,
      default: 5,
    },

    availableFrom: {
      type: Date,
      default: Date.now,
    },
    availableUntil: Date,
    preferredPickupTime: {
      date: Date,
      timeSlot: {
        type: String,
        enum: ["morning", "afternoon", "evening", "anytime"],
      },
    },

    minimumBid: {
      type: Number,
      min: 0,
    },
    currentHighestBid: {
      type: Number,
      default: 0,
    },
    totalBids: {
      type: Number,
      default: 0,
    },
    biddingDeadline: Date,

    status: {
      type: String,
      enum: [
        "draft",
        "active",
        "bidding_closed",
        "sold",
        "cancelled",
        "expired",
      ],
      default: "draft",
      required: true,
    },

    acceptedBidId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bid",
    },
    acceptedBuyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collector",
    },

    views: {
      type: Number,
      default: 0,
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
    notes: String,

    closedAt: Date,
  },
  {
    timestamps: true,
  },
);

//* Calculate final values
listingSchema.pre("save", function (next) {
  if (this.manualOverrides?.isManuallyEdited) {
    this.finalWeight =
      this.manualOverrides.weight || this.aiAnalysis.totalEstimatedWeight;
    this.finalMaterials =
      this.manualOverrides.materials ||
      this.aiAnalysis.detectedMaterials.map((m) => m.materialType);
    this.finalValue = this.manualOverrides?.value ?? this.finalWeight * 50;
  } else {
    this.finalWeight = this.aiAnalysis.totalEstimatedWeight;
    this.finalMaterials = this.aiAnalysis.detectedMaterials.map(
      (m) => m.materialType,
    );
    this.finalValue = this.aiAnalysis.totalEstimatedValue;
  }
});

listingSchema.index({ location: "2dsphere" });
listingSchema.index({ status: 1, createdAt: -1 });
listingSchema.index({ sellerId: 1, status: 1 });
listingSchema.index({ category: 1, status: 1 });
listingSchema.index({ currentHighestBid: -1 });

const ListingModel = mongoose.model<ListingDocument>("Listing", listingSchema);
export default ListingModel;
