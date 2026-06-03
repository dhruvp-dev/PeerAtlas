import { describe, it, expect } from "vitest";
import { parseQuery } from "../../convex/papers";

describe("parseQuery Helper Function", () => {
  it("should return the exact query text if no semester or branch is specified", () => {
    const result = parseQuery("database management systems");
    expect(result.query).toBe("database management systems");
    expect(result.branches).toEqual([]);
    expect(result.semesters).toEqual([]);
  });

  it("should normalize the query text to lowercase", () => {
    const result = parseQuery("DATABASE Management SYSTEMS");
    expect(result.query).toBe("database management systems");
  });

  it("should extract semester patterns correctly", () => {
    const testCases = [
      { input: "database sem 3", expectedSem: [3] },
      { input: "semester 4 cse", expectedSem: [4] },
      { input: "dsa 3rd sem", expectedSem: [3] },
      { input: "1st semester chemistry", expectedSem: [1] },
      { input: "sem 5 math", expectedSem: [5] },
      { input: "math s8", expectedSem: [8] },
      { input: "s1 chem", expectedSem: [1] },
      { input: "sem8 physics", expectedSem: [8] },
    ];

    for (const tc of testCases) {
      const result = parseQuery(tc.input);
      expect(result.semesters).toEqual(tc.expectedSem);
    }
  });

  it("should extract branch patterns and abbreviations correctly mapping to DB slugs", () => {
    const testCases = [
      { input: "cse database", expectedBranches: ["computer-science-and-engineering"] },
      { input: "cs database", expectedBranches: ["computer-science-and-engineering"] },
      { input: "computer science database", expectedBranches: ["computer-science-and-engineering"] },
      { input: "computer engineering database", expectedBranches: ["computer-science-and-engineering"] },
      { input: "information technology network", expectedBranches: ["information-technology"] },
      { input: "it network", expectedBranches: ["information-technology"] },
      { input: "aiml deep learning", expectedBranches: ["artificial-intelligence-and-machine-learning"] },
      { input: "ai ml deep learning", expectedBranches: ["artificial-intelligence-and-machine-learning"] },
      { input: "ai&ml deep learning", expectedBranches: ["artificial-intelligence-and-machine-learning"] },
      { input: "artificial intelligence deep learning", expectedBranches: ["artificial-intelligence-and-machine-learning"] },
      { input: "civil surveying", expectedBranches: ["civil-engineering"] },
      { input: "mech thermodynamics", expectedBranches: ["mechanical-engineering"] },
      { input: "entc signals", expectedBranches: ["electronics-and-communication-engineering"] },
      { input: "e&tc signals", expectedBranches: ["electronics-and-communication-engineering"] },
      { input: "electronics and telecommunication signals", expectedBranches: ["electronics-and-communication-engineering"] },
      { input: "csbs database", expectedBranches: ["computer-science-and-business-systems"] },
      { input: "computer science and business systems database", expectedBranches: ["computer-science-and-business-systems"] },
    ];

    for (const tc of testCases) {
      const result = parseQuery(tc.input);
      expect(result.branches).toEqual(tc.expectedBranches);
    }
  });

  it("should remove noise words and phrases", () => {
    const testCases = [
      { input: "dbms question paper", expectedQuery: "dbms" },
      { input: "dbms pyq", expectedQuery: "dbms" },
      { input: "dbms paper", expectedQuery: "dbms" },
      { input: "dbms qp", expectedQuery: "dbms" },
      { input: "dbms previous year paper", expectedQuery: "dbms" },
      { input: "dbms questions", expectedQuery: "dbms" },
      { input: "dbms question", expectedQuery: "dbms" },
      { input: "bvdu database", expectedQuery: "database" },
      { input: "bharati vidyapeeth database", expectedQuery: "database" },
    ];

    for (const tc of testCases) {
      const result = parseQuery(tc.input);
      expect(result.query).toBe(tc.expectedQuery);
    }
  });

  it("should extract both branch and semester from mixed queries and handle noise words", () => {
    const testCases = [
      {
        input: "cse sem 5 dbms pyq",
        expectedQuery: "dbms",
        expectedBranches: ["computer-science-and-engineering"],
        expectedSem: [5],
      },
      {
        input: "it sem 3 agile methodologies question paper",
        expectedQuery: "agile methodologies",
        expectedBranches: ["information-technology"],
        expectedSem: [3],
      },
    ];

    for (const tc of testCases) {
      const result = parseQuery(tc.input);
      expect(result.query).toBe(tc.expectedQuery);
      expect(result.branches).toEqual(tc.expectedBranches);
      expect(result.semesters).toEqual(tc.expectedSem);
    }
  });

  it("should handle empty or whitespace-only queries", () => {
    const result = parseQuery("   ");
    expect(result.query).toBe("");
    expect(result.branches).toEqual([]);
    expect(result.semesters).toEqual([]);
  });

  it("should handle queries with only branch and semester", () => {
    const result = parseQuery("cse sem 4");
    expect(result.query).toBe("");
    expect(result.branches).toEqual(["computer-science-and-engineering"]);
    expect(result.semesters).toEqual([4]);
  });
});
