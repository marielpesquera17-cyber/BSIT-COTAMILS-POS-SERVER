import "dotenv/config";

const ENV = Object.freeze({
  server: {
    port: process.env.PORT || 3000,
    node_env: process.env.NODE_ENV,
  },
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database_name: process.env.DB_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  cloudinary: {
    name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    secret_key: process.env.CLOUDINARY_SECRECT_KEY,
  },
  url: process.env.FRONTEND_URL || "http://localhost:5173",
});

export default ENV;
