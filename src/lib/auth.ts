import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import { getMigrations } from "better-auth/db/migration";

const db = new Database("auth.db");

export const auth = betterAuth({
  database: db,
  emailAndPassword: {
    enabled: true,
  },
});

// Programmatic schema migration
async function initDatabase() {
  try {
    console.log("Checking and migrating Better Auth database tables...");
    const { runMigrations } = await getMigrations(auth.options);
    await runMigrations();
    console.log("Database migrations completed successfully.");
  } catch (err: any) {
    console.error("Database auto-migration error (can ignore in dev/CLI contexts):", err.message);
  }
}

// Fire off migration asynchronously on import
initDatabase();
