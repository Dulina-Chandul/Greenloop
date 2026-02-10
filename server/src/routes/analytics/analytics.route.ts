import { Router } from "express";
import authenticate from "../../middleware/Auth/authenticate";
import { isSeller, isCollector } from "../../middleware/Auth/authenticate";
import { analyticsController } from "../../controllers/analytics/analytics.controller";

const analyticsRouter = Router();

analyticsRouter.get(
  "/seller",
  authenticate,
  isSeller,
  analyticsController.getSellerAnalytics,
);
analyticsRouter.get(
  "/collector",
  authenticate,
  isCollector,
  analyticsController.getCollectorAnalytics,
);

export default analyticsRouter;
