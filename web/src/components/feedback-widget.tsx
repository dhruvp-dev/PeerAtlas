"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Star, CheckCircle, AlertCircle, Send } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAnalytics, getOrGenerateAnonymousId, getOrGenerateSessionId } from "@/lib/analytics";

type Category = "General" | "Missing Paper" | "Bug" | "Suggestion";

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<Category>("General");
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const widgetRef = useRef<HTMLDivElement>(null);
  const submitFeedback = useMutation(api.analytics.logFeedback);
  const { track } = useAnalytics();

  const categories: Category[] = ["General", "Missing Paper", "Bug", "Suggestion"];

  // Close widget when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleOpenToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      // Track that user clicked the feedback form launcher
      track("external_link_clicked", {
        destination: "feedback_form",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setSubmitError("Please select a rating of 1 to 5 stars.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const anonId = getOrGenerateAnonymousId();
      const sessId = getOrGenerateSessionId();

      // 1. Save to Convex Table
      await submitFeedback({
        category,
        rating,
        comment: comment.trim() || undefined,
        anonymousId: anonId,
        sessionId: sessId,
      });

      // 2. Track Event in both PostHog and Convex Analytics events
      track("feedback_submitted", {
        category,
        rating,
        comment: comment.trim() || undefined,
      });

      setIsSubmitting(false);
      setSubmitSuccess(true);

      // Reset form after a delay and close
      setTimeout(() => {
        setIsOpen(false);
        // Reset states after animation out
        setTimeout(() => {
          setSubmitSuccess(false);
          setCategory("General");
          setRating(0);
          setComment("");
        }, 300);
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setIsSubmitting(false);
      setSubmitError(err.message || "Failed to submit feedback. Please try again.");
    }
  };

  return (
    <div ref={widgetRef} className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Floating Action Button */}
      <button
        onClick={handleOpenToggle}
        className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300 cursor-pointer ${
          isOpen
            ? "bg-navy-deep text-white rotate-90 scale-95 hover:bg-navy-mid"
            : "bg-sky-blue text-white hover:bg-navy-deep hover:scale-105"
        }`}
        aria-label="Toggle Feedback Widget"
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </button>

      {/* Slide-Up Popover Form Card */}
      {isOpen && (
        <div className="absolute bottom-15 right-0 w-85 sm:w-96 rounded-card border border-border bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md p-5 shadow-2xl animate-fade-up">
          {submitSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-up">
              <CheckCircle className="h-12 w-12 text-emerald-500 animate-bounce" />
              <h3 className="mt-4 text-base font-bold text-navy-deep">Thank you!</h3>
              <p className="mt-1 text-xs text-navy-mid/60">
                Your feedback helps us make PeerAtlas better for everyone.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-navy-deep">Help Us Improve</h3>
                <p className="text-[11px] text-navy-mid/60">
                  Share your thoughts, suggestions, or report any issues.
                </p>
              </div>

              {/* Category Pills */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/45">
                  Category
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`rounded px-2.5 py-1.5 text-center text-xs font-semibold select-none transition-hover cursor-pointer border ${
                        category === cat
                          ? "border-sky-blue bg-sky-tint text-navy-deep dark:bg-sky-tint/10"
                          : "border-border bg-transparent text-navy-mid hover:border-sky-blue hover:text-navy-deep"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Star Rating Selection */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/45">
                  Rating
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const fillValue = hoveredRating || rating;
                    const isActive = star <= fillValue;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          setRating(star);
                          setSubmitError("");
                        }}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform duration-100 hover:scale-125 cursor-pointer p-0.5"
                        aria-label={`Rate ${star} Stars`}
                      >
                        <Star
                          className={`h-6 w-6 stroke-1.5 ${
                            isActive
                              ? "fill-amber-400 stroke-amber-500"
                              : "stroke-navy-mid/30 dark:stroke-navy-mid/50"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment Text Area */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/45">
                  Message (Optional)
                </span>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    category === "Bug"
                      ? "What went wrong? How can we reproduce it?"
                      : category === "Missing Paper"
                        ? "Which subject, semester, or year paper is missing?"
                        : "Write your feedback or ideas here..."
                  }
                  rows={3}
                  className="rounded-btn border border-border bg-transparent px-3 py-2 text-xs font-semibold text-foreground placeholder:text-navy-mid/40 focus:border-sky-blue focus:outline-none resize-none min-h-[70px]"
                />
              </div>

              {submitError && (
                <div className="flex items-center gap-1.5 text-xs text-red-500 font-semibold bg-red-50 dark:bg-red-950/20 px-2.5 py-1.5 rounded border border-red-200/50">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Submit Trigger */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-9 items-center justify-center gap-1.5 rounded-btn bg-sky-blue text-xs font-semibold text-white transition-hover hover:bg-navy-deep shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
