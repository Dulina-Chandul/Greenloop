import { Router } from "express";
import multer from "multer";
import authenticate from "../../middleware/Auth/authenticate";
import { isSeller } from "../../middleware/Auth/authenticate";
import { listingController } from "../../controllers/listing/listing.controller";

const listingRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed"));
    }
  },
});

//* Analyze the waste
listingRouter.post(
  "/analyze",
  authenticate,
  isSeller,
  upload.single("image"),
  listingController.analyzWaste,
);

//* Create listing
listingRouter.post(
  "/create",
  authenticate,
  isSeller,
  listingController.createListing,
);

//* Update listing
listingRouter.put(
  "/:id",
  authenticate,
  isSeller,
  listingController.updateListing,
);

//* Get all listings (no radius filter)
listingRouter.get("/all", authenticate, listingController.getAllListings);

//* Get nearby listings
listingRouter.get("/nearby", authenticate, listingController.getNearbyListings);

listingRouter.get(
  "/my-listings",
  authenticate,
  isSeller,
  listingController.getSellerListings,
);

//* Get listing by id
listingRouter.get("/:id", authenticate, listingController.getListingById);

//* Close bidding
listingRouter.put(
  "/:id/close-bidding",
  authenticate,
  isSeller,
  listingController.closeBidding,
);

export default listingRouter;
