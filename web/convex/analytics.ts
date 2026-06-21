import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Log a generic tracking event
export const logEvent = mutation({
  args: {
    name: v.string(),
    properties: v.any(),
    anonymousId: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("analyticsEvents", {
      name: args.name,
      properties: args.properties,
      anonymousId: args.anonymousId,
      sessionId: args.sessionId,
      timestamp: Date.now(),
    });
  },
});

// Log user feedback
export const logFeedback = mutation({
  args: {
    category: v.string(),
    rating: v.number(),
    comment: v.optional(v.string()),
    anonymousId: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("feedback", {
      category: args.category,
      rating: args.rating,
      comment: args.comment,
      anonymousId: args.anonymousId,
      sessionId: args.sessionId,
      timestamp: Date.now(),
    });
  },
});

// Aggregate data for Academic, Product, Founder, and Exam dashboards
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    // 1. Fetch last 5000 events to protect reads and prevent timeout
    const events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_timestamp")
      .order("desc")
      .take(5000);

    // 2. Fetch last 500 feedback items
    const feedbacks = await ctx.db
      .query("feedback")
      .withIndex("by_timestamp")
      .order("desc")
      .take(500);

    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // --- Helper to parse date strings (YYYY-MM-DD) from timestamps in local time ---
    const formatDate = (timestamp: number) => {
      const d = new Date(timestamp);
      // Format as YYYY-MM-DD
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // --- 1. ACADEMIC DASHBOARD STATS ---
    const branchCounts: Record<string, number> = {};
    const subjectCounts: Record<string, number> = {};
    const semesterCounts: Record<number, number> = {};
    const downloadedPapers: Record<string, { title: string; count: number }> = {};
    const viewedPapers: Record<string, { title: string; count: number }> = {};
    const sharedPapers: Record<string, { title: string; count: number }> = {};
    const searchedTerms: Record<string, number> = {};

    // --- 2. PRODUCT DASHBOARD STATS ---
    const dauSet = new Set<string>(); // DAU last 24h
    const wauSet = new Set<string>(); // WAU last 7 days
    const dailyActiveUsers: Record<string, Set<string>> = {}; // unique users per day for last 7 days
    const userSearches: Record<string, number> = {}; // searches per user distinct_id
    const userDownloads: Record<string, number> = {}; // downloads per user distinct_id
    const sessionEvents: Record<string, number> = {}; // events per sessionId
    const userSessions: Record<string, Set<string>> = {}; // sessions per anonymousId

    // --- 3. FOUNDER DASHBOARD STATS ---
    let portfolioClicks = 0;
    let gitHubClicks = 0;
    const trafficSources: Record<string, number> = {};
    let googleSearchTraffic = 0;

    // --- 4. EXAM INSIGHTS ---
    const trendingSubjectsThisWeek: Record<string, number> = {};
    const trendingPapersThisWeek: Record<string, { title: string; count: number }> = {};
    const downloadSpikes: Record<string, number> = {};
    const branchActivityThisWeek: Record<string, number> = {};

    // Iterate through all events to calculate metrics
    events.forEach((event) => {
      const props = event.properties || {};
      const name = event.name;
      const t = event.timestamp;
      const anonId = event.anonymousId;
      const sessId = event.sessionId;

      // Group active users
      if (t >= oneWeekAgo) {
        wauSet.add(anonId);
        const dayStr = formatDate(t);
        if (!dailyActiveUsers[dayStr]) {
          dailyActiveUsers[dayStr] = new Set<string>();
        }
        dailyActiveUsers[dayStr].add(anonId);
      }
      if (t >= oneDayAgo) {
        dauSet.add(anonId);
      }

      // Track sessions per user
      if (anonId && sessId) {
        if (!userSessions[anonId]) {
          userSessions[anonId] = new Set<string>();
        }
        userSessions[anonId].add(sessId);
      }

      // Track events per session for bounce rate (bounce = sessions with exactly 1 event)
      if (sessId) {
        sessionEvents[sessId] = (sessionEvents[sessId] || 0) + 1;
      }

      // Aggregate specific events
      if (name === "paper_viewed") {
        const branch = props.branch || "Unknown";
        const subject = props.subject || "Unknown";
        const sem = Number(props.semester) || 0;
        const paperId = props.paperId || "Unknown";
        const paperTitle = props.paperTitle || subject;

        branchCounts[branch] = (branchCounts[branch] || 0) + 1;
        subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
        if (sem > 0) {
          semesterCounts[sem] = (semesterCounts[sem] || 0) + 1;
        }

        if (!viewedPapers[paperId]) {
          viewedPapers[paperId] = { title: paperTitle, count: 0 };
        }
        viewedPapers[paperId].count++;

        if (t >= oneWeekAgo) {
          trendingSubjectsThisWeek[subject] = (trendingSubjectsThisWeek[subject] || 0) + 1;
          if (!trendingPapersThisWeek[paperId]) {
            trendingPapersThisWeek[paperId] = { title: paperTitle, count: 0 };
          }
          trendingPapersThisWeek[paperId].count++;
          branchActivityThisWeek[branch] = (branchActivityThisWeek[branch] || 0) + 1;
        }
      } else if (name === "paper_downloaded") {
        const paperId = props.paperId || "Unknown";
        const paperTitle = props.paperTitle || props.subject || "Unknown";
        const subject = props.subject || "Unknown";
        const branch = props.branch || "Unknown";

        if (!downloadedPapers[paperId]) {
          downloadedPapers[paperId] = { title: paperTitle, count: 0 };
        }
        downloadedPapers[paperId].count++;

        userDownloads[anonId] = (userDownloads[anonId] || 0) + 1;

        if (t >= oneWeekAgo) {
          trendingSubjectsThisWeek[subject] = (trendingSubjectsThisWeek[subject] || 0) + 2; // Weight downloads higher
          if (!trendingPapersThisWeek[paperId]) {
            trendingPapersThisWeek[paperId] = { title: paperTitle, count: 0 };
          }
          trendingPapersThisWeek[paperId].count += 2;
          branchActivityThisWeek[branch] = (branchActivityThisWeek[branch] || 0) + 2;

          const dayStr = formatDate(t);
          downloadSpikes[dayStr] = (downloadSpikes[dayStr] || 0) + 1;
        }
      } else if (name === "search_performed") {
        const queryText = (props.query || "").trim().toLowerCase();
        if (queryText) {
          searchedTerms[queryText] = (searchedTerms[queryText] || 0) + 1;
        }
        userSearches[anonId] = (userSearches[anonId] || 0) + 1;
      } else if (name === "paper_shared") {
        const paperId = props.paperId || "Unknown";
        const paperTitle = props.paperTitle || props.subject || "Unknown";
        if (!sharedPapers[paperId]) {
          sharedPapers[paperId] = { title: paperTitle, count: 0 };
        }
        sharedPapers[paperId].count++;
      } else if (name === "external_link_clicked") {
        const dest = props.destination;
        if (dest === "portfolio") portfolioClicks++;
        else if (dest === "github") gitHubClicks++;
      }

      // Track traffic source from referrer
      const referrer = props.referrer || "";
      if (referrer) {
        let source = "Direct / Bookmark";
        try {
          const url = new URL(referrer);
          const hostname = url.hostname;
          if (hostname.includes("google.com")) {
            source = "Google";
            googleSearchTraffic++;
          } else if (hostname.includes("github.com")) {
            source = "GitHub";
          } else if (hostname.includes("linkedin.com")) {
            source = "LinkedIn";
          } else if (hostname.includes("instagram.com") || hostname.includes("t.co") || hostname.includes("facebook.com")) {
            source = "Social Media";
          } else {
            source = hostname;
          }
        } catch (e) {
          source = referrer;
        }
        trafficSources[source] = (trafficSources[source] || 0) + 1;
      } else {
        trafficSources["Direct / Bookmark"] = (trafficSources["Direct / Bookmark"] || 0) + 1;
      }
    });

    // Compute Bounce Rate (sessions with only 1 event / total sessions)
    const totalSessions = Object.keys(sessionEvents).length;
    const bounceSessions = Object.values(sessionEvents).filter((cnt) => cnt === 1).length;
    const bounceRate = totalSessions > 0 ? Math.round((bounceSessions / totalSessions) * 100) : 0;

    // Compute Returning Visitors (users with >1 session)
    let returningVisitors = 0;
    Object.values(userSessions).forEach((sessions) => {
      if (sessions.size > 1) returningVisitors++;
    });

    // Compute Average Searches & Downloads per active user
    const uniqueSearchers = Object.keys(userSearches).length;
    const totalSearches = Object.values(userSearches).reduce((a, b) => a + b, 0);
    const searchesPerUser = uniqueSearchers > 0 ? Number((totalSearches / uniqueSearchers).toFixed(1)) : 0;

    const uniqueDownloaders = Object.keys(userDownloads).length;
    const totalDownloads = Object.values(userDownloads).reduce((a, b) => a + b, 0);
    const downloadsPerUser = uniqueDownloaders > 0 ? Number((totalDownloads / uniqueDownloaders).toFixed(1)) : 0;

    // Convert daily sets to numbers for DAU chart
    const dailyActiveCounts = Object.entries(dailyActiveUsers).map(([date, users]) => ({
      date,
      count: users.size,
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Convert spikes to chartable array
    const downloadSpikesArray = Object.entries(downloadSpikes).map(([date, count]) => ({
      date,
      count,
    })).sort((a, b) => a.date.localeCompare(b.date));

    return {
      academic: {
        topBranches: Object.entries(branchCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        topSubjects: Object.entries(subjectCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        topSemesters: Object.entries(semesterCounts)
          .map(([sem, count]) => ({ semester: Number(sem), count }))
          .sort((a, b) => b.count - a.count),
        mostDownloaded: Object.entries(downloadedPapers)
          .map(([id, item]) => ({ id, title: item.title, count: item.count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        mostViewed: Object.entries(viewedPapers)
          .map(([id, item]) => ({ id, title: item.title, count: item.count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        mostShared: Object.entries(sharedPapers)
          .map(([id, item]) => ({ id, title: item.title, count: item.count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        mostSearched: Object.entries(searchedTerms)
          .map(([query, count]) => ({ query, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
      },
      product: {
        dau: dauSet.size,
        wau: wauSet.size,
        searchesPerUser,
        downloadsPerUser,
        bounceRate,
        returningVisitors,
        dailyActiveCounts,
      },
      founder: {
        portfolioClicks,
        gitHubClicks,
        feedbackSubmissions: feedbacks.length,
        feedbacks: feedbacks.map((f) => ({
          id: f._id,
          category: f.category,
          rating: f.rating,
          comment: f.comment,
          timestamp: f.timestamp,
        })),
        trafficSources: Object.entries(trafficSources)
          .map(([source, count]) => ({ source, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        googleSearchTraffic,
      },
      examInsights: {
        trendingSubjects: Object.entries(trendingSubjectsThisWeek)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        trendingPapers: Object.entries(trendingPapersThisWeek)
          .map(([id, item]) => ({ id, title: item.title, count: item.count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        downloadSpikes: downloadSpikesArray,
        branchActivity: Object.entries(branchActivityThisWeek)
          .map(([branch, count]) => ({ branch, count }))
          .sort((a, b) => b.count - a.count),
      },
    };
  },
});
