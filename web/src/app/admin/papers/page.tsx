"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Edit2, Trash2, X, AlertTriangle, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

type Paper = {
  _id: string;
  subject: string;
  branch: string;
  branchSlug: string;
  semester: number;
  session: "Winter" | "Summer" | null;
  year: number;
  fileUrl: string;
};

export default function Page() {
  // Query papers
  const [searchTerm, setSearchTerm] = useState("");
  const rawPapers = useQuery(api.papers.search, { query: searchTerm });
  const papers = (rawPapers ?? []) as Paper[];
  const isLoading = rawPapers === undefined;

  // Mutations
  const updatePaperMutation = useMutation(api.papers.updatePaper);
  const deletePaperMutation = useMutation(api.papers.deletePaper);

  // Edit / Delete states
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Edit form states
  const [editSubject, setEditSubject] = useState("");
  const [editBranch, setEditBranch] = useState("");
  const [editSemester, setEditSemester] = useState(1);
  const [editSession, setEditSession] = useState<"Winter" | "Summer" | "None">("None");
  const [editYear, setEditYear] = useState(2025);
  const [saving, setSaving] = useState(false);

  // Map display branch to slug helper
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const handleStartEdit = (paper: Paper) => {
    setEditingPaper(paper);
    setEditSubject(paper.subject);
    setEditBranch(paper.branch);
    setEditSemester(paper.semester);
    setEditSession(paper.session ?? "None");
    setEditYear(paper.year);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPaper) return;
    setSaving(true);

    try {
      await updatePaperMutation({
        id: editingPaper._id as any,
        subject: editSubject.trim(),
        branch: editBranch.trim(),
        branchSlug: slugify(editBranch.trim()),
        semester: Number(editSemester),
        session: editSession === "None" ? null : editSession,
        year: Number(editYear),
      });
      setEditingPaper(null);
    } catch (err: any) {
      alert("Failed to update paper: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePaperMutation({ id: id as any });
      setDeletingId(null);
    } catch (err: any) {
      alert("Failed to delete paper: " + err.message);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:py-12 animate-fade-up">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-navy-mid/60 hover:text-sky-blue transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Link>
        <span className="text-xs font-bold text-navy-mid/45">Papers Catalog</span>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-deep font-sans">
            Manage Papers
          </h1>
          <p className="mt-1 text-xs text-navy-mid/60">
            Search, edit metadata parameters, or remove question papers from the catalog.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-navy-mid/30" />
          <input
            type="text"
            placeholder="Search by subject code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9.5 w-full rounded-btn border border-border bg-white pl-10 pr-4 text-xs font-semibold text-navy-deep placeholder:text-navy-mid/30 focus:border-sky-blue focus:outline-none focus:ring-[3px] focus:ring-sky-blue/15 transition-hover"
          />
        </div>
      </div>

      {/* Catalog Table */}
      <div className="mt-6 border border-border bg-white rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-mist/35 border-b border-border text-[10.5px] font-bold uppercase tracking-wider text-navy-mid/55">
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Branch</th>
                <th className="py-3.5 px-4 text-center">Semester</th>
                <th className="py-3.5 px-4">Session & Year</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs font-semibold text-navy-deep">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-navy-mid/50">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-sky-blue" />
                    <span className="mt-2 block text-xs">Loading papers index...</span>
                  </td>
                </tr>
              ) : papers.length > 0 ? (
                papers.map((paper) => (
                  <tr key={paper._id} className="hover:bg-mist/10">
                    <td className="py-3 px-4">
                      <a
                        href={paper.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-sky-blue transition-colors hover:underline block"
                      >
                        {paper.subject}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-navy-mid/70 truncate max-w-[150px]">
                      {paper.branch}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">{paper.semester}</td>
                    <td className="py-3 px-4 text-navy-mid/70">
                      {paper.session ?? "N/A"} {paper.year}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(paper)}
                          className="p-1.5 rounded text-navy-mid/60 hover:text-sky-blue hover:bg-mist/40 transition-colors"
                          title="Edit Paper"
                        >
                          <Edit2 className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(paper._id)}
                          className="p-1.5 rounded text-navy-mid/60 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete Paper"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-navy-mid/50">
                    No papers found matching query criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Absolute Edit Modal */}
      {editingPaper && (
        <div className="fixed inset-0 bg-navy-deep/40 flex items-center justify-center p-5 z-50 animate-fade-in backdrop-blur-xs">
          <div className="w-full max-w-md rounded-card border border-border bg-white p-6 shadow-dropdown animate-fade-up">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-navy-deep">Edit Exam Paper</h3>
              <button
                onClick={() => setEditingPaper(null)}
                className="text-navy-mid/40 hover:text-navy-deep"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 flex flex-col gap-3.5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/65 block mb-1">
                  Subject Title
                </label>
                <input
                  type="text"
                  required
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="h-9.5 w-full rounded-btn border border-border bg-white px-3.5 text-xs font-semibold text-navy-deep focus:border-sky-blue focus:outline-none transition-hover"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/65 block mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  required
                  value={editBranch}
                  onChange={(e) => setEditBranch(e.target.value)}
                  className="h-9.5 w-full rounded-btn border border-border bg-white px-3.5 text-xs font-semibold text-navy-deep focus:border-sky-blue focus:outline-none transition-hover"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/65 block mb-1">
                    Semester
                  </label>
                  <select
                    value={editSemester}
                    onChange={(e) => setEditSemester(Number(e.target.value))}
                    className="h-9.5 w-full rounded-btn border border-border bg-white px-2.5 text-xs font-semibold text-navy-deep focus:border-sky-blue focus:outline-none transition-hover"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Sem {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/65 block mb-1">
                    Session
                  </label>
                  <select
                    value={editSession}
                    onChange={(e) => setEditSession(e.target.value as any)}
                    className="h-9.5 w-full rounded-btn border border-border bg-white px-2.5 text-xs font-semibold text-navy-deep focus:border-sky-blue focus:outline-none transition-hover"
                  >
                    <option value="None">None</option>
                    <option value="Winter">Winter</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/65 block mb-1">
                    Exam Year
                  </label>
                  <input
                    type="number"
                    required
                    value={editYear}
                    onChange={(e) => setEditYear(Number(e.target.value))}
                    className="h-9.5 w-full rounded-btn border border-border bg-white px-3.5 text-xs font-semibold text-navy-deep focus:border-sky-blue focus:outline-none transition-hover font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-2 flex h-9.5 w-full items-center justify-center gap-1.5 rounded-btn bg-sky-blue text-xs font-semibold text-white transition-hover hover:bg-navy-deep disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {saving ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Absolute Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-navy-deep/40 flex items-center justify-center p-5 z-50 animate-fade-in backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-card border border-border bg-white p-5 shadow-dropdown animate-fade-up">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-navy-deep">Confirm Deletion</h3>
                <p className="mt-1 text-xs text-navy-mid/65 leading-normal">
                  Are you sure you want to permanently delete this question paper? This will remove it from the catalog and delete its PDF file from Convex Storage.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeletingId(null)}
                className="h-8.5 rounded-btn border border-border bg-white px-3.5 text-xs font-semibold text-navy-mid hover:bg-mist/30 transition-hover"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="h-8.5 rounded-btn bg-red-500 px-3.5 text-xs font-semibold text-white transition-hover hover:bg-red-600"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
