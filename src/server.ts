import app from "./app";
import connect from "./config/database";

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  await connect();
  app.listen(PORT, () => {
    console.log(`Server is running at on port ${PORT}`);
  });
}

bootstrap()
