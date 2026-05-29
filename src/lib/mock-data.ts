export interface Paper {
  _id: string;
  branch: string;
  branchSlug: string;
  semester: number;
  subject: string;
  subjectSlug: string;
  year: number;
  session: "Winter" | "Summer" | null;
  pageCount?: number;
  keywords?: string[];
  searchableText?: string;
  fileId: string;
  fileUrl: string;
  createdAt: number;
}

export const MOCK_PAPERS: Paper[] = [
  {
    _id: "paper_1",
    branch: "Computer Engineering",
    branchSlug: "computer-engineering",
    semester: 5,
    subject: "Machine Learning",
    subjectSlug: "machine-learning",
    year: 2024,
    session: "Summer",
    pageCount: 3,
    keywords: ["machine learning", "semester 5", "summer 2024", "ml"],
    fileId: "file_ml_2024",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    createdAt: 1715000000,
  },
  {
    _id: "paper_2",
    branch: "Computer Engineering",
    branchSlug: "computer-engineering",
    semester: 4,
    subject: "Database Management Systems",
    subjectSlug: "database-management-systems",
    year: 2024,
    session: "Winter",
    pageCount: 2,
    keywords: ["database management systems", "dbms", "semester 4", "winter 2024"],
    fileId: "file_dbms_2024",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    createdAt: 1702000000,
  },
  {
    _id: "paper_3",
    branch: "Artificial Intelligence and Machine Learning",
    branchSlug: "aiml",
    semester: 6,
    subject: "Artificial Intelligence",
    subjectSlug: "artificial-intelligence",
    year: 2021,
    session: "Winter",
    pageCount: 2,
    keywords: ["artificial intelligence", "ai", "semester 6", "winter 2021"],
    fileId: "file_ai_2021",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    createdAt: 1639000000,
  },
  {
    _id: "paper_4",
    branch: "Information Technology",
    branchSlug: "information-technology",
    semester: 3,
    subject: "Data Structures and Algorithms",
    subjectSlug: "data-structures-and-algorithms",
    year: 2023,
    session: "Summer",
    pageCount: 4,
    keywords: ["data structures and algorithms", "dsa", "semester 3", "summer 2023"],
    fileId: "file_dsa_2023",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    createdAt: 1684000000,
  },
  {
    _id: "paper_5",
    branch: "Electronics and Telecommunication",
    branchSlug: "ece",
    semester: 5,
    subject: "Digital Signal Processing",
    subjectSlug: "digital-signal-processing",
    year: 2023,
    session: "Winter",
    pageCount: 3,
    keywords: ["digital signal processing", "dsp", "semester 5", "winter 2023"],
    fileId: "file_dsp_2023",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    createdAt: 1701000000,
  },
];
