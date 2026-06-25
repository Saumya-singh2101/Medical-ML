import React, { useEffect, useState } from 'react';
import { Activity, ScanLine, Stethoscope, Sparkles, ArrowRight, Shield } from 'lucide-react';

interface LandingProps {
  onEnter: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onEnter }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  return (
    <div className="min-h-screen bg-void relative overflow-hidden flex flex-col">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,229,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* Radial vignette over grid */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-void/60 to-void pointer-events-none" />

      {/* Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan/[0.07] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-magenta/[0.06] blur-[100px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/[0.06] px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/30 flex items-center justify-center">
              <Activity size={15} className="text-cyan" />
            </div>
            <span className="font-display font-bold text-white tracking-tight">
              PULSE<span className="text-cyan">.</span>
            </span>
          </div>
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-slate-600">
            v2.0 · diagnostic console
          </span>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 relative z-10 flex items-center justify-center px-6 py-16">
        <div className="max-w-3xl w-full text-center">
          {/* Pill badge */}
          <div
            className={`inline-flex items-center gap-2 border border-cyan/20 bg-cyan/5 rounded-full px-4 py-1.5 mb-8 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-cyan/80">
              AI-Assisted Diagnostics
            </span>
          </div>

          {/* Headline */}
          <h1
            className={`font-display font-bold text-white leading-[1.05] tracking-tight mb-6 transition-all duration-700 delay-100 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
          >
            Clinical diagnostics,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan via-cyan/80 to-magenta">
              reimagined with AI.
            </span>
          </h1>

          <p
            className={`text-slate-400 text-lg leading-relaxed max-w-xl mx-auto mb-10 transition-all duration-700 delay-200 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            Two independent models in one console — CNN-based skin classification and
            Bio_ClinicalBERT symptom analysis, both explained in plain English by Groq AI.
          </p>

          {/* CTA */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-700 delay-300 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <button
              onClick={onEnter}
              className="group flex items-center gap-2.5 bg-cyan text-void font-display font-bold px-7 py-3.5 rounded-xl shadow-neon-cyan hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Open Console
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
            <div className="flex items-center gap-2 text-slate-600 font-mono text-xs">
              <Shield size={12} />
              For educational use only
            </div>
          </div>

          {/* Feature cards */}
          <div
            className={`grid sm:grid-cols-3 gap-4 transition-all duration-700 delay-[400ms] ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {[
              {
                icon: ScanLine,
                color: 'cyan',
                title: 'Skin Scan',
                desc: 'CNN model classifies skin images — normal, acne, or eczema — with per-class confidence scores.',
              },
              {
                icon: Stethoscope,
                color: 'magenta',
                title: 'Symptom Check',
                desc: 'Bio_ClinicalBERT + classifier predicts conditions from plain-text symptom descriptions.',
              },
              {
                icon: Sparkles,
                color: 'lime',
                title: 'Groq Insight',
                desc: 'Every result gets an instant plain-English explanation generated by Groq\'s LLaMA 3 model.',
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="text-left bg-panel/60 border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] transition-colors"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 bg-${color}/10 border border-${color}/25`}
                >
                  <Icon size={16} className={`text-${color}`} />
                </div>
                <p className="font-display font-semibold text-white text-sm mb-1.5">{title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] px-8 py-4">
        <p className="text-center font-mono text-[10px] text-slate-700 tracking-wider uppercase">
          ⚠ Not a substitute for professional medical advice · consult a licensed physician
        </p>
      </footer>
    </div>
  );
};
