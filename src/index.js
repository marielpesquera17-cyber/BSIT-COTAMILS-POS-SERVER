import httpServer from "./app.js";
import { connectCloudinary } from "./config/cloudinary.js";
import { checkConnection } from "./config/db.js";
import ENV from "./utils/env.js";

const PORT = ENV.server.port || 3000;
(async function startServer() {
  try {
    await checkConnection();
    await connectCloudinary();
    httpServer.listen(PORT, () => {
      console.log(`Server is ready on PORT: ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
})();
