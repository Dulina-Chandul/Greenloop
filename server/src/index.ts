import "dotenv/config";
import express from "express";
import cors from "cors";
import connectToDatabase from "./config/connectDB";
import { APP_ORIGIN, NODE_ENV, PORT } from "./constants/env";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler";
import catchErrors from "./utils/catchErrors";
import { OK } from "./constants/http";
import authRouter from "./routes/user/auth.route";
import authenticate from "./middleware/Auth/authenticate";
import userRoutes from "./routes/user/user.route";
import sessionRoutes from "./routes/user/session.route";
import sellerRouter from "./routes/seller/seller.route";
import collectorRouter from "./routes/collector/collector.route";

const app = express();

const corsOptions = {
  origin: APP_ORIGIN,
  credentials: true,
};
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser());

app.get("/", (req, res, next) => {
  return res.status(OK).json({ message: "OK" });
});

app.get(
  "/health",
  catchErrors(async (req, res, next) => {
    res.status(OK).json({ message: "OK" });
  }),
);

//* Auth Routes
app.use("/api/v1/auth", authRouter);

//* Seller Routes
app.use("/api/v1/seller", sellerRouter);

//* Collector Routes
app.use("/api/v1/collector", collectorRouter);

//* Protected Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/sessions", sessionRoutes);

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT} in ${NODE_ENV} environment`);
  await connectToDatabase();
});
