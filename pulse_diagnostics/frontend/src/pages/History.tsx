// pages/History.tsx
import React, { useEffect, useState } from 'react';
import { Clock, ImagePlus, Stethoscope, Trash2, RotateCcw } from 'lucide-react';
import { NavBar } from '../components/NavBar';
import { AuthUser } from '../services/auth';
import {
  HistoryEntry,
  getHistoryEntries,
  deleteHistoryEntry,
} from '../services/history';

interface HistoryProps {
  user: AuthUser;
  onLogout: () => void;
  currentScreen: string;
  onNavigate: (screen: any) => void;
  // Optional: lets "View Again" hand a past entry back to the Dashboard.
  onViewAgain?: (entry: HistoryEntry) => void;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const History: React.FC<HistoryProps> = ({
  user,
  onLogout,
  currentScreen,
  onNavigate,
  onViewAgain,
}) => {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await getHistoryEntries();
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteHistoryEntry(id);
    load();
  };

  return (
    <div className="min-h-screen bg-void">
      <NavBar user={user} onLogout={onLogout} currentScreen={currentScreen} onNavigate={onNavigate} />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#a855f7] to-cyan" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-slate-600">
              Records
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">History</h1>
          <p className="text-slate-500 text-sm mt-1.5">
            Every scan and symptom check you've run, saved locally on this device.
          </p>
        </div>

        {loading && <p className="text-slate-600 text-sm font-mono">Loading…</p>}

        {!loading && entries.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/[0.08] rounded-2xl">
            <Clock size={28} className="mx-auto text-slate-700 mb-3" />
            <p className="text-slate-500 text-sm">No history yet — run a scan or symptom check first.</p>
          </div>
        )}

        <div className="space-y-3">
          {entries.map((entry) => {
            const isSkin = entry.type === 'skin';
            const accent = isSkin ? 'cyan' : 'magenta';
            const accentHex = isSkin ? '#00e5ff' : '#ff2d78';
            return (
              <div
                key={entry.id}
                className="flex items-center gap-4 bg-panel/60 border border-white/[0.07] rounded-xl p-4 hover:border-white/[0.14] transition"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border"
                  style={{ background: `${accentHex}1A`, borderColor: `${accentHex}40` }}
                >
                  {isSkin ? (
                    entry.imagePreview ? (
                      <img src={entry.imagePreview} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <ImagePlus size={16} style={{ color: accentHex }} />
                    )
                  ) : (
                    <Stethoscope size={16} style={{ color: accentHex }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-white text-sm">
                      {isSkin ? entry.prediction.toUpperCase() : entry.prediction}
                    </span>
                    <span
                      className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border"
                      style={{ color: accentHex, borderColor: `${accentHex}40` }}
                    >
                      {isSkin ? 'Skin Scan' : 'Symptom Check'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                    {formatDate(entry.timestamp)}
                  </p>
                </div>

                <button
                  onClick={() => onViewAgain?.(entry)}
                  className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white border border-white/[0.08] hover:border-white/20 rounded-lg px-3 py-1.5 transition"
                >
                  <RotateCcw size={12} /> View Again
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-slate-600 hover:text-magenta transition p-1.5"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
