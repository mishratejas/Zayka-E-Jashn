import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB=async()=>{
  try{
    const fullURI=`${process.env.MONGODB_URI}/${DB_NAME}?retryWrites=true&w=majority`;
    console.log("Connecting to:", fullURI);
    const connectionInstance=await mongoose.connect(fullURI, {
     // useNewUrlParser: true,
      //useUnifiedTopology: true,
    });

    console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
