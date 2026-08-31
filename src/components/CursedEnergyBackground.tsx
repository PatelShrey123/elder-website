"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { sfx } from "@/lib/sound";
import CRTWarp from "./CRTWarp";

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
      
      {/* React Bits CRTWarp WebGL Shader Background */}
      <div className="absolute inset-0 opacity-45 pointer-events-auto">
        <CRTWarp
          color="#9333ea"
          backgroundColor="#07050c"
          speed={0.4}
          curvature={0.18}
          scanlineStrength={0.16}
          scanlineFrequency={160}
          waveAmplitude={0.25}
          waveFrequency={2.2}
          bloom={1.4}
          bloomRadius={1.2}
          noise={0.08}
          vignette={0.2}
          brightness={1.15}
          pixelation={1}
          rgbShift={0.012}
          mouseReact={true}
          mouseStrength={0.4}
          dpr={1}
          fps={30}
        />
      </div>

      {/* Deep Dark Vignette Gradient Overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#07050c_90%)] pointer-events-none" />

      {/* Floating Audio Toggle Button */}
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
