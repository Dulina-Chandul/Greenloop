import mongoose from "mongoose";
import { compareValue, hashValue } from "../../utils/bcrypt";

export interface SellerDocument extends mongoose.Document {
  email: string;
  password: string;
  verified: boolean;

  //* Basic user profile details
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatar?: string;

  accountType: "household" | "business";

  businessInfo?: {
    businessName: string;
    businessRegistration?: string;
    businessType?: string;
  };

  accountStatus: "active" | "suspended" | "banned" | "pending_verification";
  //   location: {
  //     type: "Point";
  //     coordinates: number[];
  //   };
  address: {
    country: string;
    province: string;
    district: string;
    city: string;
    postalCode?: string;
    street?: string;
  };

  rating: {
    average: number;
    totalReviews: number;
  };

  stats: {
    totalListings: number;
    activeListings: number;
    completedTransactions: number;
    totalWasteSold: number; //KG
    totalEarnings: number; //Use the currency according to the user's country for now LKR
  };

  preferences: {
    language: "en" | "si" | "ta";
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    autoAcceptBids?: boolean;
    preferredPickupTime?: "morning" | "afternoon" | "evening" | "anytime";
  };

  kycStatus?: "pending" | "verified" | "rejected";
  kycDocuments?: string[];

  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(val: string): Promise<boolean>;
  omitPassword(): Omit<
    SellerDocument,
    "password" | "comparePassword" | "omitPassword"
  >;
}

const sellerSchema = new mongoose.Schema<SellerDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    accountType: {
      type: String,
      enum: ["household", "business"],
      default: "household",
      required: true,
    },

    businessInfo: {
      businessName: String,
      businessRegistration: String,
      businessType: String,
    },

    accountStatus: {
      type: String,
      enum: ["active", "suspended", "banned", "pending_verification"],
      default: "active",
    },

    // location: {
    //   type: {
    //     type: String,
    //     enum: ["Point"],
    //     required: true,
    //   },
    //   coordinates: {
    //     type: [Number],
    //     required: true,
    //   },
    // },
    address: {
      country: {
        type: String,
        default: "Sri Lanka",
      },
      province: {
        type: String,
        required: true,
      },
      district: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: false,
      },
      street: {
        type: String,
        required: false,
      },
    },

    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
    },

    stats: {
      totalListings: {
        type: Number,
        default: 0,
      },
      activeListings: {
        type: Number,
        default: 0,
      },
      completedTransactions: {
        type: Number,
        default: 0,
      },
      totalWasteSold: {
        type: Number,
        default: 0,
      },
      totalEarnings: {
        type: Number,
        default: 0,
      },
    },

    preferences: {
      language: {
        type: String,
        enum: ["en", "si", "ta"],
        default: "en",
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: false,
        },
      },
      autoAcceptBids: {
        type: Boolean,
        default: false,
      },
      preferredPickupTime: {
        type: String,
        enum: ["morning", "afternoon", "evening", "anytime"],
      },
    },

    kycStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
    },
    kycDocuments: [String],

    lastActive: Date,
  },
  {
    timestamps: true,
  },
);

// sellerSchema.index({ location: "2dsphere" });
// sellerSchema.index({ email: 1 }, { unique: true }); // Already unique in schema
// sellerSchema.index({ phoneNumber: 1 }, { unique: true }); // Already unique in schema
sellerSchema.index({ accountStatus: 1 });
sellerSchema.index({ "rating.average": -1 });
sellerSchema.index({ accountType: 1 });

//* Hash password before saving
sellerSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await hashValue(this.password);
});

//* Compare password method
sellerSchema.methods.comparePassword = async function (val: string) {
  return await compareValue(val, this.password);
};

//* Omit password from response
sellerSchema.methods.omitPassword = function () {
  const seller = this.toObject();
  delete seller.password;
  return seller;
};

const SellerModel = mongoose.model<SellerDocument>("Seller", sellerSchema);
export default SellerModel;
