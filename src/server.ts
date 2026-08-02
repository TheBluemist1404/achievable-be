import "dotenv/config";
import app from "./app";
import connect from "./config/database";
import { connectRedis } from "./config/redis";

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await Promise.all([connect(), connectRedis()]);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

void bootstrap();
