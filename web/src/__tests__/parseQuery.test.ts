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
    ];

    for (const tc of testCases) {
      const result = parseQuery(tc.input);
      expect(result.semesters).toEqual(tc.expectedSem);
    }
  });

  it("should extract branch patterns and abbreviations correctly", () => {
    const testCases = [
      { input: "cse database", expectedBranches: ["computer-science-and-engineering"] },
      { input: "information technology network", expectedBranches: ["information-technology"] },
      { input: "aiml deep learning", expectedBranches: ["artificial-intelligence-and-machine-learning", "aiml"] },
      { input: "civil surveying", expectedBranches: ["civil-engineering"] },
      { input: "mech thermodynamics", expectedBranches: ["mechanical-engineering"] },
      { input: "entc signals", expectedBranches: ["electronics-and-telecommunication-engineering", "ece"] },
      { input: "csbs database", expectedBranches: ["computer-science-and-business-systems", "csbs"] },
    ];

    for (const tc of testCases) {
      const result = parseQuery(tc.input);
      expect(result.branches).toEqual(tc.expectedBranches);
    }
  });

  it("should extract both branch and semester from mixed queries", () => {
    const result = parseQuery("computer science sem 3 database");
    expect(result.query).toBe("database");
    expect(result.branches).toEqual(["computer-science-and-engineering"]);
    expect(result.semesters).toEqual([3]);
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
