import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { createClient } from "@libsql/client";

// Lazy admin seeder routine
let isSeeded = false;

async function seedAdminIfNeeded() {
  if (isSeeded) return;
  try {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    
    // Check if user table exists
    const tableExists = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user'");
    if (tableExists.rows.length === 0) {
      return;
    }

    const result = await db.execute("SELECT count(*) as count FROM user");
    const count = Number(result.rows[0]?.count ?? result.rows[0]?.[0] ?? 0);

    if (count === 0) {
      const email = process.env.ADMIN_EMAIL;
      const password = process.env.ADMIN_PASSWORD;

      if (!email || !password) {
        console.warn("[Better Auth] Cannot seed admin: ADMIN_EMAIL or ADMIN_PASSWORD environment variables are not set.");
        return;
      }
      
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
