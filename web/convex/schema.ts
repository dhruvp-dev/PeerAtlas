import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  papers: defineTable({
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
    textHash: v.optional(v.string()), // SHA-256 text signature for idempotency
    fileId: v.string(), // Convex Storage Id
    fileUrl: v.string(), // Public URL
    createdAt: v.number(),
  })
    .index("by_branch", ["branchSlug"])
    .index("by_semester", ["semester"])
    .index("by_filters", ["branchSlug", "semester", "year"])
    .index("by_hash", ["textHash"])
    .searchIndex("search_papers", {
      searchField: "subject",
      filterFields: ["branchSlug", "semester"],
    }),

  searchLogs: defineTable({
    query: v.string(),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),

  paperViews: defineTable({
    paperId: v.string(),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),

  analyticsEvents: defineTable({
    name: v.string(),
    properties: v.any(),
    anonymousId: v.string(),
    sessionId: v.string(),
    timestamp: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_timestamp", ["timestamp"])
    .index("by_name_timestamp", ["name", "timestamp"]),

  feedback: defineTable({
    category: v.string(),
    rating: v.number(),
    comment: v.optional(v.string()),
    anonymousId: v.string(),
    sessionId: v.string(),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),
});
