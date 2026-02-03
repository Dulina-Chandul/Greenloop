import mongoose from "mongoose";
import { StringFormatParams } from "zod/v4/core";
import { UserRole } from "./src/utils/jwt";

declare global {
  namespace Express {
    interface Request {
      userId: string;
      sessionId: string;
      userRole: UserRole;
    }
  }
}
export {};
