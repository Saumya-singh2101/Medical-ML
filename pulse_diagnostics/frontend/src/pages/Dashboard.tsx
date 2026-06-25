import React, { useRef, useState } from 'react';
import {
  ImagePlus,
  Stethoscope,
  ScanLine,
  Loader2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Activity,
  LogOut,
  FileDown,
} from 'lucide-react';
import { predictSkin, predictSymptoms, SkinResult, SymptomResult } from '../services/api';
import { getGroqExplanation } from '../services/groqExplanation';
import { AuthUser } from '../services/auth';
import { GroqBox } from '../components/GroqBox';
import { NavBar } from '../components/NavBar';
import { PatientInfoModal, PatientInfoSubmission } from '../components/PatientInfoModal';
import { saveHistoryEntry, makeId, fileToThumbnail } from '../services/history';
import { findNearbyDermatologist, fallbackDermatologistNote, DermatologistResult } from '../services/dermatologist';
import { generatePDFReport } from '../services/pdfReport';

interface DashboardProps {
  user: AuthUser;
  onLogout: () => void;
  currentScreen: string;
  onNavigate: (screen: any) => void;
}

const CLASS_COLORS: Record<string, string> = {
  normal: 'lime',
  acne: 'amber',
  eczema: 'magenta',
};

const CLASS_HEX: Record<string, string> = {
  normal: '#39ff14',
  acne: '#ffb300',
  magenta: '#ff2d78',
  cyan: '#00e5ff',
  lime: '#39ff14',
  amber: '#ffb300',
  violet: '#a855f7',
};

