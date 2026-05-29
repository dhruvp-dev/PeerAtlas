import fs from "fs";
import path from "path";
import { ConvexHttpClient } from "convex/browser";

// ANSI Terminal styling helper
const styles = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  bold: "\x1b[1m",
};

// 1. Load local environment variables manually to find Convex endpoints
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

async function main() {
  console.log(`${styles.bold}${styles.cyan}=== Starting PeerAtlas Paper Ingestion ===${styles.reset}\n`);

  loadEnv();

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.error(`${styles.red}Error: NEXT_PUBLIC_CONVEX_URL is not defined in .env.local${styles.reset}`);
    process.exit(1);
  }

  console.log(`Connecting to Convex Backend: ${styles.bold}${convexUrl}${styles.reset}`);
  const client = new ConvexHttpClient(convexUrl);

  const workspaceRoot = "/home/dhruv_user/My_Cooking/Peeratlas";
  const outputDir = path.join(workspaceRoot, "output");

  if (!fs.existsSync(outputDir)) {
    console.error(`${styles.red}Error: Output directory not found at ${outputDir}${styles.reset}`);
    process.exit(1);
  }

  // Scan output subdirectories
  const subdirs = fs
    .readdirSync(outputDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  console.log(`Found ${styles.bold}${subdirs.length}${styles.reset} output directories to process.`);

  let totalProcessed = 0;
  let totalUploaded = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const subdir of subdirs) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Processing folder: ${styles.bold}${subdir}${styles.reset}`);

    const papersJsonPath = path.join(outputDir, subdir, "convex", "papers.json");
    if (!fs.existsSync(papersJsonPath)) {
      console.log(`${styles.yellow}Warning: No papers.json found in ${subdir}/convex/. Skipping folder.${styles.reset}`);
      continue;
    }

    let papersData = [];
    try {
      const raw = fs.readFileSync(papersJsonPath, "utf8");
      papersData = JSON.parse(raw);
    } catch (err) {
      console.error(`${styles.red}Failed to read/parse papers.json in ${subdir}: ${err.message}${styles.reset}`);
      totalErrors++;
      continue;
    }

    console.log(`Loaded ${styles.bold}${papersData.length}${styles.reset} papers from papers.json.`);

    let index = 0;
    for (const paper of papersData) {
      index++;
      totalProcessed++;

      try {
        const normalizedSubject = paper.subjectOriginal || paper.subject;
        const normalizedSession =
          paper.session === "Winter" || paper.session === "Summer"
            ? paper.session
            : null;

        // Skip records with missing paths
        if (!paper.exportedPath) {
          console.log(
            `[${index}/${papersData.length}] ${styles.yellow}Warning: exportedPath is missing. Skipping.${styles.reset} - ${normalizedSubject}`
          );
          totalSkipped++;
          continue;
        }

        // Verify if PDF file exists on disk
        const absolutePdfPath = path.join(workspaceRoot, paper.exportedPath);
        if (!fs.existsSync(absolutePdfPath)) {
          console.log(
            `[${index}/${papersData.length}] ${styles.yellow}Warning: File does not exist at ${paper.exportedPath}. Skipping.${styles.reset} - ${normalizedSubject}`
          );
          totalSkipped++;
          continue;
        }

        // Strict validation: check semester type and value
        const semesterNumber = parseInt(paper.semester, 10);
        if (isNaN(semesterNumber) || paper.semester === null || paper.semester === undefined) {
          console.log(
            `[${index}/${papersData.length}] ${styles.yellow}Warning: semester is null/invalid. Skipping.${styles.reset} - ${normalizedSubject}`
          );
          totalSkipped++;
          continue;
        }

        // Strict validation: check year type and value
        const yearNumber = parseInt(paper.year, 10);
        if (isNaN(yearNumber) || paper.year === null || paper.year === undefined) {
          console.log(
            `[${index}/${papersData.length}] ${styles.yellow}Warning: year is null/invalid. Skipping.${styles.reset} - ${normalizedSubject}`
          );
          totalSkipped++;
          continue;
        }

        // Idempotency check: query database to see if paper textHash already exists
        if (paper.textHash) {
          const existing = await client.query("papers:search", {
            query: normalizedSubject,
          });
          const isDuplicate = existing.some((p) => p.textHash === paper.textHash);
          if (isDuplicate) {
            console.log(
              `[${index}/${papersData.length}] ${styles.cyan}Skipped (Idempotent: textHash matches existing database record)${styles.reset} - ${normalizedSubject}`
            );
            totalSkipped++;
            continue;
          }
        }

        // 1. Generate unique authorized upload URL from Convex
        const uploadUrl = await client.mutation("papers:generateUploadUrl");

        // 2. Upload PDF binary to that unique Convex upload URL
        const fileBuffer = fs.readFileSync(absolutePdfPath);
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/pdf",
          },
          body: fileBuffer,
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Convex storage upload failed with status ${response.status}: ${errText}`);
        }

        const { storageId } = await response.json();
        totalUploaded++;

        // 3. Invoke Convex mutation to save the paper record
        const paperId = await client.mutation("papers:insertPaperFromIngestion", {
          branch: paper.branch,
          branchSlug: paper.branchSlug,
          semester: semesterNumber,
          subject: normalizedSubject,
          subjectSlug: paper.subjectSlug,
          year: yearNumber,
          session: normalizedSession,
          pageCount: paper.pageCount,
          keywords: paper.keywords || [],
          searchableText: paper.searchableTextPreview || "",
          textHash: paper.textHash || "",
          storageId: storageId,
        });

        console.log(
          `[${index}/${papersData.length}] ${styles.green}Ingested successfully${styles.reset} - ${normalizedSubject} (${normalizedSession} ${yearNumber}) -> ID: ${paperId}`
        );
      } catch (err) {
        console.error(
          `[${index}/${papersData.length}] ${styles.red}Error ingesting "${paper.subjectOriginal || paper.subject}": ${err.message}${styles.reset}`
        );
        totalErrors++;
      }
    }
  }

  console.log(`\n${styles.bold}${styles.cyan}=== Ingestion Summary ===${styles.reset}`);
  console.log(`Total processed papers: ${totalProcessed}`);
  console.log(`Uploaded & Ingested:    ${styles.green}${totalUploaded}${styles.reset}`);
  console.log(`Skipped (missing/dup):  ${styles.yellow}${totalSkipped}${styles.reset}`);
  console.log(`Errors encountered:     ${styles.red}${totalErrors}${styles.reset}\n`);
}

main().catch((err) => {
  console.error(`${styles.red}Fatal execution error: ${err.message}${styles.reset}`);
  process.exit(1);
});
