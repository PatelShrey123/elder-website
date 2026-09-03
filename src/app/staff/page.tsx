"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ShieldAlert,
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  User,
  Clock,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Zap,
  Sparkles
} from "lucide-react";
import { sfx } from "@/lib/sound";

export default function Staff() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // UI States
  const [reasons, setReasons] = useState<{ [key: string]: string }>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "decided">("pending");
  const [viewingScreenshotUrl, setViewingScreenshotUrl] = useState<string | null>(null);

  // Time tracker for live countdowns
  const [nowTime, setNowTime] = useState<number>(Date.now());

  const user = session?.user as any;

  // Route protection
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated" && !user?.isOfficer) {
      router.push("/");
    }
  }, [status, session, router, user]);

  // Load applications
  const loadApplications = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/applications");
      if (!res.ok) throw new Error("Failed to fetch applications.");
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && user?.isOfficer) {
      loadApplications();
    }
  }, [status, user]);

  // Clock tick for live countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  if (status === "loading" || !session || !user?.isOfficer) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
        <p className="text-xs text-gray-400 font-black uppercase tracking-wider">Verifying Officer Security Clearance...</p>
      </div>
    );
  }

  // Handle Accept / Reject Decision
  const handleDecision = async (id: string, action: "ACCEPT" | "REJECT") => {
    const reason = reasons[id]?.trim();
    if (!reason) {
      setError("Please provide a decision reason before proceeding.");
      return;
    }

    setError("");
    setSuccess("");
    setProcessingId(id);
    sfx.playChargeLaser();

    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process decision.");

      sfx.playHollowPurpleBeam();
      setSuccess(`Application has been successfully ${action === "ACCEPT" ? "approved" : "rejected"}.`);
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id
            ? { ...app, status: action === "ACCEPT" ? "ACCEPTED" : "REJECTED", decidedAt: new Date().toISOString(), decisionReason: reason }
            : app
        )
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Manual Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application permanently? This will remove all database records and purge the screenshot file.")) {
      return;
    }

    setError("");
    setSuccess("");
    setProcessingId(id);

    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete application.");

      setSuccess("Application deleted successfully.");
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Countdown Helper
  const getCountdown = (decidedAtStr: string) => {
    const decidedAt = new Date(decidedAtStr).getTime();
    const expiresAt = decidedAt + 48 * 60 * 60 * 1000;
    const msRemaining = expiresAt - nowTime;

    if (msRemaining <= 0) return "Expired (Pending Cron Delete)";

    const totalMinutes = Math.floor(msRemaining / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `Auto-deletes in ${hours}h ${minutes}m`;
  };

  const pendingApps = applications.filter((app) => app.status === "PENDING");
  const decidedApps = applications.filter((app) => app.status !== "PENDING");

  return (
    <div className="flex-grow py-12 px-4 relative">
      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-pink-950/40 border border-pink-500/30 px-3 py-1 rounded-full text-[11px] font-black uppercase text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.3)] mb-1">
              <Zap className="w-3.5 h-3.5 text-pink-400" />
              <span>OFFICER COMMAND PANEL</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white flex items-center space-x-2.5">
              <ShieldAlert className="w-7 h-7 text-pink-400" />
              <span>Officer HQ</span>
            </h1>
            <p className="text-xs text-gray-400">
              Manage incoming recruit tickets, verify stats, and approve/reject applications.
            </p>
          </div>
          <div className="flex bg-purple-950/30 border border-purple-500/20 p-1 rounded-2xl shadow-lg">
            <button
              onClick={() => {
                setActiveTab("pending");
                sfx.playHover();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === "pending"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-900/40"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Pending ({pendingApps.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("decided");
                sfx.playHover();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === "decided"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-900/40"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Decided ({decidedApps.length})
            </button>
          </div>
        </div>

        {/* Global Feedback Notifications */}
        {error && (
          <div className="flex items-start space-x-3 bg-red-950/40 border border-red-500/30 text-red-300 p-4 rounded-2xl text-xs shadow-md">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-start space-x-3 bg-green-950/40 border border-green-500/30 text-green-300 p-4 rounded-2xl text-xs shadow-md">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Loading Content State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            <p className="text-xs text-gray-400 font-black uppercase tracking-wider">Retrieving application feed...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* 1. Pending Tab View */}
            {activeTab === "pending" && (
              pendingApps.length === 0 ? (
                <div className="gaming-card p-12 text-center rounded-2xl border border-purple-500/10 space-y-2">
                  <p className="text-gray-300 font-black text-sm uppercase tracking-wider">No Pending Applications</p>
                  <p className="text-xs text-gray-500">The officer intake queue is fully cleared!</p>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  {pendingApps.map((app) => (
                    <div key={app.id} className="gaming-card p-6 rounded-2xl border border-purple-500/20 grid grid-cols-1 lg:grid-cols-3 gap-6 shadow-[0_0_30px_rgba(168,85,247,0.06)]">
                      
                      {/* Left Column: Form Details */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center space-x-3">
                          {app.discordAvatar ? (
                            <img src={app.discordAvatar} alt={app.discordUsername} className="w-10 h-10 rounded-xl border border-purple-500/30" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-cyan-300 font-black"><User className="w-5 h-5" /></div>
                          )}
                          <div>
                            <h3 className="font-black text-white text-base">{app.discordUsername}</h3>
                            <p className="text-[10px] text-gray-400">Submitted {new Date(app.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-purple-500/15 pt-4 text-xs">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Kirka.io ID</p>
                            <p className="font-black text-cyan-300 text-sm">{app.kirkaId}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Weekly XP</p>
                            <p className="font-black text-white text-sm">{app.weeklyXp.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Previous Clan</p>
                            <p className="font-bold text-gray-300">{app.previousClan || "None"}</p>
                          </div>
                          {app.previousClan && (
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Why did they leave?</p>
                              <p className="text-gray-300">{app.whyLeft || "N/A"}</p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Why they want to join Elder</p>
                          <p className="text-xs text-gray-300 leading-relaxed bg-[#0c0817] p-3.5 rounded-xl border border-purple-500/15">
                            {app.whyJoin}
                          </p>
                        </div>
                      </div>

                      {/* Right Column: Actions / Screenshot */}
                      <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-purple-500/15 pt-4 lg:pt-0 lg:pl-6 space-y-4">
                        
                        {/* Screenshot signed viewer */}
                        <div className="space-y-2">
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Profile Screenshot</p>
                          <button
                            onClick={() => {
                              setViewingScreenshotUrl(app.screenshotUrl);
                              sfx.playHover();
                            }}
                            onMouseEnter={() => sfx.playHover()}
                            className="w-full flex items-center justify-center space-x-2 bg-purple-950/40 hover:bg-purple-900/50 text-xs font-black uppercase tracking-wider text-white border border-purple-500/30 hover:border-cyan-400/50 py-3 rounded-xl transition-all shadow-md"
                          >
                            <Eye className="w-4 h-4 text-cyan-400" />
                            <span>Inspect Profile Screenshot</span>
                          </button>
                        </div>

                        {/* Decision Panel */}
                        <div className="space-y-3">
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Decision Notes / Reason</p>
                          <textarea
                            rows={2}
                            placeholder="Reason for decision..."
                            value={reasons[app.id] || ""}
                            onChange={(e) => setReasons({ ...reasons, [app.id]: e.target.value })}
                            className="w-full bg-[#0c0817] border border-purple-500/20 focus:border-pink-500/40 rounded-xl p-2.5 text-xs text-white placeholder-gray-600 focus:outline-none resize-none"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleDecision(app.id, "ACCEPT")}
                              disabled={processingId === app.id}
                              onMouseEnter={() => sfx.playHover()}
                              className="flex items-center justify-center space-x-1.5 bg-green-600 hover:bg-green-500 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-md shadow-green-950/40"
                            >
                              {processingId === app.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5" />
                              )}
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => handleDecision(app.id, "REJECT")}
                              disabled={processingId === app.id}
                              onMouseEnter={() => sfx.playHover()}
                              className="flex items-center justify-center space-x-1.5 bg-red-600 hover:bg-red-500 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-md shadow-red-950/40"
                            >
                              {processingId === app.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>

                      </div>

                    </div>
                  ))}
                </div>
              )
            )}

            {/* 2. Decided Tab View */}
            {activeTab === "decided" && (
              decidedApps.length === 0 ? (
                <div className="gaming-card p-12 text-center rounded-2xl border border-purple-500/10 space-y-2">
                  <p className="text-gray-300 font-black text-sm uppercase tracking-wider">No Decided Applications</p>
                  <p className="text-xs text-gray-500">Decided tickets will appear here with cleanup timers.</p>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  {decidedApps.map((app) => (
                    <div key={app.id} className={`gaming-card p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                      app.status === "ACCEPTED" ? "border-green-500/20 bg-gradient-to-r from-green-950/15" : "border-red-500/20 bg-gradient-to-r from-red-950/15"
                    }`}>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          {app.discordAvatar ? (
                            <img src={app.discordAvatar} alt={app.discordUsername} className="w-8 h-8 rounded-lg" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-300 font-black text-xs"><User className="w-4 h-4" /></div>
                          )}
                          <div>
                            <h3 className="font-black text-white text-sm flex items-center space-x-2">
                              <span>{app.discordUsername}</span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                app.status === "ACCEPTED" 
                                  ? "bg-green-500/20 text-green-300 border-green-500/40" 
                                  : "bg-red-500/20 text-red-300 border-red-500/40"
                              }`}>
                                {app.status === "ACCEPTED" ? "Approved" : "Rejected"}
                              </span>
                            </h3>
                            <p className="text-[10px] text-gray-400">Kirka ID: {app.kirkaId} | XP: {app.weeklyXp.toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Decision Reason */}
                        <div className="flex items-start space-x-2 text-xs text-gray-300 leading-normal pl-1">
                          <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-purple-400" />
                          <span className="italic">Notes: &quot;{app.decisionReason}&quot;</span>
                        </div>
                      </div>

                      {/* Expiry and Manual Delete */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-purple-500/10 pt-3 sm:pt-0">
                        <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-bold">
                          <Clock className="w-3.5 h-3.5 text-pink-400" />
                          <span>{getCountdown(app.decidedAt)}</span>
                        </div>
                        <button
                          onClick={() => handleDelete(app.id)}
                          disabled={processingId === app.id}
                          onMouseEnter={() => sfx.playHover()}
                          className="flex items-center space-x-1 bg-red-950/40 hover:bg-red-600 text-red-300 hover:text-white font-black p-2.5 rounded-xl text-xs border border-red-500/30 transition-all disabled:opacity-50"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Delete Ticket</span>
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )
            )}

          </div>
        )}

      </div>

      {/* Proof Screenshot Full Modal with Signed URL */}
      {viewingScreenshotUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-4xl w-full bg-[#110d22] border border-purple-500/30 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#090614] border-b border-purple-500/20">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-300">Proof Screenshot (Temporary Signature)</span>
              <div className="flex items-center space-x-3">
                <a
                  href={viewingScreenshotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-[10px] font-black uppercase text-gray-400 hover:text-white"
                >
                  <span>Open Full</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => setViewingScreenshotUrl(null)}
                  className="text-gray-400 hover:text-white font-black text-sm px-2 py-1 rounded-lg hover:bg-white/5"
                >
                  ✕
                </button>
              </div>
            </div>
            {/* Image viewport */}
            <div className="p-4 flex items-center justify-center max-h-[70vh] bg-black/40 overflow-y-auto">
              <img
                src={viewingScreenshotUrl}
                alt="Trainer match results proof"
                className="max-w-full max-h-[60vh] object-contain rounded-xl border border-purple-500/20"
              />
            </div>
            {/* Explanatory footer */}
            <div className="px-4 py-2.5 bg-[#090614] text-[10px] text-gray-500 text-center border-t border-purple-500/20">
              Served securely from private uploads via signed token. Expires automatically in 5 minutes.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
