import { betterAuth } from "better-auth";
import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const auth = betterAuth({
  database: db,
  emailAndPassword: {
    enabled: true,
  },
});
