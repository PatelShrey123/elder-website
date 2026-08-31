"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/sound";
import { Swords, Zap } from "lucide-react";

interface GojoCutsceneProps {
  isActive: boolean;
  onComplete: () => void;
  targetName?: string;
}

export default function GojoCutscene({ isActive, onComplete, targetName = "APPLY NOW" }: GojoCutsceneProps) {
  // Sequence stages:
  // 1. "clash" -> Sukuna vs Gojo Domain Clash
  // 2. "levitate" -> Gojo flies into the sky / Infinite Void awakening
  // 3. "purple" -> Gojo merges Red + Blue and fires 200% Hollow Purple
  // 4. "annihilation" -> Laser Cannon Blast tears screen
  // 5. "flash" -> Reality flash out
  const [phase, setPhase] = useState<"idle" | "clash" | "levitate" | "purple" | "annihilation" | "flash">("idle");

  useEffect(() => {
    if (isActive) {
      // Stage 1: Sukuna & Gojo Domain Clash
      setPhase("clash");
      sfx.playInfiniteVoid();

      // Stage 2: Gojo Levitation in the Sky
      const levitateTimer = setTimeout(() => {
        setPhase("levitate");
        sfx.playEnergyFusion();
      }, 1300);

      // Stage 3: Hollow Purple Charge
      const purpleTimer = setTimeout(() => {
        setPhase("purple");
      }, 2500);

      // Stage 4: Catastrophic Laser Blast
      const blastTimer = setTimeout(() => {
        setPhase("annihilation");
        sfx.playHollowPurpleBeam();
      }, 3400);

      // Stage 5: Flash
      const flashTimer = setTimeout(() => {
        setPhase("flash");
      }, 4300);

      // Finish and redirect
      const finishTimer = setTimeout(() => {
        setPhase("idle");
        onComplete();
      }, 4700);

      return () => {
        clearTimeout(levitateTimer);
        clearTimeout(purpleTimer);
        clearTimeout(blastTimer);
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
        <div className="absolute top-0 left-0 right-0 h-12 sm:h-16 bg-black z-30 border-b border-purple-500/20 flex items-center justify-between px-6">
          <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>JUJUTSU BATTLE CLASH • ELDER PROTOCOL</span>
          </div>
          <span className="text-[10px] font-black text-pink-400 tracking-widest uppercase bg-pink-950/60 px-2.5 py-1 rounded border border-pink-500/30">
            TARGET: [{targetName}]
          </span>
        </div>

        {/* Cinematic Letterbox Subtitle Footer */}
        <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-black z-30 border-t border-purple-500/20 flex items-center justify-center px-4">
          <p className="text-xs sm:text-sm font-black tracking-widest text-gray-300 uppercase text-center">
            {phase === "clash" && "「領域展開」 伏魔御廚子 × 無量空処 — MALEVOLENT SHRINE VS INFINITE VOID"}
            {phase === "levitate" && "「天上天下唯我独尊」 THROUGHOUT HEAVEN AND EARTH, I ALONE AM THE HONORED ONE"}
            {phase === "purple" && "「位相、波長、九綱」 術式反転「赫」 × 術式順転「蒼」 → 虚式「茈」"}
            {phase === "annihilation" && "HOLLOW PURPLE 200% MAXIMUM OUTPUT ANNIHILATION CANNON"}
            {phase === "flash" && "BARRIER CLEARED — INITIATING APPLICANT ACCESS"}
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
            className="absolute inset-0 flex items-center justify-center bg-[#05020a] overflow-hidden"
          >
            {/* Split Screen Battle Arena */}
            <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full">
              
              {/* Left Side: Sukuna (Malevolent Shrine) */}
              <div className="relative flex flex-col items-center justify-center p-8 bg-gradient-to-r from-red-950/90 via-[#1a0505] to-transparent border-r-2 border-red-500/40 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.3)_0,transparent_70%)] animate-pulse" />
                
                <motion.div
                  initial={{ x: -60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="relative z-10 flex flex-col items-center text-center space-y-4"
                >
                  <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-2 border-red-500/70 shadow-[0_0_50px_#ef4444] bg-[#120303] flex items-center justify-center">
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

              {/* Right Side: Gojo Satoru with requested Tenor GIF */}
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
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-cyan-400 p-1 shadow-[0_0_40px_#ec4899] flex items-center justify-center"
              >
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                  <Swords className="w-8 h-8 text-white animate-pulse" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            STAGE 2: GOJO FLYING IN THE AIR / SKY LEVITATION
        ========================================================================= */}
        {phase === "levitate" && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#05010c] overflow-hidden"
          >
            <div className="relative w-full max-w-3xl h-[60vh] rounded-3xl overflow-hidden border-2 border-purple-500/50 shadow-[0_0_80px_rgba(168,85,247,0.4)] bg-black flex items-center justify-center">
              <img
                src="/anime/gojo_tenor.gif"
                alt="Gojo flying in the sky"
                className="w-full h-full object-cover opacity-90 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 flex flex-col justify-end p-8 text-center">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="space-y-2"
                >
                  <span className="text-xs font-black uppercase tracking-[0.4em] text-cyan-300 bg-black/70 px-3 py-1 rounded-full border border-cyan-400/40 inline-block">
                    LIMITLESS TECHNIQUE • FLYING LEVITATION
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-200 to-pink-400 drop-shadow-[0_0_20px_#a855f7]">
                    「天上天下唯我独尊」
                  </h2>
                  <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                    Throughout Heaven & Earth, I Alone Am The Honored One
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            STAGE 3: GOJO HOLLOW PURPLE FUSION & CHARGING
        ========================================================================= */}
        {phase === "purple" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#080214] overflow-hidden"
          >
            <div className="relative w-full max-w-3xl h-[60vh] rounded-3xl overflow-hidden border-2 border-pink-500/60 shadow-[0_0_100px_rgba(236,72,153,0.6)] bg-black flex items-center justify-center">
              <img
                src="/anime/gojo_purple.gif"
                alt="Gojo Hollow Purple Charge"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/anime/gojo_tenor.gif';
                }}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-transparent to-transparent flex flex-col justify-end p-8 text-center">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="space-y-2"
                >
                  <span className="text-xs font-black uppercase tracking-[0.5em] text-pink-400 bg-black/80 px-3 py-1 rounded-full border border-pink-500/50 inline-block">
                    SECRET TECHNIQUE: HOLLOW PURPLE
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-fuchsia-400 drop-shadow-[0_0_30px_#ec4899]">
                    虚式「茈」 — MURASAKI
                  </h2>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            STAGE 4: DEVASTATING LASER BEAM CANNON & SCREEN ANNIHILATION
        ========================================================================= */}
        {phase === "annihilation" && (
          <div className="absolute inset-0 flex items-center justify-center z-20 overflow-hidden bg-[#04010a]">
            <motion.div
              animate={{
                x: [-25, 25, -20, 20, -10, 10, 0],
                y: [15, -15, 12, -12, 6, -6, 0],
              }}
              transition={{ duration: 0.7, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="absolute inset-0 opacity-80 mix-blend-screen bg-[repeating-conic-gradient(from_0deg,#e879f9_0deg_3deg,transparent_3deg_10deg)] animate-spin" style={{ animationDuration: '2s' }} />

              <motion.div
                initial={{ scaleX: 0.1, scaleY: 0.2, opacity: 0 }}
                animate={{ scaleX: [0.2, 2.5, 4], scaleY: [0.5, 6, 2], opacity: [0.9, 1, 0.8] }}
                transition={{ duration: 0.85, ease: "easeOut" }}
                className="w-full h-44 sm:h-72 bg-gradient-to-r from-cyan-300 via-white to-fuchsia-600 shadow-[0_0_180px_rgba(236,72,153,1),0_0_120px_rgba(168,85,247,1)] rounded-full mix-blend-screen"
              />

              <motion.div
                initial={{ scale: 0.3 }}
                animate={{ scale: [1, 5, 9], opacity: [1, 0.9, 0] }}
                transition={{ duration: 0.85 }}
                className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-white via-purple-500 to-pink-600 shadow-[0_0_180px_#ec4899] blur-sm"
              />

              <motion.div
                initial={{ scale: 0.1, borderWidth: "24px" }}
                animate={{ scale: 7, opacity: 0, borderWidth: "1px" }}
                transition={{ duration: 0.8 }}
                className="absolute w-80 h-80 rounded-full border-cyan-300 shadow-[0_0_80px_#06b6d4]"
              />
              <motion.div
                initial={{ scale: 0.1, borderWidth: "28px" }}
                animate={{ scale: 6.5, opacity: 0, borderWidth: "1px" }}
                transition={{ duration: 0.75, delay: 0.06 }}
                className="absolute w-80 h-80 rounded-full border-fuchsia-400 shadow-[0_0_100px_#e879f9]"
              />
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
            className="absolute inset-0 bg-gradient-to-b from-white via-purple-100 to-cyan-50 z-40 pointer-events-none"
          />
        )}

      </div>
    </AnimatePresence>
  );
}
