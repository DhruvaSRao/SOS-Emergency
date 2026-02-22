import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, AlertTriangle, Radio, ArrowRight, Lock } from "lucide-react";
import { Button } from "../components/ui/button";
import { DotLottie } from "@lottiefiles/dotlottie-web";

const LandingPage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      new DotLottie({
        autoplay: true,
        loop: true, // Keeps the woman's legs moving
        canvas: canvasRef.current,
        src: "https://lottie.host/857f2cff-29d8-41a4-ba69-26a90dacf0ec/o5L1Uoklue.lottie", 
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      
      {/* --- CUSTOM ANIMATION STYLES --- */}
      {/* This makes the canvas slide from left to right infinitely */}
      <style>{`
        @keyframes runAcrossScreen {
          0% { transform: translateX(-50%); } 
          100% { transform: translateX(150%); }
        }
        .animate-run-across {
          animation: runAcrossScreen 20s linear infinite;
        }
      `}</style>

      {/* --- BACKGROUND ANIMATION LAYER --- */}
      {/* 1. absolute inset-0: Covers the screen area
         2. opacity-10: Very faint so text is readable
         3. pointer-events-none: Clicks pass through to buttons
         4. animate-run-across: Moves the entire canvas left to right
      */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <canvas
          ref={canvasRef}
          id="canvas"
          className="w-full h-full opacity-10 animate-run-across object-contain"
        />
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
        
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emergency/5 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-warning/5 blur-[80px] pointer-events-none" />

        {/* Pulsing icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-ping bg-emergency/20 rounded-full scale-150" />
          <div className="relative w-24 h-24 rounded-full gradient-emergency flex items-center justify-center glow-red">
            <Shield className="h-12 w-12 text-primary-foreground" />
          </div>
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-foreground text-center mb-2">
          SOS<span className="text-emergency">Guard</span>
        </h1>
        <p className="text-muted-foreground text-center max-w-md mb-2 text-lg">
          Silent emergency protection at your fingertips
        </p>
        <p className="text-muted-foreground/60 text-center max-w-sm mb-12 text-sm">
          Disguised as a calculator. One code triggers silent SOS with live audio & location to nearby police.
        </p>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-6 mb-14 max-w-lg">
          <Feature icon={<AlertTriangle className="h-4 w-4 text-emergency" />} text="Silent SOS Trigger" />
          <Feature icon={<Radio className="h-4 w-4 text-success" />} text="Live Audio & GPS" />
          <Feature icon={<Shield className="h-4 w-4 text-info" />} text="Disguised Interface" />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <Button
            onClick={() => navigate("/register")}
            className="flex-1 h-12 text-base font-bold gradient-emergency border-0 hover:opacity-90 transition-opacity"
          >
            Sign Up
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="flex-1 h-12 text-base font-semibold border-border hover:bg-secondary"
          >
            User Login
          </Button>
        </div>

        {/* How it works */}
        <div className="mt-12 w-full max-w-sm">
          <div className="border border-border/50 rounded-xl p-4 bg-secondary/20">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="text-xs font-mono text-muted-foreground/60 tracking-widest uppercase">
                How to trigger SOS
              </span>
            </div>
            <div className="space-y-2">
              <Step number="1" text="Open the app — it looks like a calculator" />
              <Step number="2" text={`Type  911  or  112  on the keypad`} highlight />
              <Step number="3" text='Press  "="  to silently send your SOS' />
              <Step number="4" text='Press  "AC"  within 10 seconds to cancel' />
            </div>
            <p className="text-[10px] text-muted-foreground/30 mt-3 font-mono">
              Location & audio are captured automatically. No visible alert shown.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/police/login")}
          className="mt-8 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors font-mono tracking-wide"
        >
          POLICE OFFICER LOGIN →
        </button>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-[11px] text-muted-foreground/30 font-mono">
        SOSGuard — Emergency Response System
      </footer>
    </div>
  );
};

const Feature = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/60 border border-border">
    {icon}
    <span className="text-xs font-medium text-muted-foreground">{text}</span>
  </div>
);

const Step = ({ number, text, highlight }: { number: string; text: string; highlight?: boolean }) => (
  <div className="flex items-start gap-3">
    <span className="text-[10px] font-mono text-emergency/60 mt-0.5 w-3 shrink-0">{number}</span>
    <p className={`text-xs ${highlight ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
      {text}
    </p>
  </div>
);

export default LandingPage;