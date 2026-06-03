import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

// Generate an authorized upload URL for files
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Insert a paper from the local ingestion scripts (Idempotent)
export const insertPaperFromIngestion = mutation({
  args: {
    branch: v.string(),
    branchSlug: v.string(),
    semester: v.number(),
    subject: v.string(),
    subjectSlug: v.string(),
    year: v.number(),
    session: v.union(v.literal("Winter"), v.literal("Summer"), v.null()),
    pageCount: v.optional(v.number()),
    keywords: v.optional(v.array(v.string())),
    searchableText: v.optional(v.string()),
    textHash: v.optional(v.string()),
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Idempotency Check: check if paper with this text signature already exists
    if (args.textHash) {
      const existing = await ctx.db
        .query("papers")
        .withIndex("by_hash", (q) => q.eq("textHash", args.textHash))
        .first();
      if (existing) {
        return existing._id;
      }
    }

    // 2. Generate a public URL for the storage asset
    const fileUrl = await ctx.storage.getUrl(args.storageId);
    if (!fileUrl) {
      throw new Error(`Failed to resolve public URL for storageId ${args.storageId}`);
    }

    // 3. Insert paper document into papers table
    const id = await ctx.db.insert("papers", {
      branch: normalizeBranchName(args.branch),
      branchSlug: normalizeBranchSlug(args.branchSlug),
      semester: args.semester,
      subject: args.subject,
      subjectSlug: args.subjectSlug,
      year: args.year,
      session: args.session,
      pageCount: args.pageCount,
      keywords: args.keywords,
      searchableText: args.searchableText,
      textHash: args.textHash,
      fileId: args.storageId,
      fileUrl: fileUrl,
      createdAt: Date.now(),
    });

    return id;
  },
});

