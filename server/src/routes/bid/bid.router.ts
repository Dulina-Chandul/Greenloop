import { Router } from "express";
import authenticate, { isCollector } from "../../middleware/Auth/authenticate";
import { bidController } from "../../controllers/bid/bid.controller";

const bidRouter = Router();

// Create bid (collectors only)
bidRouter.post("/", authenticate, isCollector, bidController.createBid);

// Get my bids
bidRouter.get("/my-bids", authenticate, isCollector, bidController.getMyBids);

// Get bids for a listing
bidRouter.get(
  "/listing/:listingId",
  authenticate,
  bidController.getListingBids,
);

// Update bid
bidRouter.put("/:id", authenticate, isCollector, bidController.updateBid);

// Withdraw bid
bidRouter.delete("/:id", authenticate, isCollector, bidController.withdrawBid);

export default bidRouter;
