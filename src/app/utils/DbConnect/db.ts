import mongoose from "mongoose";

import { logger } from "../logger";
import { envVariable } from "../../config";


async function server() {
  try {
    // Connect to MongoDB
    await mongoose.connect(envVariable.MONGO_URI as string);
    logger.info("🛢 Database connected");



    // Start the server
    // httpServer.listen(envVariable.PORT, () => {
    //   logger.info(`🚀 Hotel booking app listening on port ${envVariable.PORT}`);
    // });
  } catch (error) {
    logger.error("❌ Failed to connect to database", error);
    process.exit(1);
  }
}

server();
