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
import listingRouter from "./routes/listing/listing.route";
import { createServer } from "node:http";
import { io } from "./utils/socket";
import bidRouter from "./routes/bid/bid.router";

const app = express();
const httpServer = createServer(app);

io.attach(httpServer, {
  cors: {
    origin: APP_ORIGIN,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("collector:join", (data) => {
    const { collectorId, location } = data;
    socket.join(`collector:${collectorId}`);
    console.log(`Collector ${collectorId} joined with location: ${location}`);
  });

  socket.on("seller:join", (data) => {
    const { sellerId } = data;
    socket.join(`seller:${sellerId}`);
    console.log(`Seller ${sellerId} joined for bid notifications`);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

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

//* Listing Routes
app.use("/api/v1/seller/listing", listingRouter);
app.use("/api/v1/listings", listingRouter);

//* Collector Routes
app.use("/api/v1/collector", collectorRouter);

//* Bid Routes
app.use("/api/v1/bids", bidRouter);

//* Protected Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/sessions", sessionRoutes);

app.use(errorHandler);

httpServer.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT} in ${NODE_ENV} environment`);
  await connectToDatabase();
});
