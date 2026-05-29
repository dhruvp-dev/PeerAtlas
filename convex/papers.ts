import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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
      branch: args.branch,
      branchSlug: args.branchSlug,
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

// Retrieve a single paper by ID
export const get = query({
  args: { id: v.id("papers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
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
    let papers = [];
    const qTerm = args.query.trim();

    if (qTerm) {
      // 1. Perform full-text search matching on the subject field
      papers = await ctx.db
        .query("papers")
        .withSearchIndex("search_papers", (q) => q.search("subject", qTerm))
        .take(500);
    } else {
      // 2. Fetch the latest papers
      papers = await ctx.db.query("papers").order("desc").take(500);
    }

    // Apply multi-select filter arguments
    return papers.filter((paper) => {
      if (args.branches && args.branches.length > 0 && !args.branches.includes(paper.branchSlug)) {
        return false;
      }
      if (args.semesters && args.semesters.length > 0 && !args.semesters.includes(paper.semester)) {
        return false;
      }
      if (args.sessions && args.sessions.length > 0 && !args.sessions.includes(paper.session ?? "")) {
        return false;
      }
      if (args.years && args.years.length > 0 && !args.years.includes(paper.year)) {
        return false;
      }
      return true;
    });
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
    const papers = await ctx.db.query("papers").collect();
    const views = await ctx.db.query("paperViews").collect();
    const searches = await ctx.db.query("searchLogs").collect();

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
    const searches = await ctx.db.query("searchLogs").collect();
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
    const views = await ctx.db.query("paperViews").collect();
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