function omitSearchableText(paper: Doc<"papers">) {
  const { searchableText, ...rest } = paper;
  return rest as Omit<Doc<"papers">, "searchableText">;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export function normalizeBranchSlug(slug: string): string {
  const s = slug.toLowerCase().trim();
  if (
    s === "computer-science-and-engineering" ||
    s === "computer-engineering" ||
    s === "cse" ||
    s === "cs"
  ) {
    return "computer-science-and-engineering";
  }
  if (
    s === "electronics-and-communication-engineering" ||
    s === "electronics-and-telecommunication-engineering" ||
    s === "electronics-and-telecommunication" ||
    s === "ece" ||
    s === "entc" ||
    s === "extc" ||
    s === "etc"
  ) {
    return "electronics-and-communication-engineering";
  }
  return s;
}

export function normalizeBranchName(name: string): string {
  const n = name.trim();
  const slug = normalizeBranchSlug(slugify(n));
  if (slug === "computer-science-and-engineering") {
    return "Computer Science and Engineering";
  }
  if (slug === "electronics-and-communication-engineering") {
    return "Electronics and Communication Engineering";
  }
  return n;
}

export function parseQuery(rawQuery: string) {
  const semesters: number[] = [];
  const branches: string[] = [];
  let cleanedQuery = rawQuery.toLowerCase();

  // 1. Extract Semesters
  const semesterRegex = /\b(?:sem(?:ester)?\s*([1-8])|s([1-8])|([1-8])(?:st|nd|rd|th)?\s*sem(?:ester)?)\b/gi;
  let match;
  while ((match = semesterRegex.exec(cleanedQuery)) !== null) {
    const semNum = match[1] || match[2] || match[3];
    if (semNum) {
      semesters.push(parseInt(semNum, 10));
    }
  }
  cleanedQuery = cleanedQuery.replace(semesterRegex, " ");

  // 2. Extract Branches matching DB slugs (ordered to match more specific/longer terms first)
  const BRANCH_MAPPINGS = [
    {
      slug: "computer-science-and-business-systems",
      regex: /\b(?:computer-science-and-business-systems|computer\s+science\s+and\s+business\s+systems|csbs)\b/gi
    },
    {
      slug: "computer-science-and-engineering",
      regex: /\b(?:computer-science-and-engineering|computer\s+science\s+and\s+engineering|computer\s+engineering|computer\s+science|cse|cs)\b/gi
    },
    {
      slug: "information-technology",
      regex: /\b(?:information-technology|information\s+technology|it)\b/gi
    },
    {
      slug: "artificial-intelligence-and-machine-learning",
      regex: /\b(?:artificial-intelligence-and-machine-learning|artificial\s+intelligence\s+and\s+machine\s+learning|artificial\s+intelligence|aiml|ai\s*&\s*ml|ai\s+ml|ai\/ml)\b/gi
    },
    {
      slug: "electronics-and-communication-engineering",
      regex: /\b(?:electronics-and-telecommunication-engineering|electronics-and-communication-engineering|electronics\s+and\s+telecommunication\s+engineering|electronics\s+and\s+communication\s+engineering|electronics\s+and\s+telecommunication|electronics\s+and\s+communication|electronics|entc|e\s*&\s*tc|e\s*and\s*tc|ece|extc|etc)\b/gi
    },
    {
      slug: "mechanical-engineering",
      regex: /\b(?:mechanical-engineering|mechanical\s+engineering|mechanical|mech)\b/gi
    },
    {
      slug: "civil-engineering",
      regex: /\b(?:civil-engineering|civil\s+engineering|civil)\b/gi
    },
    {
      slug: "chemical-engineering",
      regex: /\b(?:chemical-engineering|chemical\s+engineering|chemical|chem)\b/gi
    }
  ];

  for (const mapping of BRANCH_MAPPINGS) {
    mapping.regex.lastIndex = 0;
    if (mapping.regex.test(cleanedQuery)) {
      branches.push(mapping.slug);
      mapping.regex.lastIndex = 0;
      cleanedQuery = cleanedQuery.replace(mapping.regex, " ");
    }
  }

  // 3. Remove Noise Words/Phrases
  const noiseRegex = /\b(?:previous\s+year\s+question\s+papers?|previous\s+year\s+papers?|question\s+papers?|bharati\s+vidyapeeth|pyqs?|papers?|bvdu|qp|questions?)\b/gi;
  cleanedQuery = cleanedQuery.replace(noiseRegex, " ");

  // Clean up multiple spaces, trim
  cleanedQuery = cleanedQuery.replace(/\s+/g, " ").trim();

  return {
    query: cleanedQuery,
    branches,
    semesters
  };
}


// Retrieve a single paper by ID
export const get = query({
  args: { id: v.id("papers") },
  handler: async (ctx, args) => {
    const paper = await ctx.db.get(args.id);
    return paper ? omitSearchableText(paper) : null;
  },
});

// Retrieve the latest 4 papers for landing page preview (Lightweight metadata projection)
export const getLatest = query({
  args: {},
  handler: async (ctx) => {
    const papers = await ctx.db.query("papers").order("desc").take(4);
    return papers.map(omitSearchableText);
  },
});

// Retrieve lightweight related papers matching branch and semester (Index backed lookup)
export const getRelated = query({
  args: {
    branchSlug: v.string(),
    semester: v.number(),
    currentPaperId: v.id("papers"),
  },
  handler: async (ctx, args) => {
    const normalizedBranch = normalizeBranchSlug(args.branchSlug);
    const papers = await ctx.db
      .query("papers")
      .withIndex("by_filters", (q) =>
        q.eq("branchSlug", normalizedBranch).eq("semester", args.semester)
      )
      .order("desc")
      .take(10);

    return papers
      .filter((p) => p._id !== args.currentPaperId)
      .slice(0, 3)
      .map(omitSearchableText);
  },
});

// Dynamic Search and Filter query
export const search = query({
  args: {
    query: v.string(),
    branches: v.optional(v.array(v.string())),
    semesters: v.optional(v.array(v.number())),
    sessions: v.optional(v.array(v.string())),
    years: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    const { query: parsedQueryText, branches: parsedBranches, semesters: parsedSemesters } = parseQuery(args.query);
    const qTerm = parsedQueryText.trim();

    const mergedBranches = [
      ...new Set([
        ...(args.branches ?? []).map(normalizeBranchSlug),
        ...parsedBranches.map(normalizeBranchSlug)
      ])
    ];

    const mergedSemesters = [
      ...new Set([
        ...(args.semesters ?? []),
        ...parsedSemesters
      ])
    ];

    let papers = [];

    if (qTerm) {
      // 1. Perform full-text search matching on the subject field
      papers = await ctx.db
        .query("papers")
        .withSearchIndex("search_papers", (q) => q.search("subject", qTerm))
        .take(3000);
    } else {
      // 2. Fetch papers matching parsed/merged branches or semesters if no search text
      let queryObj;
      if (mergedBranches.length > 0) {
        queryObj = ctx.db
          .query("papers")
          .withIndex("by_filters", (q) => q.eq("branchSlug", mergedBranches[0]))
          .order("desc");
      } else if (mergedSemesters.length > 0) {
        queryObj = ctx.db
          .query("papers")
          .withIndex("by_semester", (q) => q.eq("semester", mergedSemesters[0]))
          .order("desc");
      } else {
        queryObj = ctx.db.query("papers").order("desc");
      }
      papers = await queryObj.take(3000);
    }

    // Apply multi-select filter arguments and map to omit searchableText
    return papers
      .filter((paper) => {
        if (mergedBranches.length > 0 && !mergedBranches.includes(paper.branchSlug)) {
          return false;
        }
        if (mergedSemesters.length > 0 && !mergedSemesters.includes(paper.semester)) {
          return false;
        }
        if (args.sessions && args.sessions.length > 0 && !args.sessions.includes(paper.session ?? "")) {
          return false;
        }
        if (args.years && args.years.length > 0 && !args.years.includes(paper.year)) {
          return false;
        }
        return true;
      })
      .map(omitSearchableText);
  },
});

import { paginationOptsValidator } from "convex/server";

export const paginatedSearch = query({
  args: {
    paginationOpts: paginationOptsValidator,
    query: v.string(),
    branches: v.optional(v.array(v.string())),
    semesters: v.optional(v.array(v.number())),
    sessions: v.optional(v.array(v.string())),
    years: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    const { query: parsedQueryText, branches: parsedBranches, semesters: parsedSemesters } = parseQuery(args.query);
    const qTerm = parsedQueryText.trim();

    const mergedBranches = [
      ...new Set([
        ...(args.branches ?? []).map(normalizeBranchSlug),
        ...parsedBranches.map(normalizeBranchSlug)
      ])
    ];

    const mergedSemesters = [
      ...new Set([
        ...(args.semesters ?? []),
        ...parsedSemesters
      ])
    ];

    const hasFilters = mergedBranches.length > 0 || 
                       mergedSemesters.length > 0 || 
                       (args.sessions && args.sessions.length > 0) || 
                       (args.years && args.years.length > 0);

    if (qTerm) {
      // Convex SearchQuery does not support .paginate() or chaining complex dynamic .filter()
      // We fetch top matches and apply filters in memory, returning a correct offset pagination result
      const papers = await ctx.db
        .query("papers")
        .withSearchIndex("search_papers", (q) => q.search("subject", qTerm))
        .take(200);
        
      const filteredPapers = papers.filter((paper) => {
        if (mergedBranches.length > 0 && !mergedBranches.includes(paper.branchSlug)) return false;
        if (mergedSemesters.length > 0 && !mergedSemesters.includes(paper.semester)) return false;
        if (args.sessions && args.sessions.length > 0 && !args.sessions.includes(paper.session ?? "")) return false;
        if (args.years && args.years.length > 0 && !args.years.includes(paper.year)) return false;
        return true;
      });

      const offset = args.paginationOpts.cursor ? parseInt(args.paginationOpts.cursor, 10) : 0;
      const paginatedSlice = filteredPapers.slice(offset, offset + args.paginationOpts.numItems);
      const nextOffset = offset + paginatedSlice.length;
      const isDone = nextOffset >= filteredPapers.length;

      return {
        page: paginatedSlice.map(omitSearchableText),
        isDone: isDone,
        continueCursor: isDone ? "" : nextOffset.toString(),
      };
    } else {
      // Push primary filter criteria to storage using database indexes
      let queryObj;
      if (mergedBranches.length > 0) {
        queryObj = ctx.db
          .query("papers")
          .withIndex("by_filters", (q) => q.eq("branchSlug", mergedBranches[0]))
          .order("desc");
      } else if (mergedSemesters.length > 0) {
        queryObj = ctx.db
          .query("papers")
          .withIndex("by_semester", (q) => q.eq("semester", mergedSemesters[0]))
          .order("desc");
      } else {
        queryObj = ctx.db.query("papers").order("desc");
      }

      if (hasFilters) {
        queryObj = queryObj.filter((q) => {
          const conditions = [];
          if (mergedBranches.length > 0) {
            conditions.push(q.or(...mergedBranches.map((b) => q.eq(q.field("branchSlug"), b))));
          }
          if (mergedSemesters.length > 0) {
            conditions.push(q.or(...mergedSemesters.map((s) => q.eq(q.field("semester"), s))));
          }
          if (args.sessions && args.sessions.length > 0) {
            conditions.push(q.or(...args.sessions.map((s) => q.eq(q.field("session"), s === "None" ? null : s))));
          }
          if (args.years && args.years.length > 0) {
            conditions.push(q.or(...args.years.map((y) => q.eq(q.field("year"), y))));
          }
          return q.and(...conditions);
        }) as any;
      }

      const paginatedResults = await queryObj.paginate(args.paginationOpts);
      return {
        ...paginatedResults,
        page: paginatedResults.page.map(omitSearchableText),
      };
    }
  },
});

// Autocomplete Search Query for lightweight dropdown suggestions
export const autocomplete = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const { query: parsedQueryText, branches: parsedBranches, semesters: parsedSemesters } = parseQuery(args.query);
    const q = parsedQueryText.trim();
    const normalizedBranches = parsedBranches.map(normalizeBranchSlug);
    if (!q && normalizedBranches.length === 0 && parsedSemesters.length === 0) return [];

    let papers = [];
    if (q) {
      papers = await ctx.db
        .query("papers")
        .withSearchIndex("search_papers", (q2) => q2.search("subject", q))
        .take(50);
    } else {
      // If query text is empty but we have parsed filters, query by them
      let queryObj;
      if (normalizedBranches.length > 0) {
        queryObj = ctx.db
          .query("papers")
          .withIndex("by_filters", (q2) => q2.eq("branchSlug", normalizedBranches[0]))
          .order("desc");
      } else if (parsedSemesters.length > 0) {
        queryObj = ctx.db
          .query("papers")
          .withIndex("by_semester", (q2) => q2.eq("semester", parsedSemesters[0]))
          .order("desc");
      } else {
        queryObj = ctx.db.query("papers").order("desc");
      }
      papers = await queryObj.take(50);
    }

    // Now filter matches in-memory by parsed filters if there was a text query or multiple filters
    papers = papers.filter((paper) => {
      if (normalizedBranches.length > 0 && !normalizedBranches.includes(paper.branchSlug)) return false;
      if (parsedSemesters.length > 0 && !parsedSemesters.includes(paper.semester)) return false;
      return true;
    });

    // Deduplicate by subject name to avoid showing the same subject multiple times
    const seen = new Set<string>();
    const results = [];
    
    for (const p of papers) {
      const key = p.subject.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        results.push({
          _id: p._id,
          subject: p.subject,
          branchSlug: p.branchSlug,
          semester: p.semester,
          year: p.year,
          session: p.session,
        });
        if (results.length >= 6) break;
      }
    }
    
    return results;
  },
});