function ConfidenceBar({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  const pct = Math.round(value * 100);
  const hex = CLASS_HEX[colorClass] || CLASS_HEX.cyan;
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
          {label}
        </span>
        <span className="font-mono text-xs font-medium" style={{ color: hex }}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: hex, boxShadow: `0 0 8px ${hex}55` }}
        />
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <ChevronRight size={12} className="text-slate-600" />
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-slate-600">
        {children}
      </span>
      <div className="flex-1 h-[1px] bg-white/[0.04]" />
    </div>
  );
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, currentScreen, onNavigate }) => {
  // ── Skin ──────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [skinResult, setSkinResult] = useState<SkinResult | null>(null);
  const [skinLoading, setSkinLoading] = useState(false);
  const [skinError, setSkinError] = useState<string | null>(null);
  const [skinExplanation, setSkinExplanation] = useState<string | null>(null);
  const [skinExplanationLoading, setSkinExplanationLoading] = useState(false);

  const handleFileSelect = (file: File | null) => {
    setSkinResult(null);
    setSkinError(null);
    setSkinExplanation(null);
    setSelectedFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const runSkinAnalysis = async () => {
    if (!selectedFile) return;
    setSkinLoading(true);
    setSkinError(null);
    setSkinExplanation(null);
    try {
      const result = await predictSkin(selectedFile);
      setSkinResult(result);
      setSkinExplanationLoading(true);
      const explanation = await getGroqExplanation(result.prediction, 'skin');
      setSkinExplanation(explanation);

      // Save to history
      const thumbnail = await fileToThumbnail(selectedFile).catch(() => undefined);
      await saveHistoryEntry({
        id: makeId(),
        type: 'skin',
        timestamp: Date.now(),
        prediction: result.prediction,
        all_probabilities: result.all_probabilities,
        explanation,
        imagePreview: thumbnail,
      });
    } catch (err) {
      setSkinError(err instanceof Error ? err.message : 'Analysis failed.');
    } finally {
      setSkinLoading(false);
      setSkinExplanationLoading(false);
    }
  };

  // ── Symptoms ──────────────────────────────────────────────────
  const [symptoms, setSymptoms] = useState('');
  const [symptomResult, setSymptomResult] = useState<SymptomResult | null>(null);
  const [symptomLoading, setSymptomLoading] = useState(false);
  const [symptomError, setSymptomError] = useState<string | null>(null);
  const [symptomExplanation, setSymptomExplanation] = useState<string | null>(null);
  const [symptomExplanationLoading, setSymptomExplanationLoading] = useState(false);

  const runSymptomAnalysis = async () => {
    if (!symptoms.trim()) return;
    setSymptomLoading(true);
    setSymptomError(null);
    setSymptomExplanation(null);
    try {
      const result = await predictSymptoms(symptoms.trim());
      setSymptomResult(result);
      setSymptomExplanationLoading(true);
      const explanation = await getGroqExplanation(result.prediction, 'symptom');
      setSymptomExplanation(explanation);

      await saveHistoryEntry({
        id: makeId(),
        type: 'symptom',
        timestamp: Date.now(),
        symptomsText: symptoms.trim(),
        prediction: result.prediction,
        top_3: result.top_3,
        explanation,
      });
    } catch (err) {
      setSymptomError(err instanceof Error ? err.message : 'Analysis failed.');
    } finally {
      setSymptomLoading(false);
      setSymptomExplanationLoading(false);
    }
  };

  // ── Report generation (shared between both panels) ────────────
  const [reportModalFor, setReportModalFor] = useState<'skin' | 'symptom' | null>(null);
  const [reportGenerating, setReportGenerating] = useState(false);

  const handleGenerateReport = async (info: PatientInfoSubmission) => {
    setReportGenerating(true);
    try {
      let dermatologist: DermatologistResult | null = null;
      if (info.lat != null && info.lng != null) {
        dermatologist = await findNearbyDermatologist(info.lat, info.lng);
      }
      if (!dermatologist) dermatologist = fallbackDermatologistNote(info.lat ?? undefined, info.lng ?? undefined);

      const patient = {
        name: info.name,
        age: info.age,
        sex: info.sex,
        location: info.location,
      };

      if (reportModalFor === 'skin' && skinResult) {
        generatePDFReport({
          type: 'skin',
          result: skinResult,
          patient,
          explanation: skinExplanation,
          dermatologist,
        });
      } else if (reportModalFor === 'symptom' && symptomResult) {
        generatePDFReport({
          type: 'symptom',
          result: symptomResult,
          symptomsText: symptoms,
          patient,
          explanation: symptomExplanation,
          dermatologist,
        });
      }
    } catch (err) {
      console.error('Report generation failed', err);
    } finally {
      setReportGenerating(false);
      setReportModalFor(null);
    }
  };

  return (
    <div className="min-h-screen bg-void">
      {/* ── Header ── */}
      <NavBar user={user} onLogout={onLogout} currentScreen={currentScreen} onNavigate={onNavigate} />
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* ── Page header ── */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-cyan to-magenta animate-pulse" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-slate-600">
              Diagnostics
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">
            Console
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
            Two independent models · results explained in plain English by Groq AI
          </p>
        </div>

        {/* ── Two-column grid ── */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* ════ SKIN SCAN ════ */}
          <section className="bg-panel/60 border border-white/[0.07] rounded-2xl p-6 relative overflow-hidden">
            {/* Subtle top accent */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan/30 to-transparent" />

            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-7 h-7 rounded-lg bg-cyan/10 border border-cyan/25 flex items-center justify-center">
                <ImagePlus size={13} className="text-cyan" />
              </div>
              <h2 className="font-display font-semibold text-white">Skin Scan</h2>
            </div>
            <p className="text-xs text-slate-600 mb-5 ml-[38px]">
              CNN-based classification · normal / acne / eczema
            </p>

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-video rounded-xl border border-dashed border-cyan/20 bg-black/20 hover:border-cyan/40 hover:bg-cyan/[0.02] transition-all cursor-pointer flex items-center justify-center overflow-hidden group"
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                  {skinLoading && (
                    <div className="absolute inset-0 bg-void/50 flex items-center justify-center">
                      <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan to-transparent animate-scan" />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center px-6 py-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3 group-hover:border-cyan/30 transition">
                    <ImagePlus size={20} className="text-slate-600 group-hover:text-cyan transition" />
                  </div>
                  <p className="text-sm text-slate-600 group-hover:text-slate-400 transition">
                    Click to upload
                  </p>
                  <p className="text-xs text-slate-700 mt-1">JPG, PNG, WEBP</p>
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
              className="w-full mt-4 flex items-center justify-center gap-2 bg-cyan text-void font-display font-bold text-sm py-2.5 rounded-xl shadow-neon-cyan hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-30 disabled:shadow-none disabled:scale-100"
            >
              {skinLoading ? (
                <><Loader2 size={14} className="animate-spin" /> Scanning…</>
              ) : (
                <><ScanLine size={14} /> Run Scan</>
              )}
            </button>

            {skinError && (
              <div className="flex items-center gap-2 mt-4 bg-magenta/5 border border-magenta/25 text-magenta px-3.5 py-2.5 rounded-xl text-xs">
                <AlertCircle size={13} className="flex-shrink-0" />
                {skinError}
              </div>
            )}

            {skinResult && (
              <div className="mt-6 space-y-5">
                <div>
                  <SectionLabel>Result</SectionLabel>
                  <div className="flex items-center justify-between bg-black/20 rounded-xl px-4 py-3 border border-white/[0.05]">
                    <span className="font-mono text-xs text-slate-500">Prediction</span>
                    <span
                      className="font-display font-bold text-lg tracking-wide"
                      style={{ color: CLASS_HEX[CLASS_COLORS[skinResult.prediction]] || CLASS_HEX.cyan }}
                    >
                      {skinResult.prediction.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <SectionLabel>Confidence</SectionLabel>
                  <div className="space-y-3">
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

                <div>
                  <SectionLabel>Groq Insight</SectionLabel>
                  <GroqBox text={skinExplanation} loading={skinExplanationLoading} accent="cyan" />
                </div>

                <button
                  onClick={() => setReportModalFor('skin')}
                  className="w-full flex items-center justify-center gap-2 border border-cyan/30 text-cyan font-display font-semibold text-sm py-2.5 rounded-xl hover:bg-cyan/10 active:scale-[0.98] transition-all"
                >
                  <FileDown size={14} /> Download Report
                </button>
              </div>
            )}
          </section>

          {/* ════ SYMPTOM CHECK ════ */}
          <section className="bg-panel/60 border border-white/[0.07] rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-magenta/30 to-transparent" />

            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-7 h-7 rounded-lg bg-magenta/10 border border-magenta/25 flex items-center justify-center">
                <Stethoscope size={13} className="text-magenta" />
              </div>
              <h2 className="font-display font-semibold text-white">Symptom Check</h2>
            </div>
            <p className="text-xs text-slate-600 mb-5 ml-[38px]">
              Bio_ClinicalBERT + classifier · plain-language input
            </p>

            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe symptoms in plain language…&#10;e.g. persistent dry cough, mild fever for 3 days, fatigue and body aches"
              rows={6}
              className="w-full bg-black/20 border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-magenta/40 focus:ring-1 focus:ring-magenta/15 transition resize-none leading-relaxed"
            />

            <button
              onClick={runSymptomAnalysis}
              disabled={!symptoms.trim() || symptomLoading}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-magenta text-white font-display font-bold text-sm py-2.5 rounded-xl shadow-neon-magenta hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-30 disabled:shadow-none disabled:scale-100"
            >
              {symptomLoading ? (
                <><Loader2 size={14} className="animate-spin" /> Analyzing…</>
              ) : (
                <><Sparkles size={14} /> Analyze Symptoms</>
              )}
            </button>

            {symptomError && (
              <div className="flex items-center gap-2 mt-4 bg-magenta/5 border border-magenta/25 text-magenta px-3.5 py-2.5 rounded-xl text-xs">
                <AlertCircle size={13} className="flex-shrink-0" />
                {symptomError}
              </div>
            )}

            {symptomResult && (
              <div className="mt-6 space-y-5">
                <div>
                  <SectionLabel>Result</SectionLabel>
                  <div className="flex items-center justify-between bg-black/20 rounded-xl px-4 py-3 border border-white/[0.05]">
                    <span className="font-mono text-xs text-slate-500">Top Prediction</span>
                    <span className="font-display font-bold text-base text-magenta tracking-wide">
                      {symptomResult.prediction}
                    </span>
                  </div>
                </div>

                <div>
                  <SectionLabel>Top 3 Conditions</SectionLabel>
                  <div className="space-y-3">
                    {symptomResult.top_3.map((item) => (
                      <ConfidenceBar
                        key={item.disease}
                        label={item.disease}
                        value={item.confidence}
                        colorClass="magenta"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <SectionLabel>Groq Insight</SectionLabel>
                  <GroqBox
                    text={symptomExplanation}
                    loading={symptomExplanationLoading}
                    accent="magenta"
                  />
                </div>

                <button
                  onClick={() => setReportModalFor('symptom')}
                  className="w-full flex items-center justify-center gap-2 border border-magenta/30 text-magenta font-display font-semibold text-sm py-2.5 rounded-xl hover:bg-magenta/10 active:scale-[0.98] transition-all"
                >
                  <FileDown size={14} /> Download Report
                </button>
              </div>
            )}
          </section>
        </div>

        <p className="text-center font-mono text-[10px] tracking-wider uppercase text-slate-700 mt-8">
          ⚠ AI predictions are not a medical diagnosis · consult a licensed professional
        </p>
      </main>

      {reportModalFor && (
        <PatientInfoModal
          accent={reportModalFor === 'skin' ? 'cyan' : 'magenta'}
          onClose={() => !reportGenerating && setReportModalFor(null)}
          onSubmit={handleGenerateReport}
        />
      )}
    </div>
  );
};
