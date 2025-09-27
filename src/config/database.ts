import mongoose from "mongoose";
require("dotenv").config();

export default async function connect() {
  if (process.env.DB_URI) {
    try {
      await mongoose.connect(process.env.DB_URI);
      console.log("Database connected!");
    } catch {
      console.log("Failed to connect to database!");
    }
  } else {
    console.log("uri not found!")
  }
};
