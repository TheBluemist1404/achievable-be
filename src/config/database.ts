import mongoose from "mongoose";
import "dotenv/config";

export default async function connect(): Promise<void> {
  if (!process.env.DB_URI) {
    throw new Error("DB_URI is not configured");
  }

  await mongoose.connect(process.env.DB_URI);
  console.log("Database connected!");
}
