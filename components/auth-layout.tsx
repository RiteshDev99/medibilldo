"use client";

import Image from "next/image";
import { Shield, FileText, Activity, Moon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    toast.info("Dark mode toggle is illustrative for this mockup.");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-white text-zinc-950 font-sans relative">
      {/* Left panel (Dark side with Mascot & Details) - Hidden on mobile, takes 5 columns on desktop */}
      <div className="lg:col-span-5 bg-[radial-gradient(circle_at_center,rgba(39,39,42,0.8)_0%,rgba(9,9,11,1)_100%)] text-white relative hidden lg:flex flex-col justify-between p-12 overflow-hidden select-none">

        {/* Top left dot grid decorative pattern */}
        <div className="absolute top-10 left-10 opacity-20 grid grid-cols-6 gap-2">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="size-1 rounded-full bg-zinc-400" />
          ))}
        </div>

        {/* Bottom right dot grid decorative pattern */}
        <div className="absolute bottom-32 right-16 opacity-20 grid grid-cols-6 gap-2">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="size-1 rounded-full bg-zinc-400" />
          ))}
        </div>

        {/* Top spacer — trimmed down so the mascot sits higher, matching the reference */}
        <div className="h-2" />

        {/* Center Content: Mascot Logo & Taglines */}
        <div className="z-10 flex flex-col items-start justify-start flex-1 w-full">
          <div className="relative w-full flex justify-center overflow-visible">
            {/*
              The source PNG has built-in padding around the artwork, so at w-full it
              renders smaller than it looks in the mockup. Scaling the wrapper up
              compensates for that without distorting the layout box below it.
            */}
            <div className="w-full max-w-[620px] scale-125 origin-top">
              <Image
                src="/mascot.png"
                width={620}
                height={384}
                alt="MediBilldo Mascot"
                className="w-full h-auto object-contain drop-shadow-[0_12px_40px_rgba(255,255,255,0.08)]  transition-transform duration-350"
                priority
              />
            </div>
          </div>

          {/* Tightened gap so the tagline sits close under the mascot, like the reference */}
          <div className="h-[18px] w-full shrink-0" />

          <div className="space-y-3 w-full text-left">
            <div className="w-8 h-1 bg-white rounded-full opacity-60" />
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-white">
              Smart Billing.<br />Better Healthcare.
            </h2>
            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              MediBilldo is your all-in-one solution for pharmacy & medical billing.
            </p>
          </div>
        </div>

        {/* Bottom badging */}
        <div className="z-10 grid grid-cols-3 gap-4 border-t border-zinc-900/60 pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="size-12 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-center mb-2">
              <Shield className="size-5 text-zinc-300" />
            </div>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Secure &</span>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Reliable</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="size-12 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-center mb-2">
              <FileText className="size-5 text-zinc-300" />
            </div>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Fast &</span>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Efficient</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="size-12 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-center mb-2">
              <Activity className="size-5 text-zinc-300" />
            </div>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Insightful</span>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Reports</span>
          </div>
        </div>

        {/* Wave background line drawing in bottom-right corner */}
        <div className="absolute bottom-0 right-0 w-48 h-32 opacity-25 pointer-events-none z-0">
          <svg viewBox="0 0 100 100" className="w-full h-full text-zinc-800 stroke-current fill-none">
            <path d="M 0,50 Q 25,20 50,50 T 100,50" strokeWidth="1.5" />
            <path d="M 0,60 Q 25,30 50,60 T 100,60" strokeWidth="0.8" />
          </svg>
        </div>

        {/* The Curve wave edge mask divider */}
        <svg
          className="absolute top-0 bottom-0 right-0 h-full w-64 text-white fill-current translate-x-1/2 pointer-events-none z-20"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path d="M50,0 C10,30 90,70 50,100 L100,100 L100,0 Z" />
        </svg>
      </div>

      {/* Right panel (Form content container) - Takes full width on mobile, 7 columns on desktop */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12 md:p-20 bg-zinc-50/50">
        <div className="w-full max-w-[420px] bg-white rounded-3xl border border-zinc-150 shadow-md p-8 sm:p-10 relative">
          {children}
        </div>
      </div>

      {/* Light/Dark mode toggle circular button in bottom-right corner
      <button
        onClick={toggleDarkMode}
        className="fixed bottom-6 right-6 p-3 rounded-full bg-zinc-950 text-white hover:bg-zinc-800 transition-colors shadow-lg z-30 flex items-center justify-center active:scale-95 duration-100"
      >
        <Moon className="size-4" />
      </button> */}
    </div>
  );
}