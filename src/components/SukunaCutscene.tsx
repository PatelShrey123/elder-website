"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/sound";
import { Flame, Swords, Zap } from "lucide-react";

interface SukunaCutsceneProps {
  isActive: boolean;
  onComplete: () => void;
  targetName?: string;
}

export default function SukunaCutscene({
  isActive,
  onComplete,
  targetName = "APPLICATION FORM",
}: SukunaCutsceneProps) {
  // Sequence stages:
  // 1. "clash" -> Sukuna vs Gojo Domain Clash
  // 2. "shrine" -> Sukuna summoning Malevolent Shrine / King of Curses awakening
  // 3. "cleave" -> Cleave & Dismantle / World Cutting Slash tearing space
  // 4. "fuga" -> 「開」 Fuga / Fire Arrow catastrophic inferno blast
  // 5. "flash" -> Crimson reality flash transition
  const [phase, setPhase] = useState<
    "idle" | "clash" | "shrine" | "cleave" | "fuga" | "flash"
  >("idle");

  useEffect(() => {
    if (isActive) {
      // Stage 1: Sukuna & Gojo Domain Clash
      setPhase("clash");
      sfx.playMalevolentShrine();

      // Stage 2: Malevolent Shrine Summoning
      const shrineTimer = setTimeout(() => {
        setPhase("shrine");
        sfx.playEnergyFusion();
      }, 1300);

      // Stage 3: Cleave & Dismantle Slashes
      const cleaveTimer = setTimeout(() => {
        setPhase("cleave");
        sfx.playCleaveDismantle();
      }, 2500);

      // Stage 4: Fire Arrow (Fuga) Inferno Blast
      const fugaTimer = setTimeout(() => {
        setPhase("fuga");
        sfx.playFireArrowFuga();
      }, 3400);

      // Stage 5: Flash
      const flashTimer = setTimeout(() => {
        setPhase("flash");
      }, 4400);

      // Finish and redirect to /apply
      const finishTimer = setTimeout(() => {
        setPhase("idle");
        onComplete();
      }, 4800);

      return () => {
        clearTimeout(shrineTimer);
        clearTimeout(cleaveTimer);
        clearTimeout(fugaTimer);
        clearTimeout(flashTimer);
        clearTimeout(finishTimer);
      };
    } else {
      setPhase("idle");
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto flex items-center justify-center bg-black text-white select-none">
        
        {/* Cinematic Letterbox Header */}
        <div className="absolute top-0 left-0 right-0 h-12 sm:h-16 bg-black z-30 border-b border-red-500/30 flex items-center justify-between px-6">
          <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-[0.3em] text-red-400">
            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
            <span>KING OF CURSES • SUKUNA PROTOCOL</span>
          </div>
          <span className="text-[10px] font-black text-red-300 tracking-widest uppercase bg-red-950/80 px-2.5 py-1 rounded border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
            TARGET: [{targetName}]
          </span>
        </div>

        {/* Cinematic Letterbox Subtitle Footer */}
        <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-black z-30 border-t border-red-500/30 flex items-center justify-center px-4">
          <p className="text-xs sm:text-sm font-black tracking-widest text-red-200 uppercase text-center drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]">
            {phase === "clash" && "「領域展開」 伏魔御廚子 × 無量空処 — MALEVOLENT SHRINE VS INFINITE VOID"}
            {phase === "shrine" && "「領域展開」 伏魔御廚子 — KING OF CURSES SUMMONS MALEVOLENT SHRINE"}
            {phase === "cleave" && "「解・捌」 CLEAVE & DISMANTLE — WORLD CUTTING SLASH TEARING REALITY"}
            {phase === "fuga" && "「開」 FUGA — FIRE ARROW MAXIMUM OUTPUT CATACLYSM"}
            {phase === "flash" && "BARRIER INCINERATED — ENTERING CLAN APPLICATION"}
          </p>
        </div>

        {/* =========================================================================
            STAGE 1: SUKUNA VS GOJO DOMAIN CLASH
        ========================================================================= */}
        {phase === "clash" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-[#070105] overflow-hidden"
          >
            {/* Split Screen Battle Arena */}
            <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full">
              
              {/* Left Side: Sukuna (Malevolent Shrine) */}
              <div className="relative flex flex-col items-center justify-center p-8 bg-gradient-to-r from-red-950/95 via-[#200505] to-transparent border-r-2 border-red-500/50 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.35)_0,transparent_70%)] animate-pulse" />
                
                <motion.div
                  initial={{ x: -60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="relative z-10 flex flex-col items-center text-center space-y-4"
                >
                  <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-2 border-red-500 shadow-[0_0_50px_#ef4444] bg-[#140303] flex items-center justify-center">
                    <img
                      src="/anime/sukuna.jpg"
                      alt="Ryomen Sukuna Malevolent Shrine"
                      className="w-full h-full object-cover scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/anime/sukuna_shrine.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end justify-center p-3">
                      <span className="text-xs font-black uppercase tracking-widest text-red-400 bg-black/85 px-2.5 py-1 rounded border border-red-500/50">
                        RYOMEN SUKUNA • 両面宿儺
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-black text-red-400 uppercase tracking-wider">
                      領域展開「伏魔御廚子」
                    </h3>
                    <p className="text-xs font-bold text-red-300/80 uppercase tracking-widest">
                      Malevolent Shrine
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Right Side: Gojo Satoru */}
              <div className="relative flex flex-col items-center justify-center p-8 bg-gradient-to-l from-cyan-950/90 via-[#05111d] to-transparent overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.3)_0,transparent_70%)] animate-pulse" />
                
                <motion.div
                  initial={{ x: 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="relative z-10 flex flex-col items-center text-center space-y-4"
                >
                  <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-2 border-cyan-400/70 shadow-[0_0_50px_#06b6d4] bg-[#020b14] flex items-center justify-center">
                    <img
                      src="/anime/gojo_tenor.gif"
                      alt="Satoru Gojo Infinite Void"
                      className="w-full h-full object-cover scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/anime/gojo_void.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end justify-center p-3">
                      <span className="text-xs font-black uppercase tracking-widest text-cyan-300 bg-black/85 px-2.5 py-1 rounded border border-cyan-400/50">
                        SATORU GOJO • 五条悟
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-black text-cyan-300 uppercase tracking-wider">
                      領域展開「無量空処」
                    </h3>
                    <p className="text-xs font-bold text-cyan-300/80 uppercase tracking-widest">
                      Infinite Void
                    </p>
                  </div>
                </motion.div>
              </div>

            </div>

            {/* Center VS Clash Emblem */}
            <div className="absolute z-20 flex items-center justify-center">
              <motion.div
                initial={{ scale: 3, rotate: -45, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-red-600 via-orange-500 to-cyan-400 p-1 shadow-[0_0_40px_#ef4444] flex items-center justify-center"
              >
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                  <Swords className="w-8 h-8 text-white animate-pulse" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            STAGE 2: SUKUNA MALEVOLENT SHRINE SUMMONING
        ========================================================================= */}
        {phase === "shrine" && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0202] overflow-hidden"
          >
            <div className="relative w-full max-w-3xl h-[60vh] rounded-3xl overflow-hidden border-2 border-red-500/70 shadow-[0_0_90px_rgba(239,68,68,0.5)] bg-black flex items-center justify-center">
              <img
                src="/anime/sukuna.jpg"
                alt="Sukuna Malevolent Shrine"
                className="w-full h-full object-cover opacity-90 scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/anime/sukuna_shrine.png';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-red-950/95 via-transparent to-black/60 flex flex-col justify-end p-8 text-center">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="space-y-2"
                >
                  <span className="text-xs font-black uppercase tracking-[0.4em] text-red-400 bg-black/80 px-3.5 py-1 rounded-full border border-red-500/60 inline-block shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                    DOMAIN EXPANSION • INNATE DOMAIN
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-amber-300 drop-shadow-[0_0_30px_#ef4444]">
                    領域展開「伏魔御廚子」
                  </h2>
                  <p className="text-xs font-bold text-red-200 uppercase tracking-widest">
                    MALEVOLENT SHRINE — 200M RADIUS GUARANTEED-HIT DOMAIN
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            STAGE 3: SUKUNA CLEAVE & DISMANTLE SLASHES (WORLD CUTTING SLASH)
        ========================================================================= */}
        {phase === "cleave" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#080101] overflow-hidden"
          >
            {/* Rapid Slash Grid Effect */}
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
              <motion.div
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ opacity: [0, 1, 0.8, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-full h-full relative"
              >
                {/* Diagonal Slash 1 */}
                <div className="absolute top-1/4 left-0 w-[150%] h-[3px] bg-gradient-to-r from-transparent via-red-500 to-white -rotate-12 shadow-[0_0_25px_#ef4444] animate-pulse" />
                {/* Diagonal Slash 2 */}
                <div className="absolute top-1/2 left-[-20%] w-[150%] h-[4px] bg-gradient-to-r from-transparent via-white to-red-600 rotate-[22deg] shadow-[0_0_30px_#f87171]" />
                {/* Horizontal Slash 3 */}
                <div className="absolute top-3/4 left-0 w-full h-[3px] bg-gradient-to-r from-red-600 via-orange-400 to-transparent shadow-[0_0_25px_#ea580c]" />
                {/* Vertical Cut Slash 4 */}
                <div className="absolute left-1/3 top-0 h-full w-[3px] bg-gradient-to-b from-transparent via-red-400 to-white shadow-[0_0_25px_#ef4444]" />
              </motion.div>
            </div>

            <div className="relative w-full max-w-3xl h-[60vh] rounded-3xl overflow-hidden border-2 border-red-500 shadow-[0_0_120px_rgba(239,68,68,0.7)] bg-black flex items-center justify-center">
              <img
                src="/anime/sukuna.jpg"
                alt="Sukuna Cleave & Dismantle"
                className="w-full h-full object-cover scale-110 filter brightness-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/anime/sukuna_demon.jpg';
                }}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-red-950/90 via-transparent to-transparent flex flex-col justify-end p-8 text-center">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="space-y-2"
                >
                  <span className="text-xs font-black uppercase tracking-[0.5em] text-red-400 bg-black/80 px-3.5 py-1 rounded-full border border-red-500/60 inline-block shadow-[0_0_20px_#ef4444]">
                    CUTTING TECHNIQUE: CLEAVE & DISMANTLE
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-orange-400 drop-shadow-[0_0_35px_#ef4444]">
                    「解」・「捌」 — KAI & HACHI
                  </h2>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            STAGE 4: SUKUNA FIRE ARROW (FUGA) INFERNO BLAST
        ========================================================================= */}
        {phase === "fuga" && (
          <div className="absolute inset-0 flex items-center justify-center z-20 overflow-hidden bg-[#0a0101]">
            <motion.div
              animate={{
                x: [-30, 30, -22, 22, -12, 12, 0],
                y: [18, -18, 14, -14, 7, -7, 0],
              }}
              transition={{ duration: 0.75, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Spinning Cursed Energy Vortex */}
              <div 
                className="absolute inset-0 opacity-85 mix-blend-screen bg-[repeating-conic-gradient(from_0deg,#ef4444_0deg_4deg,transparent_4deg_12deg)] animate-spin" 
                style={{ animationDuration: '1.8s' }} 
              />

              {/* Fire Arrow Core Ray */}
              <motion.div
                initial={{ scaleX: 0.1, scaleY: 0.2, opacity: 0 }}
                animate={{ scaleX: [0.2, 2.8, 4.5], scaleY: [0.5, 7, 2.5], opacity: [0.9, 1, 0.85] }}
                transition={{ duration: 0.85, ease: "easeOut" }}
                className="w-full h-44 sm:h-72 bg-gradient-to-r from-orange-400 via-amber-200 to-red-600 shadow-[0_0_200px_rgba(239,68,68,1),0_0_140px_rgba(249,115,22,1)] rounded-full mix-blend-screen"
              />

              {/* Central Inferno Explosion */}
              <motion.div
                initial={{ scale: 0.3 }}
                animate={{ scale: [1, 5.5, 10], opacity: [1, 0.95, 0] }}
                transition={{ duration: 0.85 }}
                className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-white via-orange-500 to-red-700 shadow-[0_0_200px_#ef4444] blur-sm"
              />

              {/* Shockwave Rings */}
              <motion.div
                initial={{ scale: 0.1, borderWidth: "26px" }}
                animate={{ scale: 7.5, opacity: 0, borderWidth: "1px" }}
                transition={{ duration: 0.8 }}
                className="absolute w-80 h-80 rounded-full border-orange-400 shadow-[0_0_90px_#f97316]"
              />
              <motion.div
                initial={{ scale: 0.1, borderWidth: "30px" }}
                animate={{ scale: 7, opacity: 0, borderWidth: "1px" }}
                transition={{ duration: 0.75, delay: 0.05 }}
                className="absolute w-80 h-80 rounded-full border-red-500 shadow-[0_0_110px_#ef4444]"
              />

              <div className="absolute z-30 flex flex-col items-center justify-center text-center">
                <h1 className="text-4xl sm:text-7xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-400 to-red-500 drop-shadow-[0_0_40px_#ea580c] tracking-widest">
                  「開」 FUGA
                </h1>
                <p className="text-xs sm:text-sm font-black text-white uppercase tracking-[0.4em] drop-shadow-[0_0_15px_#ef4444]">
                  FIRE ARROW MAXIMUM INFERNO
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {/* =========================================================================
            STAGE 5: FULL-SCREEN FLASH OUT
        ========================================================================= */}
        {phase === "flash" && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-gradient-to-b from-white via-red-200 to-orange-100 z-40 pointer-events-none"
          />
        )}

      </div>
    </AnimatePresence>
  );
}
