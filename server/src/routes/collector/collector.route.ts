import { Router } from "express";
import collectorController from "../../controllers/collector/collector.controller";

const collectorRouter = Router();

//* Register a collector
collectorRouter.post("/register", collectorController.register);

//* Login a collector
collectorRouter.post("/login", collectorController.login);

export default collectorRouter;
