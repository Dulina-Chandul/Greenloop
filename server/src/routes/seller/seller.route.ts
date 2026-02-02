import { Router } from "express";
import sellerController from "../../controllers/seller/seller.controller";

const sellerRouter = Router();

//* Register a seller
sellerRouter.post("/register", sellerController.register);

export default sellerRouter;
