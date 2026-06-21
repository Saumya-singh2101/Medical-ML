import React, { useRef, useState } from 'react';
import {
  ImagePlus,
  Stethoscope,
  ScanLine,
  Loader2,
  AlertCircle,
  Sparkles,
  Activity,
  LogOut,
} from 'lucide-react';
import { predictSkin, predictSymptoms, SkinResult, SymptomResult } from '../services/api';
import { AuthUser } from '../services/auth';

interface DashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

const CLASS_COLORS: Record<string, string> = {
  normal: 'lime',
  acne: 'amber',
  eczema: 'magenta',
};

function ConfidenceBar({ label, value, colorClass }: { label: string; value: number; colorClass: string }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
        <span className="uppercase tracking-wide">{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full bg-${colorClass} shadow-neon-${colorClass} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  // ---- Skin image section ----
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [skinResult, setSkinResult] = useState<SkinResult | null>(null);
  const [skinLoading, setSkinLoading] = useState(false);
  const [skinError, setSkinError] = useState<string | null>(null);

  const handleFileSelect = (file: File | null) => {
    setSkinResult(null);
    setSkinError(null);
    setSelectedFile(file);
    if (file) setPreviewUrl(URL.createObjectURL(file));
    else setPreviewUrl(null);
  };

  const runSkinAnalysis = async () => {
    if (!selectedFile) return;
    setSkinLoading(true);
    setSkinError(null);
    try {
      const result = await predictSkin(selectedFile);
      setSkinResult(result);
    } catch (err) {
      setSkinError(err instanceof Error ? err.message : 'Analysis failed.');
    } finally {
      setSkinLoading(false);
    }
  };

  // ---- Symptom section ----
  const [symptoms, setSymptoms] = useState('');
  const [symptomResult, setSymptomResult] = useState<SymptomResult | null>(null);
  const [symptomLoading, setSymptomLoading] = useState(false);
  const [symptomError, setSymptomError] = useState<string | null>(null);

  const runSymptomAnalysis = async () => {
    if (!symptoms.trim()) return;
    setSymptomLoading(true);
    setSymptomError(null);
    try {
      const result = await predictSymptoms(symptoms.trim());
      setSymptomResult(result);
    } catch (err) {
      setSymptomError(err instanceof Error ? err.message : 'Analysis failed.');
    } finally {
      setSymptomLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="border-b border-white/10 bg-panel/60 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-panel border border-cyan/50 rounded-lg shadow-neon-cyan">
              <Activity className="text-cyan" size={18} />
            </div>
            <span className="font-display font-bold text-lg text-white tracking-tight">
              PULSE<span className="text-cyan">.</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-slate-400">
              <span className="text-lime">●</span> {user.username}
            </span>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-magenta transition"
            >
              <LogOut size={14} /> LOGOUT
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Diagnostics Console</h1>
          <p className="text-slate-400 mt-1">
            Run an image scan or describe symptoms — two independent models, one console.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* ============ SECTION 1: Skin image analysis ============ */}
          <section className="bg-panel/80 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-1">
              <ImagePlus size={18} className="text-cyan" />
              <h2 className="font-display font-semibold text-white">Skin Scan</h2>
            </div>
            <p className="text-xs text-slate-500 mb-5">Upload a clear photo for CNN-based classification.</p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-video rounded-xl border-2 border-dashed border-cyan/30 bg-panel2 hover:border-cyan/60 transition cursor-pointer flex items-center justify-center overflow-hidden group"
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                  {skinLoading && (
                    <div className="absolute inset-0 bg-void/40">
                      <div className="absolute left-0 right-0 h-1/3 bg-gradient-to-b from-cyan/0 via-cyan/40 to-cyan/0 animate-scan" />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center px-4">
                  <ImagePlus className="mx-auto text-slate-600 group-hover:text-cyan transition" size={32} />
                  <p className="text-sm text-slate-500 mt-2">Click to upload an image</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
              />
            </div>

            <button
              onClick={runSkinAnalysis}
              disabled={!selectedFile || skinLoading}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-cyan text-void font-display font-semibold py-2.5 rounded-lg shadow-neon-cyan hover:brightness-110 active:scale-[0.98] transition disabled:opacity-40 disabled:shadow-none"
            >
              {skinLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Scanning…
                </>
              ) : (
                <>
                  <ScanLine size={16} /> Run Scan
                </>
              )}
            </button>

            {skinError && (
              <div className="flex items-center gap-2 mt-4 bg-magenta/10 border border-magenta/40 text-magenta px-3 py-2 rounded-lg text-sm">
                <AlertCircle size={15} /> {skinError}
              </div>
            )}

            {skinResult && (
              <div className="mt-5 pt-5 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-slate-400">Result</span>
                  <span
                    className={`font-display font-bold text-lg text-${
                      CLASS_COLORS[skinResult.prediction] || 'cyan'
                    }`}
                  >
                    {skinResult.prediction.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {Object.entries(skinResult.all_probabilities).map(([cls, val]) => (
                    <ConfidenceBar
                      key={cls}
                      label={cls}
                      value={val}
                      colorClass={CLASS_COLORS[cls] || 'cyan'}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ============ SECTION 2: Symptom analysis ============ */}
          <section className="bg-panel/80 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-1">
              <Stethoscope size={18} className="text-magenta" />
              <h2 className="font-display font-semibold text-white">Symptom Check</h2>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Describe symptoms in plain language — Bio_ClinicalBERT + classifier.
            </p>

            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. persistent dry cough, mild fever for 3 days, fatigue..."
              rows={6}
              className="w-full bg-panel2 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-magenta/60 focus:ring-2 focus:ring-magenta/20 transition resize-none"
            />

            <button
              onClick={runSymptomAnalysis}
              disabled={!symptoms.trim() || symptomLoading}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-magenta text-white font-display font-semibold py-2.5 rounded-lg shadow-neon-magenta hover:brightness-110 active:scale-[0.98] transition disabled:opacity-40 disabled:shadow-none"
            >
              {symptomLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Analyzing…
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Analyze Symptoms
                </>
              )}
            </button>

            {symptomError && (
              <div className="flex items-center gap-2 mt-4 bg-magenta/10 border border-magenta/40 text-magenta px-3 py-2 rounded-lg text-sm">
                <AlertCircle size={15} /> {symptomError}
              </div>
            )}

            {symptomResult && (
              <div className="mt-5 pt-5 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-slate-400">
                    Top Prediction
                  </span>
                  <span className="font-display font-bold text-lg text-magenta">
                    {symptomResult.prediction}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {symptomResult.top_3.map((item) => (
                    <ConfidenceBar
                      key={item.disease}
                      label={item.disease}
                      value={item.confidence}
                      colorClass="magenta"
                    />
                  ))}
                </div>
                {symptomResult.explanation && (
                  <div className="bg-panel2 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 leading-relaxed">
                    {symptomResult.explanation}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        <p className="text-center text-xs text-slate-600 font-mono">
          ⚠ AI predictions are not a medical diagnosis. Consult a licensed professional.
        </p>
      </main>
    </div>
  );
};
