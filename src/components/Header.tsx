"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, ClipboardList, Home, Swords, Zap } from "lucide-react";
import { sfx } from "@/lib/sound";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const user = session?.user as any;
  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-purple-500/15 bg-[#07050c]/85 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo with Gojo Cursed Energy Glow */}
        <Link 
          href="/" 
          onMouseEnter={() => sfx.playHover()}
          className="flex items-center space-x-2.5 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-cyan-400 p-0.5 shadow-[0_0_20px_rgba(168,85,247,0.5)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] transition-all">
            <div className="w-full h-full bg-[#0d091a] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-400 group-hover:from-cyan-300 group-hover:to-pink-400 transition-all">
              ELDER
            </span>
            <span className="text-[9px] font-bold tracking-widest text-purple-400/80 uppercase -mt-1">
              KIRKA.IO CLAN
            </span>
          </div>
        </Link>

        {/* Navigation with sound cues */}
        <nav className="hidden md:flex items-center space-x-1.5 bg-purple-950/20 border border-purple-500/20 p-1 rounded-xl">
          <Link
            href="/"
            onMouseEnter={() => sfx.playHover()}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              isActive("/")
                ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>

          <Link
            href="/requirements"
            onMouseEnter={() => sfx.playHover()}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              isActive("/requirements")
                ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Requirements</span>
          </Link>

          <Link
            href="/results"
            onMouseEnter={() => sfx.playHover()}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              isActive("/results")
                ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Results</span>
          </Link>

          {user?.isOfficer && (
            <Link
              href="/staff"
              onMouseEnter={() => sfx.playHover()}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                isActive("/staff")
                  ? "bg-red-600/30 text-red-300 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                  : "text-red-400 hover:text-red-300 hover:bg-red-500/10"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Officer HQ</span>
            </Link>
          )}
        </nav>

        {/* User Account / Discord Log In */}
        <div className="flex items-center space-x-3">
          {session ? (
            <div className="flex items-center space-x-3 bg-purple-950/30 border border-purple-500/20 rounded-xl p-1.5 pr-3 shadow-lg">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "Discord User"}
                  className="w-8 h-8 rounded-lg object-cover border border-cyan-400/40"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-black text-xs text-white">
                  {user.name?.charAt(0) || "U"}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-gray-200 truncate max-w-[110px]">
                  {user.name}
                </p>
                <span className="inline-block text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-500/20 text-cyan-300 border border-purple-500/30">
                  {user.isOfficer ? "Officer" : user.isApplicant ? "Applicant" : "Guest"}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-1 hover:text-red-400 text-gray-400 transition-colors ml-1"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("discord")}
              onMouseEnter={() => sfx.playHover()}
              className="flex items-center space-x-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
              </svg>
              <span>Discord Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex border-t border-purple-500/10 divide-x divide-purple-500/10 bg-[#07050c]/90">
        <Link href="/" className="flex-1 py-2.5 text-center text-[11px] font-bold text-gray-400 hover:text-white">
          Home
        </Link>
        <Link href="/requirements" className="flex-1 py-2.5 text-center text-[11px] font-bold text-gray-400 hover:text-white">
          Reqs
        </Link>
        <Link href="/results" className="flex-1 py-2.5 text-center text-[11px] font-bold text-gray-400 hover:text-white">
          Results
        </Link>
        {user?.isOfficer && (
          <Link href="/staff" className="flex-1 py-2.5 text-center text-[11px] font-bold text-red-400 hover:text-red-300">
            HQ
          </Link>
        )}
      </div>
    </header>
  );
}
