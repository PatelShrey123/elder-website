"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Swords, CheckCircle2, ShieldX, ArrowRight, Target } from "lucide-react";
import GojoCutscene from "@/components/GojoCutscene";
import { sfx } from "@/lib/sound";

export default function Requirements() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLaserTriggered, setIsLaserTriggered] = useState(false);
  const user = session?.user as any;

  const trainers = [
    { name: "[EGD]Fabin #KB4ACS", region: "GLOBAL" },
    { name: "Carson/CertifiedLoser #V90LM3", region: "ASIA" },
    { name: "Elena #VRVXZT", region: "ASIA" },
    { name: "Ghoul #OM2Z2I", region: "ASIA" },
    { name: "ElderGoonerDih #GNCCHM", region: "ASIA" },
    { name: "NEKKI #FUYR7K", region: "ASIA" },
    { name: "Sylkie #7FRZOY", region: "ASIA" },
    { name: "Intrepidus #T2D70P", region: "ASIA" },
    { name: "S_A_N_T_I #69I3DV", region: "EU" },
    { name: "LuigiToan #ZSCKH5", region: "ASIA" },
  ];

  const requirementsList = [
    "Minimum 50,000+ score per week in Kirka.io",
    "Main account only (alts allowed if 100k+ per week)",
    "No cheating, exploiting, scamming, or boosting",
    "Level 35+ with decent stats",
    "Active, loyal, social — represent Elder well",
  ];

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLaserTriggered) return;
    setIsLaserTriggered(true);
  };

  const handleCutsceneComplete = () => {
    router.push("/apply");
  };

  return (
    <div className="flex-grow py-12 px-4 relative">
      
      {/* Gojo Laser Cutscene */}
      <GojoCutscene
        isActive={isLaserTriggered}
        onComplete={handleCutsceneComplete}
        targetName="APPLICATION FORM"
      />

      <div className="max-w-3xl mx-auto space-y-10 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            Clan Requirements
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">
            Before applying, make sure you meet all of the following criteria.
          </p>
        </div>

        {/* Requirements List Card */}
        <div className="gaming-card p-6 sm:p-8 rounded-2xl border border-purple-500/20 space-y-6">
          <h2 className="text-lg font-black uppercase tracking-wider text-white border-b border-purple-500/20 pb-3 flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            <span>Eligibility Requirements</span>
          </h2>
          <ul className="space-y-3.5">
            {requirementsList.map((req, idx) => (
              <li 
                key={idx} 
                onMouseEnter={() => sfx.playHover()}
                className="flex items-start space-x-3 text-gray-200 p-2 rounded-lg hover:bg-purple-950/30 transition-colors"
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 text-white text-xs font-black mt-0.5 shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                  {idx + 1}
                </span>
                <span className="text-sm sm:text-base font-semibold">{req}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* The Twist: Fight a Trainer Card */}
        <div className="gaming-card p-6 sm:p-8 rounded-2xl border border-pink-500/30 bg-gradient-to-br from-[#1d0d29]/80 to-[#100619]/90 space-y-6 relative overflow-hidden shadow-[0_0_30px_rgba(236,72,153,0.15)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-400 shadow-[0_0_15px_#ec4899]">
              <Swords className="w-5 h-5 animate-pulse" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300">
              The Twist: Defeat a Trainer
            </h2>
          </div>
          
          <p className="text-sm text-gray-300 leading-relaxed font-medium">
            You must defeat at least <span className="text-pink-400 font-bold">one</span> of our trainers below. 
            Win and meet the requirements → <span className="text-green-400 font-bold">accepted</span>. 
            Lose → <span className="text-red-400 font-bold">denied</span>.
          </p>

          <div className="space-y-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center space-x-2">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              <span>Official Elder Trainers</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trainers.map((trainer, idx) => (
                <div 
                  key={idx}
                  onMouseEnter={() => sfx.playHover()}
                  className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-purple-500/15 hover:border-cyan-400/40 transition-all hover:scale-[1.02]"
                >
                  <span className="text-sm font-bold text-gray-200 truncate">{trainer.name}</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-cyan-300 uppercase tracking-wider border border-purple-400/20">
                    {trainer.region}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-pink-400/90 font-bold">
            Limited slots: only 20 spots per Clan War. Apply fast.
          </p>
        </div>

        {/* CTA Verification Block */}
        <div className="flex flex-col items-center justify-center space-y-4 pt-4">
          {status === "loading" ? (
            <div className="animate-pulse text-cyan-400 font-black uppercase tracking-wider text-xs">
              Verifying Discord credentials...
            </div>
          ) : !session ? (
            <div className="w-full text-center space-y-4">
              <button
                onClick={() => signIn("discord", { callbackUrl: "/apply" })}
                onMouseEnter={() => sfx.playHover()}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-black uppercase tracking-wider px-8 py-4 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
                </svg>
                <span>Sign in with Discord to Apply</span>
              </button>
              <p className="text-xs text-gray-400">You will verify via Discord and need the Applicant role.</p>
            </div>
          ) : (
            <div className="w-full text-center space-y-4">
              {user.isApplicant ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-cyan-300 font-bold text-xs bg-cyan-950/40 border border-cyan-500/30 px-4 py-2 rounded-xl max-w-sm mx-auto shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Role Verified: Applicant (1501943775021371543)</span>
                  </div>
                  
                  {/* Go to Form Button with Gojo Laser Effect */}
                  <button
                    onClick={handleApplyClick}
                    onMouseEnter={() => sfx.playHover()}
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black uppercase tracking-wider px-8 py-4 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all hover:scale-105"
                  >
                    <span>Proceed to Application Form</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="gaming-card p-6 border-red-500/30 bg-red-950/20 max-w-xl mx-auto rounded-2xl space-y-4 text-left shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                  <div className="flex items-start space-x-3 text-red-400">
                    <ShieldX className="w-6 h-6 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-white uppercase text-sm">Applicant Role Required</h3>
                      <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                        Your Discord account is missing the required **Applicant** role (`1501943775021371543`) in the Elder server. 
                        Please get the role in the Discord server, then refresh.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <a
                      href="https://discord.gg/elder" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-2 rounded-xl text-xs"
                    >
                      Join Elder Discord
                    </a>
                    <button
                      onClick={() => window.location.reload()}
                      className="flex-grow bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-md"
                    >
                      Refresh Eligibility
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
