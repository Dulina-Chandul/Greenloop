import z from "zod";
import {
  BAD_REQUEST,
  CREATED,
  FORBIDDEN,
  NOT_FOUND,
  OK,
} from "../../constants/http";
import appAssert from "../../utils/appAssert";
import catchErrors from "../../utils/catchErrors";
import ListingModel, {
  ListingDocument,
} from "../../models/lising/listing.model";
import { uploadImageToCloudinary } from "../../services/cloudinary/cloudinary.service";
import { analyzeWasteImage } from "../../services/ai/gemini.service";
import { io } from "../../utils/socket";

const createListingSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(1000),
  category: z.enum([
    "plastic",
    "metal",
    "paper",
    "glass",
    "electronic",
    "mixed",
  ]),

  aiAnalysis: z.object({
    detectedMaterials: z.array(
      z.object({
        materialType: z.string(),
        confidence: z.number(),
        estimatedWeight: z.number().optional(),
        estimatedValue: z.number().optional(),
      }),
    ),
    totalEstimatedWeight: z.number(),
    totalEstimatedValue: z.number(),
  }),

  images: z.array(z.string().url()).min(1),
  primaryImage: z.string().url(),

  location: z.object({
    type: z.literal("Point"),
    coordinates: z.array(z.number()).length(2),
  }),
  address: z.object({
    street: z.string().optional(),
    city: z.string(),
    district: z.string(),
  }),
  pickupRadius: z.number().min(1).max(10).default(5),

  manualOverrides: z
    .object({
      weight: z.number().optional(),
      materials: z.array(z.string()).optional(),
      description: z.string().optional(),
    })
    .optional(),

  minimumBid: z.number().optional(),
  availableUntil: z.string().optional(),
  notes: z.string().optional(),

  status: z.enum(["draft", "active"]).default("active"),
});

