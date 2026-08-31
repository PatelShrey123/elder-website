"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX, Sparkles } from "lucide-react";
import { sfx } from "@/lib/sound";

export default function CursedEnergyBackground() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    sfx.enabled = newState;
    if (newState) {
      sfx.playHover();
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      
      {/* Animated Subtle Domain Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f153815_1px,transparent_1px),linear-gradient(to_bottom,#1f153815_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Cursed Energy Aura Gradient Spheres */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: "6s" }} />
      <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[160px]" />

      {/* Floating Cursed Energy Embers */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-t from-purple-400 to-cyan-300 opacity-30 blur-[1px] animate-bounce"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 6 + 4}s`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Sound FX Toggle Button in Bottom Right */}
      <div className="fixed bottom-4 right-4 z-40 pointer-events-auto">
        <button
          onClick={toggleSound}
          className="flex items-center space-x-2 bg-[#120e1e]/90 hover:bg-[#1c1530] text-gray-300 hover:text-cyan-300 border border-purple-500/30 px-3 py-1.5 rounded-full shadow-lg shadow-purple-950/40 text-xs font-bold transition-all backdrop-blur-md hover:scale-105"
          title="Toggle Anime Sound FX"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>SFX: ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-500">SFX: OFF</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
