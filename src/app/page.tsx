"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Swords, ClipboardList, Award, Target, Flame } from "lucide-react";
import GojoCutscene from "@/components/GojoCutscene";
import { sfx } from "@/lib/sound";

export default function Home() {
  const router = useRouter();
  const [isLaserTriggered, setIsLaserTriggered] = useState(false);

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLaserTriggered) return;
    setIsLaserTriggered(true);
  };

  const handleCutsceneComplete = () => {
    router.push("/requirements");
  };

  return (
    <div className="relative flex-grow flex items-center justify-center py-20 px-4 overflow-hidden">
      
      {/* Gojo Laser Beam / Hollow Purple Cutscene Overlay */}
      <GojoCutscene
        isActive={isLaserTriggered}
        onComplete={handleCutsceneComplete}
        targetName="APPLY NOW"
      />

      <div className="max-w-4xl w-full text-center relative z-10 space-y-12">
        
        {/* Hero Title */}
        <div className="space-y-6">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase leading-[1.08] drop-shadow-[0_0_35px_rgba(147,51,234,0.3)]">
            Thanks for your interest in joining <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 drop-shadow-[0_0_30px_rgba(236,72,153,0.5)]">
              Elder Clan
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-300 text-sm sm:text-base md:text-lg font-medium leading-relaxed">
            Elder is recruiting active, loyal, social players for the next Clan War. 
            Slots are limited — only 15 will be accepted.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-2">
          
          {/* Main Apply Button with Laser Trigger */}
          <button
            onClick={handleApplyClick}
            onMouseEnter={() => sfx.playHover()}
            className="relative group w-full sm:w-auto overflow-hidden rounded-2xl p-[2px] transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(168,85,247,0.5)]"
          >
            {/* Spinning Gradient Border */}
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-600 rounded-2xl animate-spin" style={{ animationDuration: '4s' }} />
            
            <div className="relative flex items-center justify-center space-x-3 bg-gradient-to-r from-[#170c2e] to-[#0d071b] px-9 py-4 rounded-[14px] text-white font-black text-sm uppercase tracking-widest group-hover:bg-opacity-80 transition-all">
              <Swords className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span className="tracking-wider">Apply Now</span>
            </div>
          </button>

          {/* Results Link */}
          <Link
            href="/results"
            onMouseEnter={() => sfx.playHover()}
            className="w-full sm:w-auto flex items-center justify-center space-x-2.5 bg-purple-950/30 hover:bg-purple-900/40 text-gray-200 hover:text-white border border-purple-500/30 hover:border-purple-400/60 font-black text-sm uppercase tracking-wider px-9 py-4 rounded-2xl transition-all hover:scale-105 backdrop-blur-sm"
          >
            <ClipboardList className="w-4 h-4 text-purple-400" />
            <span>Check Results</span>
          </Link>
        </div>

        {/* Feature Cards with Sleek Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto pt-6 text-left">
          
          <div 
            onMouseEnter={() => sfx.playHover()}
            className="gaming-card p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-[#160f26]/80 to-[#0c0717]/80"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-cyan-400 border border-purple-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Level Requirement</h3>
            </div>
            <p className="text-2xl font-black text-white">Level 35+</p>
            <p className="text-xs text-gray-400 mt-1">High weekly combat activity required</p>
          </div>

          <div 
            onMouseEnter={() => sfx.playHover()}
            className="gaming-card p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-[#160f26]/80 to-[#0c0717]/80"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-pink-400 border border-purple-500/30 shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Score Threshold</h3>
            </div>
            <p className="text-2xl font-black text-white">50,000+ XP</p>
            <p className="text-xs text-gray-400 mt-1">100k+ per week for alt accounts</p>
          </div>

          <div 
            onMouseEnter={() => sfx.playHover()}
            className="gaming-card p-6 rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-[#160f26]/80 to-[#0c0717]/80"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Swords className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">The Twist</h3>
            </div>
            <p className="text-2xl font-black text-white">Defeat a Trainer</p>
            <p className="text-xs text-gray-400 mt-1">Must win against an official trainer</p>
          </div>

        </div>

      </div>
    </div>
  );
}
