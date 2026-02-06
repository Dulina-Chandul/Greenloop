import { Router } from "express";
import { transactionController } from "../../controllers/transaction/transaction.controller";
import authenticate from "../../middleware/Auth/authenticate";

const transactionRouter = Router();

transactionRouter.use(authenticate);

transactionRouter.get("/", transactionController.getTransactions);
transactionRouter.post(
  "/:id/confirm",
  transactionController.confirmTransaction,
);

export default transactionRouter;
