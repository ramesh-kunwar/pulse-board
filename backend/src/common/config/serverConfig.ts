import "dotenv/config";

const dbURL = process.env.DATABASE_URL;
if (!dbURL) {
  throw new Error("DB URL is Required.");
}

type ServerConfig = {
  PORT: number;
  DATABASE_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  NODE_ENV: string;
};

const SERVER_CONFIG: ServerConfig = {
  PORT: Number(process.env.PORT) || 4000,
  DATABASE_URL: dbURL,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  NODE_ENV: process.env.NODE_ENV!,
};
export default SERVER_CONFIG;
