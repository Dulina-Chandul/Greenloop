import mongoose from "mongoose";
import { MONGO_URI } from "../constants/env";

const connectToDatabase = async () => {
  try {
    const connection = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    console.log(`MongoDB Connection Error: ${error}`);
    process.exit(1);
  }
};

export default connectToDatabase;
