import React from 'react';
import { Bot, Loader2, TriangleAlert } from 'lucide-react';

interface GroqBoxProps {
  text: string | null;
  loading: boolean;
  accent?: 'cyan' | 'magenta';
}

export const GroqBox: React.FC<GroqBoxProps> = ({ text, loading, accent = 'cyan' }) => {
  if (!text && !loading) return null;

  const isCyan = accent === 'cyan';

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border ${
        isCyan ? 'border-cyan/20' : 'border-magenta/20'
      } bg-[#0a0e17]`}
    >
      {/* Top gradient bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-[1.5px] ${
          isCyan
            ? 'bg-gradient-to-r from-transparent via-cyan to-transparent'
            : 'bg-gradient-to-r from-transparent via-magenta to-transparent'
        }`}
      />

      <div className="px-4 py-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              isCyan ? 'bg-cyan/10 border border-cyan/25' : 'bg-magenta/10 border border-magenta/25'
            }`}
          >
            <Bot size={12} className={isCyan ? 'text-cyan' : 'text-magenta'} />
          </div>
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-slate-400">
            Groq Analysis
          </span>
          {loading && (
            <span className="ml-auto flex items-center gap-1.5 font-mono text-[9px] text-slate-600">
              <Loader2 size={10} className="animate-spin" />
              generating
            </span>
          )}
          {!loading && text && (
            <span
              className={`ml-auto flex items-center gap-1 font-mono text-[9px] ${
                isCyan ? 'text-cyan/50' : 'text-magenta/50'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCyan ? 'bg-cyan' : 'bg-magenta'
                } opacity-60`}
              />
              llama3-8b
            </span>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-2.5">
            <div className="h-2.5 rounded-full bg-white/[0.04] animate-pulse w-full" />
            <div className="h-2.5 rounded-full bg-white/[0.04] animate-pulse w-[88%]" />
            <div className="h-2.5 rounded-full bg-white/[0.04] animate-pulse w-[72%]" />
          </div>
        ) : (
          <p className="text-[13px] text-slate-300 leading-[1.7] tracking-[0.01em]">{text}</p>
        )}

        {/* Footer */}
        {!loading && text && (
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/[0.05]">
            <TriangleAlert size={10} className="text-slate-600 flex-shrink-0" />
            <p className="font-mono text-[9px] text-slate-600 leading-relaxed">
              Not a substitute for professional medical diagnosis or advice
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