export const listingController = {
  //* Create listing
  createListing: catchErrors(async (req, res) => {
    const sellerId = req.userId;
    appAssert(sellerId, FORBIDDEN, "Only sellers can create listings");

    const data = createListingSchema.parse(req.body);

    const manualOverrides = data.manualOverrides
      ? {
          ...data.manualOverrides,
          isManuallyEdited: true,
          editedAt: new Date(),
        }
      : undefined;

    // Calculate final fields to satisfy model validation
    let finalWeight: number;
    let finalMaterials: string[];
    let finalValue: number;

    if (manualOverrides) {
      finalWeight =
        manualOverrides.weight ?? data.aiAnalysis.totalEstimatedWeight;
      finalMaterials =
        manualOverrides.materials ??
        data.aiAnalysis.detectedMaterials.map((m) => m.materialType);
      // Using logic from model's pre-save hook
      finalValue = finalWeight * 50;
    } else {
      finalWeight = data.aiAnalysis.totalEstimatedWeight;
      finalMaterials = data.aiAnalysis.detectedMaterials.map(
        (m) => m.materialType,
      );
      finalValue = data.aiAnalysis.totalEstimatedValue;
    }

    const listing = (await ListingModel.create({
      sellerId,
      ...data,
      manualOverrides,
      finalWeight,
      finalMaterials,
      finalValue,
    } as any)) as ListingDocument;

    await listing.populate(
      "sellerId",
      "firstName lastName email phoneNumber rating",
    );

    if (listing.status === "active") {
      console.log(`Emitting listing:new for ${listing._id}`);
      io.emit("listing:new", {
        listing: listing.toObject(),
      });
    }

    return res.status(CREATED).json({
      message: "Listing created successfully",
      data: { listing },
    });
  }),

  //* Analyz the waste
  analyzWaste: catchErrors(async (req, res) => {
    appAssert(req.file, BAD_REQUEST, "Image file is required");
    appAssert(req.userId, FORBIDDEN, "Authentication required");

    const sellerId = req.userId;

    const imageUrl = await uploadImageToCloudinary(
      req.file.buffer,
      "waste-images",
    );

    const aiAnalysis = await analyzeWasteImage(imageUrl);

    return res.status(OK).json({
      message: "Image analyzed successfully",
      data: {
        imageUrl,
        aiAnalysis: {
          detectedMaterials: aiAnalysis.materials,
          totalEstimatedWeight: aiAnalysis.totalWeight,
          totalEstimatedValue: aiAnalysis.totalValue,
          category: aiAnalysis.category,
          description: aiAnalysis.description,
          analysisTimestamp: new Date(),
        },
      },
    });
  }),

  //* Get all active listings (no radius filter)
  getAllListings: catchErrors(async (req, res) => {
    const listings = await ListingModel.find({
      status: "active",
    })
      .populate("sellerId", "firstName lastName rating accountType")
      .sort({ createdAt: -1 })
      .limit(200); // Reasonable limit to prevent performance issues

    return res.status(OK).json({
      data: { listings, total: listings.length },
    });
  }),

  //* Get the nearby listings
  getNearbyListings: catchErrors(async (req, res) => {
    const { longitude, latitude, radius = 10 } = req.query;

    appAssert(
      longitude && latitude,
      BAD_REQUEST,
      "Location coordinates required",
    );

    const listings = await ListingModel.find({
      status: "active",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [
              parseFloat(longitude as string),
              parseFloat(latitude as string),
            ],
          },
          $maxDistance: parseFloat(radius as string) * 1000, // Meter convert
        },
      },
    })
      .populate("sellerId", "firstName lastName rating accountType")
      .limit(50);

    return res.status(OK).json({
      data: { listings, total: listings.length },
    });
  }),

  //* Get the listing by id
  getListingById: catchErrors(async (req, res) => {
    const { id } = req.params;

    const listing = await ListingModel.findById(id).populate(
      "sellerId",
      "firstName lastName email phoneNumber rating accountType",
    );
    // .populate("acceptedBuyerId", "firstName lastName rating accountType");

    appAssert(listing, NOT_FOUND, "Listing not found");

    listing.views += 1;
    await listing.save();

    return res.status(OK).json({ data: { listing } });
  }),

  //* Update listing
  updateListing: catchErrors(async (req, res) => {
    const { id } = req.params;
    const sellerId = req.userId;

    const listing = await ListingModel.findById(id);
    appAssert(listing, NOT_FOUND, "Listing not found");
    appAssert(
      listing.sellerId.toString() === sellerId,
      FORBIDDEN,
      "You can only update your own listings",
    );

    const updateData = createListingSchema.partial().parse(req.body);

    Object.assign(listing, updateData);
    await listing.save();

    console.log(`Emitting listing:updated for ${listing._id}`);
    io.emit("listing:updated", {
      listingId: listing._id,
      updates: updateData,
    });

    return res.status(OK).json({
      message: "Listing updated successfully",
      data: { listing },
    });
  }),
  // Add this method to listingController object
  getSellerListings: catchErrors(async (req, res) => {
    const sellerId = req.userId;

    const listings = await ListingModel.find({ sellerId })
      .sort({ createdAt: -1 })
      .populate("acceptedBuyerId", "firstName lastName");

    return res.status(OK).json({
      data: { listings, total: listings.length },
    });
  }),

  // Add close bidding method
  closeBidding: catchErrors(async (req, res) => {
    const { id } = req.params;
    const sellerId = req.userId;

    const listing = await ListingModel.findById(id);
    appAssert(listing, NOT_FOUND, "Listing not found");
    appAssert(
      listing.sellerId.toString() === sellerId,
      FORBIDDEN,
      "Not your listing",
    );

    listing.status = "bidding_closed";
    await listing.save();

    io.emit("listing:updated", {
      listingId: listing._id,
      updates: { status: "bidding_closed" },
    });

    return res.status(OK).json({
      message: "Bidding closed successfully",
      data: { listing },
    });
  }),
};
