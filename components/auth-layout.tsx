"use client";

import { Activity, FileText, Shield } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    toast.info("Dark mode toggle is illustrative for this mockup.");
  };

  return (
    <div className="relative grid min-h-screen bg-white font-sans text-zinc-950 lg:grid-cols-12">
      {/* Left panel (Dark side with Mascot & Details) - Hidden on mobile, takes 5 columns on desktop */}
      <div className="relative hidden select-none flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_center,rgba(39,39,42,0.8)_0%,rgba(9,9,11,1)_100%)] p-12 text-white lg:col-span-5 lg:flex">
        {/* Top left dot grid decorative pattern */}
        <div className="absolute top-10 left-10 grid grid-cols-6 gap-2 opacity-20">
          {Array.from({ length: 36 }).map((_, i) => (
            <div className="size-1 rounded-full bg-zinc-400" key={i} />
          ))}
        </div>

        {/* Bottom right dot grid decorative pattern */}
        <div className="absolute right-16 bottom-32 grid grid-cols-6 gap-2 opacity-20">
          {Array.from({ length: 36 }).map((_, i) => (
            <div className="size-1 rounded-full bg-zinc-400" key={i} />
          ))}
        </div>

        {/* Top spacer — trimmed down so the mascot sits higher, matching the reference */}
        <div className="h-2" />

        {/* Center Content: Mascot Logo & Taglines */}
        <div className="z-10 flex w-full flex-1 flex-col items-start justify-start">
          <div className="relative flex w-full justify-center overflow-visible">
            {/*
              The source PNG has built-in padding around the artwork, so at w-full it
              renders smaller than it looks in the mockup. Scaling the wrapper up
              compensates for that without distorting the layout box below it.
            */}
            <div className="w-full max-w-[620px] origin-top scale-125">
              <Image
                alt="MediBilldo Mascot"
                className="h-auto w-full object-contain drop-shadow-[0_12px_40px_rgba(255,255,255,0.08)] transition-transform duration-350"
                height={384}
                priority
                src="/mascot.png"
                width={620}
              />
            </div>
          </div>

          {/* Tightened gap so the tagline sits close under the mascot, like the reference */}
          <div className="h-[18px] w-full shrink-0" />

          <div className="w-full space-y-3 text-left">
            <div className="h-1 w-8 rounded-full bg-white opacity-60" />
            <h2 className="font-extrabold text-3xl text-white leading-tight tracking-tight">
              Smart Billing.
              <br />
              Better Healthcare.
            </h2>
            <p className="max-w-sm text-sm text-zinc-400 leading-relaxed">
              MediBilldo is your all-in-one solution for pharmacy & medical
              billing.
            </p>
          </div>
        </div>

        {/* Bottom badging */}
        <div className="z-10 grid grid-cols-3 gap-4 border-zinc-900/60 border-t pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-2 flex size-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40">
              <Shield className="size-5 text-zinc-300" />
            </div>
            <span className="font-bold text-[9px] text-zinc-400 uppercase tracking-wider">
              Secure &
            </span>
            <span className="font-bold text-[9px] text-zinc-400 uppercase tracking-wider">
              Reliable
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-2 flex size-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40">
              <FileText className="size-5 text-zinc-300" />
            </div>
            <span className="font-bold text-[9px] text-zinc-400 uppercase tracking-wider">
              Fast &
            </span>
            <span className="font-bold text-[9px] text-zinc-400 uppercase tracking-wider">
              Efficient
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-2 flex size-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40">
              <Activity className="size-5 text-zinc-300" />
            </div>
            <span className="font-bold text-[9px] text-zinc-400 uppercase tracking-wider">
              Insightful
            </span>
            <span className="font-bold text-[9px] text-zinc-400 uppercase tracking-wider">
              Reports
            </span>
          </div>
        </div>

        {/* Wave background line drawing in bottom-right corner */}
        <div className="pointer-events-none absolute right-0 bottom-0 z-0 h-32 w-48 opacity-25">
          <svg
            className="h-full w-full fill-none stroke-current text-zinc-800"
            viewBox="0 0 100 100"
          >
            <path d="M 0,50 Q 25,20 50,50 T 100,50" strokeWidth="1.5" />
            <path d="M 0,60 Q 25,30 50,60 T 100,60" strokeWidth="0.8" />
          </svg>
        </div>

        {/* The Curve wave edge mask divider */}
        <svg
          className="pointer-events-none absolute top-0 right-0 bottom-0 z-20 h-full w-64 translate-x-1/2 fill-current text-white"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <path d="M50,0 C10,30 90,70 50,100 L100,100 L100,0 Z" />
        </svg>
      </div>

      {/* Right panel (Form content container) - Takes full width on mobile, 7 columns on desktop */}
      <div className="flex flex-col items-center justify-center bg-zinc-50/50 p-6 sm:p-12 md:p-20 lg:col-span-7">
        <div className="relative w-full max-w-[420px] rounded-3xl border border-zinc-150 bg-white p-8 shadow-md sm:p-10">
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