// Log search query for analytics
export const logSearch = mutation({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (!args.query.trim()) return;
    await ctx.db.insert("searchLogs", {
      query: args.query.trim(),
      timestamp: Date.now(),
    });
  },
});

// Log paper view for analytics
export const logPaperView = mutation({
  args: { paperId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("paperViews", {
      paperId: args.paperId,
      timestamp: Date.now(),
    });
  },
});

// Update a paper's metadata (Admin CRUD)
export const updatePaper = mutation({
  args: {
    id: v.id("papers"),
    subject: v.string(),
    branch: v.string(),
    branchSlug: v.string(),
    semester: v.number(),
    session: v.union(v.literal("Winter"), v.literal("Summer"), v.null()),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    data.branch = normalizeBranchName(data.branch);
    data.branchSlug = normalizeBranchSlug(data.branchSlug);
    await ctx.db.patch(id, data);
    return id;
  },
});

// Delete a paper and clean up storage (Admin CRUD)
export const deletePaper = mutation({
  args: { id: v.id("papers") },
  handler: async (ctx, args) => {
    const paper = await ctx.db.get(args.id);
    if (paper) {
      // Delete the physical PDF file asset from Convex storage to save space
      try {
        await ctx.storage.delete(paper.fileId);
      } catch (err) {
        console.error(`Failed to delete storage asset for ${paper.fileId}:`, err);
      }
      await ctx.db.delete(args.id);
    }
    return args.id;
  },
});

