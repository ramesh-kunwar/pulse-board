import { drizzle } from "drizzle-orm/node-postgres";
import SERVER_CONFIG from "./common/config/serverConfig.js";
import * as schema from "./db/schema.js";

export const db = drizzle(SERVER_CONFIG.DATABASE_URL, { schema });
