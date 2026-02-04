import mongoose from "mongoose";
import { thirtyDaysFromNow } from "../../utils/date";

export interface SessionDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  userAgent?: string;
  userRole: "user" | "seller" | "collector";
  createdAt: Date;
  expiresAt: Date;
}

const sessionSchema = new mongoose.Schema<SessionDocument>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    // ref: "User",
    required: true,
    index: true,
  },
  userAgent: {
    type: String,
    required: false,
  },
  userRole: {
    type: String,
    enum: ["user", "seller", "collector"],
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: thirtyDaysFromNow,
  },
});

const SessionModel = mongoose.model<SessionDocument>(
  "Session",
  sessionSchema,
  "sessions",
);
export default SessionModel;
