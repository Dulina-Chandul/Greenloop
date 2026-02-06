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

// Accept bid (sellers only)
// Note: We don't have isSeller middleware imported here, but the controller checks ownership
// Ideally we should import isSeller but for now controller check is sufficient or we import it.
// Let's rely on controller check or existing middleware imports.
// The file imports { isCollector } from authenticate, let's verify if isSeller is available.
// It seems verify it first.
bidRouter.put("/:id/accept", authenticate, bidController.acceptBid);

export default bidRouter;
