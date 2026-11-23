import fs from "fs";
import path from "path";
import { ConvexHttpClient } from "convex/browser";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim();
      }
    });
  }
}

async function uploadTimetableToConvex() {
  console.log("=== Uploading Timetable PDF to Convex DB ===");
  loadEnv();

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "http://127.0.0.1:3210";
  console.log(`Connecting to Convex at: ${convexUrl}`);
  const client = new ConvexHttpClient(convexUrl);

  const pdfPath = path.join(
    process.cwd(),
    "public/assets/College of Engineering - Pune Navi Mumbai Campus Theory Timetable Winter - 2026.pdf"
  );

  if (!fs.existsSync(pdfPath)) {
    console.error(`Error: Timetable PDF file not found at ${pdfPath}`);
    process.exit(1);
  }

  // 1. Generate Upload URL from Convex
  console.log("Generating authorized upload URL...");
  const uploadUrl = await client.mutation("papers:generateUploadUrl");

  // 2. Read PDF file buffer and upload to Convex Storage
  console.log("Uploading PDF file binary to Convex Storage...");
  const fileBuffer = fs.readFileSync(pdfPath);
  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/pdf",
    },
    body: fileBuffer,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Convex storage upload failed (${uploadRes.status}): ${errText}`);
  }

  const { storageId } = await uploadRes.json();
  console.log(`Upload successful! Storage ID: ${storageId}`);

  // 3. Insert record into papers table in Convex DB
  console.log("Inserting record into Convex DB papers table...");
  const paperId = await client.mutation("papers:insertPaperFromIngestion", {
    branch: "College of Engineering",
    branchSlug: "college-of-engineering",
    semester: 0,
    subject: "Winter 2026 Theory Timetable",
    subjectSlug: "winter-2026-theory-timetable",
    year: 2026,
    session: "Winter",
    pageCount: 1,
    keywords: ["timetable", "winter 2026", "exam schedule", "theory timetable"],
    searchableText: "College of Engineering Pune Navi Mumbai Campus Theory Timetable Winter 2026",
    textHash: `timetable-winter-2026-${Date.now()}`,
    storageId: storageId,
  });

  // 4. Fetch the created paper record to retrieve its public fileUrl
  const paperRecord = await client.query("papers:get", { id: paperId });
  const fileUrl = paperRecord.fileUrl;

  console.log(`\n==============================================`);
  console.log(`Convex Paper ID: ${paperId}`);
  console.log(`Convex Storage ID: ${storageId}`);
  console.log(`Convex Public File URL: ${fileUrl}`);
  console.log(`==============================================\n`);

  // 5. Update .env.local with NEXT_PUBLIC_TIMETABLE_PDF_URL
  const envPath = path.join(process.cwd(), ".env.local");
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

  if (envContent.includes("NEXT_PUBLIC_TIMETABLE_PDF_URL=")) {
    envContent = envContent.replace(
      /NEXT_PUBLIC_TIMETABLE_PDF_URL=.*/,
      `NEXT_PUBLIC_TIMETABLE_PDF_URL="${fileUrl}"`
    );
  } else {
    envContent += `\nNEXT_PUBLIC_TIMETABLE_PDF_URL="${fileUrl}"\n`;
  }

  fs.writeFileSync(envPath, envContent, "utf8");
  console.log(`Updated web/.env.local with NEXT_PUBLIC_TIMETABLE_PDF_URL="${fileUrl}"`);
}

uploadTimetableToConvex().catch((err) => {
  console.error("Upload error:", err.message);
  process.exit(1);
});
