"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, Key, LogOut, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function Page() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { error: signInError } = await authClient.signIn.email({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || "Invalid email or password");
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.refresh();
  };

  if (isPending) {
    return (
      <div className="mx-auto flex h-[350px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-sky-blue" />
      </div>
    );
  }

  // If already authenticated, display the Admin Dashboard panel links
  if (session) {
    const adminLinks = [
      { name: "Manage Papers", href: "/admin/papers", desc: "List, edit, and delete archived papers." },
      { name: "Upload Paper", href: "/admin/upload", desc: "Upload a new PDF and parse metadata." },
      { name: "Analytics", href: "/admin/analytics", desc: "Track queries, page views, and popular papers." },
    ];

    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-12 md:py-16 animate-fade-up">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border pb-5 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-navy-deep font-sans">
              Admin Portal
            </h1>
            <p className="mt-1.5 text-sm text-navy-mid/60">
              Logged in as <span className="font-semibold text-navy-deep">{session.user.email}</span>
            </p>
          </div>

          <button
            onClick={handleSignOut}
            className="inline-flex h-9 items-center gap-1.5 rounded-btn border border-border bg-white px-4 text-xs font-semibold text-navy-mid hover:border-red-500 hover:text-red-500 transition-hover cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-card border border-border bg-white p-6 transition-hover hover:border-sky-blue hover:shadow-card cursor-pointer flex flex-col justify-between"
            >
              <div>
                <h2 className="text-base font-semibold text-navy-deep group-hover:text-sky-blue transition-colors">
                  {link.name}
                </h2>
                <p className="mt-2 text-xs leading-normal text-navy-mid/60">
                  {link.desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-sky-blue group-hover:text-navy-deep transition-colors">
                <span>Access Panel</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Display Minimalist Login Card
  return (
    <div className="flex-1 flex items-center justify-center px-5 py-16 animate-fade-up">
      <div className="w-full max-w-sm rounded-card bg-white p-6">
        <div className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-sky-tint text-sky-blue select-none">
            <Lock className="h-5 w-5" />
          </div>
          <h2 className="mt-3 text-lg font-bold text-navy-deep font-sans">
            Admin Authentication
          </h2>
          <p className="mt-1 text-xs text-navy-mid/55">
            Log in to manage the PeerAtlas question paper archive.
          </p>
        </div>

        <form onSubmit={handleSignIn} className="mt-6 flex flex-col gap-4">
          {error && (
            <div className="flex items-start gap-2 rounded bg-red-50 p-2.5 text-xs font-medium text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/65 block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-navy-mid/30" />
              <input
                type="email"
                required
                placeholder="admin@peeratlas.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10.5 w-full rounded-btn border border-border bg-white pl-10 pr-4 text-xs font-semibold text-navy-deep placeholder:text-navy-mid/30 focus:border-sky-blue focus:outline-none focus:ring-[3px] focus:ring-sky-blue/15 transition-hover"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/65 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-3 h-4.5 w-4.5 text-navy-mid/30" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10.5 w-full rounded-btn border border-border bg-white pl-10 pr-4 text-xs font-semibold text-navy-deep placeholder:text-navy-mid/30 focus:border-sky-blue focus:outline-none focus:ring-[3px] focus:ring-sky-blue/15 transition-hover"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex h-10.5 w-full items-center justify-center gap-1.5 rounded-btn bg-sky-blue text-xs font-semibold text-white transition-hover hover:bg-navy-deep disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
