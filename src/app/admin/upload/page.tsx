"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function Page() {
  // Mutations
  const generateUploadUrlMutation = useMutation(api.papers.generateUploadUrl);
  const insertPaperMutation = useMutation(api.papers.insertPaperFromIngestion);

  // Form states
  const [subject, setSubject] = useState("");
  const [branch, setBranch] = useState("Computer Science and Engineering");
  const [semester, setSemester] = useState(1);
  const [session, setSession] = useState<"Winter" | "Summer" | "None">("None");
  const [year, setYear] = useState(new Date().getFullYear());
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Drag and Drop states
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helpers
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setPdfFile(file);
        setError("");
      } else {
        setError("Only PDF files are supported.");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setPdfFile(file);
        setError("");
      } else {
        setError("Only PDF files are supported.");
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) {
      setError("Please drop or choose a PDF question paper file.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // 1. Generate unique upload token URL from Convex
      const uploadUrl = await generateUploadUrlMutation();

      // 2. Fetch/POST binary file data to Convex Storage
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/pdf",
        },
        body: pdfFile,
      });

      if (!response.ok) {
        throw new Error("Physical PDF file upload stream failed.");
      }

      const { storageId } = await response.json();

      // 3. Insert Paper Record to catalog
      await insertPaperMutation({
        branch: branch.trim(),
        branchSlug: slugify(branch),
        semester: Number(semester),
        subject: subject.trim(),
        subjectSlug: slugify(subject),
        year: Number(year),
        session: session === "None" ? null : session,
        storageId: storageId,
        keywords: [],
        searchableText: "",
        textHash: "",
      });

      setSuccess(true);
      // Reset Form fields
      setSubject("");
      setPdfFile(null);
    } catch (err: any) {
      setError(err.message || "Failed to upload paper. Please check server connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-8 md:py-12 animate-fade-up">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-navy-mid/60 hover:text-sky-blue transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Link>
        <span className="text-xs font-bold text-navy-mid/45">Manual Uploader</span>
      </div>

      <div className="mt-6">
        <h1 className="text-2xl font-bold tracking-tight text-navy-deep font-sans">
          Upload Question Paper
        </h1>
        <p className="mt-1 text-xs text-navy-mid/60">
          Enter metadata fields and drop a PDF binary asset to import directly into the archive.
        </p>
      </div>

      <form onSubmit={handleUploadSubmit} className="mt-8 flex flex-col gap-5">
        {/* Success/Error Banners */}
        {success && (
          <div className="flex items-start gap-2.5 rounded bg-green-50 p-3 text-xs font-semibold text-green-800">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-green-600" />
            <div>
              <p>Exam paper uploaded and cataloged successfully!</p>
              <p className="mt-0.5 text-[10.5px] text-green-700/80 font-normal">
                It is now fully indexed and discoverable in real-time under search results.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2.5 rounded bg-red-50 p-3 text-xs font-semibold text-red-800">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Inputs */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/65 block mb-1.5">
              Subject Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Advanced Database Management Systems"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-10 w-full rounded-btn border border-border bg-white px-3.5 text-xs font-semibold text-navy-deep placeholder:text-navy-mid/30 focus:border-sky-blue focus:outline-none focus:ring-[3px] focus:ring-sky-blue/15 transition-hover"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/65 block mb-1.5">
              Engineering Branch
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="h-10 w-full rounded-btn border border-border bg-white px-2.5 text-xs font-semibold text-navy-deep focus:border-sky-blue focus:outline-none transition-hover"
            >
              {[
                "Computer Science and Engineering",
                "Information Technology",
                "Artificial Intelligence and Machine Learning",
                "Computer Science and Business Systems",
                "Electronics and Telecommunication Engineering",
                "Civil Engineering",
                "Mechanical Engineering",
                "Chemical Engineering",
              ].map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/65 block mb-1.5">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="h-10 w-full rounded-btn border border-border bg-white px-2.5 text-xs font-semibold text-navy-deep focus:border-sky-blue focus:outline-none transition-hover"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Sem {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/65 block mb-1.5">
                Session
              </label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as any)}
                className="h-10 w-full rounded-btn border border-border bg-white px-2.5 text-xs font-semibold text-navy-deep focus:border-sky-blue focus:outline-none transition-hover"
              >
                <option value="None">None</option>
                <option value="Winter">Winter</option>
                <option value="Summer">Summer</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/65 block mb-1.5">
                Year
              </label>
              <input
                type="number"
                required
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="h-10 w-full rounded-btn border border-border bg-white px-3.5 text-xs font-semibold text-navy-deep focus:border-sky-blue focus:outline-none focus:ring-[3px] focus:ring-sky-blue/15 transition-hover font-mono"
              />
            </div>
          </div>
        </div>

        {/* Drag and Drop zone */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/65 block mb-1.5">
            PDF Document
          </label>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-card py-10 px-5 text-center flex flex-col items-center justify-center cursor-pointer transition-colors ${
              pdfFile
                ? "border-green-400 bg-green-50/10"
                : dragActive
                  ? "border-sky-blue bg-sky-tint/25"
                  : "border-border hover:border-sky-blue hover:bg-mist/10"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="application/pdf"
              className="hidden"
            />

            {pdfFile ? (
              <>
                <FileText className="h-9 w-9 text-green-500" />
                <p className="mt-3 text-xs font-bold text-navy-deep truncate max-w-[300px]">
                  {pdfFile.name}
                </p>
                <p className="mt-1 text-[10.5px] text-navy-mid/50 font-mono">
                  {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPdfFile(null);
                  }}
                  className="mt-3 text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-wider"
                >
                  Remove File
                </button>
              </>
            ) : (
              <>
                <Upload className="h-9 w-9 text-navy-mid/30" />
                <p className="mt-3 text-xs font-bold text-navy-deep">
                  Drag and drop your question paper PDF here
                </p>
                <p className="mt-1.5 text-[10px] text-navy-mid/50 font-medium">
                  or click to browse local files (PDF only)
                </p>
              </>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex h-11 w-full items-center justify-center gap-1.5 rounded-btn bg-sky-blue text-xs font-semibold text-white transition-hover hover:bg-navy-deep disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Upload className="h-4 w-4" />
              <span>Import to Catalog</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
