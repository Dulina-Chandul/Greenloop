import mongoose from "mongoose";
import { compareValue, hashValue } from "../../utils/bcrypt";

export interface CollectorDocument extends mongoose.Document {
  email: string;
  password: string;
  verified: boolean;

  //* Basic user profile details
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatar?: string;

  businessName?: string;
  businessRegistration?: string;

  accountStatus: "active" | "suspended" | "banned" | "pending_verification";
  isVerifiedCollector: boolean;

  location: {
    type: "Point";
    coordinates: number[]; // [longitude, latitude]
  };
  address: {
    country: string;
    province: string;
    district: string;
    city: string;
    postalCode?: string;
    street?: string;
  };

  serviceRadius: number; //KM
  serviceAreas: string[]; // Special Cities

  vehicleType?: string;
  vehicleCapacity?: number; //KG
  operatingHours: {
    start: string;
    end: string;
  };
  workingDays: string[];

  //TODO : Change this to require
  acceptedMaterials?: string[];
  specializations?: string[];

  rating: {
    average: number;
    totalReviews: number;
  };

  stats: {
    totalBids: number;
    acceptedBids: number;
    completedTransactions: number;
    totalWasteCollected: number;
    totalSpent: number;
    responseTime?: number;
  };

  walletBalance?: number;
  paymentMethods?: string[];

  preferences: {
    language: "en" | "si" | "ta";
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    autoBidEnabled?: boolean;
    maxAutoBidAmount?: number;
  };

  currency: string;

  kycStatus: "pending" | "verified" | "rejected";
  kycDocuments?: string[];

  licenses?: Array<{
    type: string;
    number: string;
    issuedDate: Date;
    expiryDate: Date;
    isValid: boolean;
  }>;

  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(val: string): Promise<boolean>;
  omitPassword(): Omit<
    CollectorDocument,
    "password" | "comparePassword" | "omitPassword"
  >;
}

const collectorSchema = new mongoose.Schema<CollectorDocument>(
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
      unique: true,
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

    businessName: String,
    businessRegistration: String,

    accountStatus: {
      type: String,
      enum: ["active", "suspended", "banned", "pending_verification"],
      default: "pending_verification",
    },
    isVerifiedCollector: {
      type: Boolean,
      default: false,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },
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

    serviceRadius: {
      type: Number,
      required: true,
      min: 1,
      default: 5,
    },
    serviceAreas: {
      type: [String],
      default: [],
    },

    vehicleType: String,
    vehicleCapacity: Number,
    operatingHours: {
      start: {
        type: String,
        default: "08:00",
      },
      end: {
        type: String,
        default: "18:00",
      },
    },
    workingDays: {
      type: [String],
      default: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ],
    },

    //TODO : Add validation to check if he accept at least one "acceptedMaterials"

    acceptedMaterials: {
      type: [String],
      required: false,
      // validate: {
      //   validator: (v: string[]) => v.length > 0,
      //   message: "At least one material type must be accepted",
      // },
    },
    specializations: [String],

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
      totalBids: {
        type: Number,
        default: 0,
      },
      acceptedBids: {
        type: Number,
        default: 0,
      },
      completedTransactions: {
        type: Number,
        default: 0,
      },
      totalWasteCollected: {
        type: Number,
        default: 0,
      },
      totalSpent: {
        type: Number,
        default: 0,
      },
      responseTime: Number,
    },

    walletBalance: {
      type: Number,
      default: 0,
    },
    paymentMethods: [String],

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
      autoBidEnabled: {
        type: Boolean,
        default: false,
      },
      maxAutoBidAmount: Number,
    },

    currency: {
      type: String,
      default: "LKR",
    },

    kycStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      required: true,
    },
    kycDocuments: [String],

    licenses: [
      {
        type: {
          type: String,
          required: true,
        },
        number: {
          type: String,
          required: true,
        },
        issuedDate: Date,
        expiryDate: Date,
        isValid: {
          type: Boolean,
          default: true,
        },
      },
    ],

    lastActive: Date,
  },
  {
    timestamps: true,
  },
);

// collectorSchema.index({ location: "2dsphere" });
collectorSchema.index({ accountStatus: 1, isVerifiedCollector: 1 });
collectorSchema.index({ "rating.average": -1 });
collectorSchema.index({ acceptedMaterials: 1 });
collectorSchema.index({ serviceAreas: 1 });

//* Hash password before saving
collectorSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await hashValue(this.password);
});

//* Compare password method
collectorSchema.methods.comparePassword = async function (val: string) {
  return await compareValue(val, this.password);
};

//* Omit password from response
collectorSchema.methods.omitPassword = function () {
  const collector = this.toObject();
  delete collector.password;
  return collector;
};

const CollectorModel = mongoose.model<CollectorDocument>(
  "Collector",
  collectorSchema,
);
export default CollectorModel;