// Get aggregate stats (Admin Analytics)
export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    // Cap at a high limit to avoid unbounded document scan timeouts, while preserving correctness
    const papers = await ctx.db.query("papers").take(10000);
    const views = await ctx.db.query("paperViews").take(10000);
    const searches = await ctx.db.query("searchLogs").take(10000);

    return {
      totalPapers: papers.length,
      totalViews: views.length,
      totalSearches: searches.length,
    };
  },
});

// Get top searched queries (Admin Analytics)
export const getTopSearches = query({
  args: {},
  handler: async (ctx) => {
    // Only analyze the last 5,000 searches to protect database reads at scale
    const searches = await ctx.db
      .query("searchLogs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(5000);
      
    const counts: Record<string, number> = {};

    searches.forEach((s) => {
      const q = s.query.toLowerCase().trim();
      counts[q] = (counts[q] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  },
});

// Get top viewed papers (Admin Analytics)
export const getTopViewed = query({
  args: {},
  handler: async (ctx) => {
    // Only analyze the last 5,000 views to protect database reads at scale
    const views = await ctx.db
      .query("paperViews")
      .withIndex("by_timestamp")
      .order("desc")
      .take(5000);
      
    const counts: Record<string, number> = {};

    views.forEach((v) => {
      counts[v.paperId] = (counts[v.paperId] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const result = [];
    for (const [paperId, count] of sorted) {
      try {
        const paper = (await ctx.db.get(paperId as any)) as any;
        if (paper && "subject" in paper) {
          result.push({
            id: paperId,
            subject: paper.subject,
            branch: paper.branch,
            semester: paper.semester,
            year: paper.year,
            session: paper.session,
            views: count,
          });
        }
      } catch (e) {
        // Skip orphaned views if paper was deleted
      }
    }
    return result;
  },
});

// Lightweight query for sitemap generation
export const getAllIds = query({
  args: {},
  handler: async (ctx) => {
    const papers = await ctx.db.query("papers").order("desc").collect();
    return papers.map((p) => ({
      _id: p._id,
      createdAt: p.createdAt,
    }));
  },
});
