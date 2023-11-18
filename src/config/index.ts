import { config } from "dotenv";
config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === "true";
export const { NODE_ENV, PORT, SECRET_KEY, LOG_FORMAT, LOG_DIR, ORIGIN } = process.env;
export const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_DATABASE } = process.env;
export const { RATE_DELAY, RATE_LIMIT } = process.env; 
export const { MAX_SIZE_FILE_UPLOAD } = process.env; 
export const { GOOGLE_EMAIL, GOOGLE_APP_PASSWORD } = process.env; 