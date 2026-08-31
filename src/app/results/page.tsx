"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, RefreshCw, Calendar, MessageSquare, Shield, Sparkles, Swords } from "lucide-react";
import { sfx } from "@/lib/sound";

export default function Results() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResults = async () => {
    setIsLoading(true);
    setError("");
    sfx.playHover();
    try {
      const res = await fetch("/api/results", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load results.");
      const data = await res.json();
      setResults(data.results || data.applications || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const acceptedList = results.filter((r) => r.status === "ACCEPTED");
  const rejectedList = results.filter((r) => r.status === "REJECTED");

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-grow py-12 px-4 relative">
      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-purple-950/40 border border-purple-500/30 px-3 py-1 rounded-full text-[11px] font-black uppercase text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>OFFICIAL DECISION FEED</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white flex items-center space-x-2.5">
              <Shield className="w-7 h-7 text-cyan-400" />
              <span>Application Decisions</span>
            </h1>
            <p className="text-xs text-gray-400">
              Decisions from Elder Officers. Results auto-clear after 48 hours.
            </p>
          </div>
          <button
            onClick={fetchResults}
            disabled={isLoading}
            onMouseEnter={() => sfx.playHover()}
            className="self-start flex items-center space-x-2 bg-purple-950/30 hover:bg-purple-900/40 text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl border border-purple-500/30 hover:border-cyan-400/50 text-gray-200 hover:text-white transition-all disabled:opacity-50 shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh Feed</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 shadow-md">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Synchronizing decisions...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Accepted Column */}
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-green-400 flex items-center space-x-2 border-b border-green-500/20 pb-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Accepted for Training ({acceptedList.length})</span>
              </h2>

              {acceptedList.length === 0 ? (
                <div className="gaming-card p-8 rounded-2xl text-center text-xs text-gray-500 border border-purple-500/10">
                  No recently accepted applicants.
                </div>
              ) : (
                <div className="space-y-4">
                  {acceptedList.map((app) => (
                    <div 
                      key={app.id}
                      onMouseEnter={() => sfx.playHover()}
                      className="gaming-card p-5 rounded-2xl border border-green-500/20 bg-gradient-to-r from-green-950/20 to-[#0e0a1a] space-y-4 shadow-[0_0_20px_rgba(34,197,94,0.08)]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {app.discordAvatar ? (
                            <img
                              src={app.discordAvatar}
                              alt={app.discordUsername}
                              className="w-10 h-10 rounded-xl object-cover border border-green-500/30"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-green-950/50 border border-green-500/40 text-green-400 flex items-center justify-center font-black text-sm">
                              {app.discordUsername.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h3 className="text-sm font-black text-white">{app.discordUsername}</h3>
                            <p className="text-[10px] text-gray-400">Kirka ID: <span className="text-cyan-300 font-bold">{app.kirkaId}</span></p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/40 shadow-sm">
                            Training Approved
                          </span>
                          <p className="text-[9px] text-gray-400 flex items-center justify-end space-x-1">
                            <Calendar className="w-2.5 h-2.5" />
                            <span>{formatDate(app.decidedAt)}</span>
                          </p>
                        </div>
                      </div>

                      {app.decisionReason && (
                        <div className="p-3 rounded-xl bg-black/40 border border-green-500/15 flex items-start space-x-2 text-xs text-green-300/90 leading-relaxed">
                          <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-green-400" />
                          <span>{app.decisionReason}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rejected Column */}
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-red-400 flex items-center space-x-2 border-b border-red-500/20 pb-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <span>Denied ({rejectedList.length})</span>
              </h2>

              {rejectedList.length === 0 ? (
                <div className="gaming-card p-8 rounded-2xl text-center text-xs text-gray-500 border border-purple-500/10">
                  No recently denied applicants.
                </div>
              ) : (
                <div className="space-y-4">
                  {rejectedList.map((app) => (
                    <div 
                      key={app.id}
                      onMouseEnter={() => sfx.playHover()}
                      className="gaming-card p-5 rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-950/20 to-[#0e0a1a] space-y-4 shadow-[0_0_20px_rgba(239,68,68,0.08)]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {app.discordAvatar ? (
                            <img
                              src={app.discordAvatar}
                              alt={app.discordUsername}
                              className="w-10 h-10 rounded-xl object-cover border border-red-500/30"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-red-950/50 border border-red-500/40 text-red-400 flex items-center justify-center font-black text-sm">
                              {app.discordUsername.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h3 className="text-sm font-black text-white">{app.discordUsername}</h3>
                            <p className="text-[10px] text-gray-400">Kirka ID: <span className="text-gray-300 font-bold">{app.kirkaId}</span></p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm">
                            Denied
                          </span>
                          <p className="text-[9px] text-gray-400 flex items-center justify-end space-x-1">
                            <Calendar className="w-2.5 h-2.5" />
                            <span>{formatDate(app.decidedAt)}</span>
                          </p>
                        </div>
                      </div>

                      {app.decisionReason && (
                        <div className="p-3 rounded-xl bg-black/40 border border-red-500/15 flex items-start space-x-2 text-xs text-red-300/90 leading-relaxed">
                          <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-400" />
                          <span>{app.decisionReason}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
