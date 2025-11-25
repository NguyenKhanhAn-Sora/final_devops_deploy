import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://nguyenkhanhan1803:180311202@expressdevops.bnw1dgz.mongodb.net/express_devops?appName=expressDevops"
  );
  console.log("Mongo Atlas connected!!!");
};
