import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import Database from "better-sqlite3";

// Lazy admin seeder routine
let isSeeded = false;

async function seedAdminIfNeeded() {
  if (isSeeded) return;
  try {
    const db = new Database("auth.db");
    
    // Check if user table exists (migrated by our runMigrations startup routine)
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user'").get();
    if (!tableExists) {
      db.close();
      return;
    }

    const row = db.prepare("SELECT count(*) as count FROM user").get() as { count: number };
    db.close();

    if (row && row.count === 0) {
      const email = process.env.ADMIN_EMAIL || "admin@peeratlas.com";
      const password = process.env.ADMIN_PASSWORD || "admin12345";
      
      console.log(`[Better Auth] No users found. Seeding default administrator: ${email}`);
      
      // Use Better Auth public programmatic signUp endpoint to hash password securely
      await auth.api.signUpEmail({
        body: {
          email,
          password,
          name: "Administrator",
        },
      });
      
      console.log("[Better Auth] Default administrator account seeded successfully.");
    }
    isSeeded = true;
  } catch (err: any) {
    console.error("[Better Auth] Admin seeding failed:", err.message);
  }
}

const nextHandler = toNextJsHandler(auth);

export const GET = async (req: Request) => {
  await seedAdminIfNeeded();
  return nextHandler.GET(req);
};

export const POST = async (req: Request) => {
  await seedAdminIfNeeded();
  return nextHandler.POST(req);
};
