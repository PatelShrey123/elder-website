"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Swords, Upload, ShieldCheck, AlertCircle, Loader2, ArrowLeft, Zap, Sparkles } from "lucide-react";
import Link from "next/link";
import { sfx } from "@/lib/sound";

export default function Apply() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Form State
  const [kirkaId, setKirkaId] = useState("");
  const [weeklyXp, setWeeklyXp] = useState("");
  const [previousClan, setPreviousClan] = useState("");
  const [whyLeft, setWhyLeft] = useState("");
  const [whyJoin, setWhyJoin] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);

  // Status/Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const user = session?.user as any;

  // Protect route
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/requirements");
    } else if (status === "authenticated" && !user?.isApplicant) {
      router.push("/requirements");
    }
  }, [status, session, router, user]);

  if (status === "loading" || !session || !user?.isApplicant) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Verifying Applicant Clearance...</p>
      </div>
    );
  }

  // Handle file selection
  const handleFileChange = (file: File | null) => {
    if (!file) return;

    // Check file size (5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMsg("Screenshot exceeds 5MB size limit.");
      setScreenshot(null);
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setErrorMsg("File must be an image (PNG or JPG).");
      setScreenshot(null);
      return;
    }

    setErrorMsg("");
    setScreenshot(file);
    sfx.playHover();
  };

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
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!kirkaId || !weeklyXp || !whyJoin || !screenshot) {
      setErrorMsg("Please fill in all required fields and upload your proof screenshot.");
      return;
    }

    setIsSubmitting(true);
    sfx.playChargeLaser();

    try {
      const formData = new FormData();
      formData.append("kirkaId", kirkaId);
      formData.append("weeklyXp", weeklyXp);
      formData.append("previousClan", previousClan);
      formData.append("whyLeft", whyLeft);
      formData.append("whyJoin", whyJoin);
      formData.append("screenshot", screenshot);

      const res = await fetch("/api/applications/submit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application.");
      }

      sfx.playHollowPurpleBeam();
      setSuccess(true);
      setKirkaId("");
      setWeeklyXp("");
      setPreviousClan("");
      setWhyLeft("");
      setWhyJoin("");
      setScreenshot(null);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="gaming-card max-w-md w-full p-8 rounded-2xl border border-cyan-500/30 text-center space-y-6 shadow-[0_0_40px_rgba(6,182,212,0.2)]">
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-cyan-500 to-purple-600 border border-cyan-400/40 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_#06b6d4]">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-400">
              Application Transmitted!
            </h1>
            <p className="text-xs text-gray-300 leading-relaxed">
              Your application and proof screenshot were saved and broadcasted to Elder Officers. 
              Review decisions take up to 48 hours.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/results"
              onMouseEnter={() => sfx.playHover()}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              Go to Results Page
            </Link>
            <Link
              href="/"
              onMouseEnter={() => sfx.playHover()}
              className="text-gray-400 hover:text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow py-12 px-4 relative">
      <div className="max-w-2xl mx-auto space-y-8 relative z-10">
        
        {/* Back Link */}
        <Link 
          href="/requirements" 
          onMouseEnter={() => sfx.playHover()}
          className="inline-flex items-center space-x-2 text-xs font-bold text-gray-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Requirements</span>
        </Link>

        {/* Heading */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 bg-purple-950/40 border border-purple-500/30 px-3 py-1 rounded-full text-[11px] font-black uppercase text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>ELDER CLAN APPLICANT INTAKE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white flex items-center space-x-2.5">
            <Swords className="w-7 h-7 text-cyan-400" />
            <span>Submit Application</span>
          </h1>
          <p className="text-xs text-gray-300">
            Applying as <span className="text-cyan-300 font-bold">{user.name}</span>. 
            All fields marked with <span className="text-pink-500 font-bold">*</span> are required.
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="flex items-start space-x-3 bg-red-950/40 border border-red-500/40 text-red-300 p-4 rounded-2xl text-xs leading-relaxed shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-6 gaming-card p-6 sm:p-8 rounded-2xl border border-purple-500/20">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Kirka ID */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center">
                <span>Kirka.io User ID</span>
                <span className="text-pink-500 ml-1">*</span>
              </label>
              <input
                type="text"
                required
                value={kirkaId}
                onChange={(e) => setKirkaId(e.target.value)}
                placeholder="e.g. USERNAME#CODE"
                className="w-full bg-[#0e0a1a] border border-purple-500/20 focus:border-cyan-400/60 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none transition-colors shadow-inner"
              />
            </div>

            {/* Weekly XP */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center">
                <span>Weekly XP Score</span>
                <span className="text-pink-500 ml-1">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={weeklyXp}
                onChange={(e) => setWeeklyXp(e.target.value)}
                placeholder="e.g. 52000"
                className="w-full bg-[#0e0a1a] border border-purple-500/20 focus:border-cyan-400/60 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none transition-colors shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Previous Clan */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-300 uppercase tracking-wider">
                Previous Clan
              </label>
              <input
                type="text"
                value={previousClan}
                onChange={(e) => setPreviousClan(e.target.value)}
                placeholder="e.g. APE or NONE"
                className="w-full bg-[#0e0a1a] border border-purple-500/20 focus:border-cyan-400/60 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none transition-colors shadow-inner"
              />
            </div>

            {/* Why they left */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-300 uppercase tracking-wider">
                Why did you leave?
              </label>
              <input
                type="text"
                value={whyLeft}
                onChange={(e) => setWhyLeft(e.target.value)}
                placeholder="Brief reason"
                className="w-full bg-[#0e0a1a] border border-purple-500/20 focus:border-cyan-400/60 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none transition-colors shadow-inner"
              />
            </div>
          </div>

          {/* Motivation / Why join */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center">
              <span>Why do you want to join Elder?</span>
              <span className="text-pink-500 ml-1">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={whyJoin}
              onChange={(e) => setWhyJoin(e.target.value)}
              placeholder="Tell us why you want to join Elder, your schedule, playstyle, and combat strengths..."
              className="w-full bg-[#0e0a1a] border border-purple-500/20 focus:border-cyan-400/60 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none transition-colors resize-none shadow-inner"
            />
          </div>

          {/* Screenshot Upload Box */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center">
              <span>Proof Screenshot (Trainer Match Victory)</span>
              <span className="text-pink-500 ml-1">*</span>
            </label>

            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] ${
                dragActive
                  ? "border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  : screenshot
                  ? "border-green-400/50 bg-green-950/20 text-green-300"
                  : "border-purple-500/20 hover:border-purple-400/50 bg-[#0e0a1a] text-gray-400"
              }`}
            >
              <input
                id="screenshot-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
              />
              <label htmlFor="screenshot-upload" className="cursor-pointer w-full flex flex-col items-center space-y-3">
                <div className="p-3.5 rounded-full bg-purple-950/40 border border-purple-500/30 text-cyan-400 shadow-md">
                  <Upload className="w-6 h-6" />
                </div>
                {screenshot ? (
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[280px]">
                      {screenshot.name}
                    </p>
                    <p className="text-[10px] text-green-400 font-black uppercase tracking-wider">
                      {(screenshot.size / (1024 * 1024)).toFixed(2)} MB — Verified Ready
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-bold text-gray-200">
                      Click to upload match screenshot or drag & drop
                    </p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      Supports JPG, PNG (Max 5MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Submit Button with Laser / Hollow Purple Sound Effect */}
          <button
            type="submit"
            disabled={isSubmitting}
            onMouseEnter={() => sfx.playHover()}
            className="w-full flex items-center justify-center space-x-2.5 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-cyan-300" />
                <span>Transmitting to Officers...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 text-cyan-300" />
                <span>Submit Clan Ticket</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
