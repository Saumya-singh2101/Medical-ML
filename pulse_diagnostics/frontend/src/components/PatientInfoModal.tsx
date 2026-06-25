// components/PatientInfoModal.tsx
import React, { useState } from 'react';
import { X, MapPin, FileDown, Loader2 } from 'lucide-react';
import { getCurrentPosition } from '../services/dermatologist';

export interface PatientInfoSubmission {
  name: string;
  age: string;
  sex: string;
  location: string; // human readable
  lat: number | null;
  lng: number | null;
}

interface PatientInfoModalProps {
  accent?: 'cyan' | 'magenta';
  onClose: () => void;
  onSubmit: (info: PatientInfoSubmission) => void;
}

export const PatientInfoModal: React.FC<PatientInfoModalProps> = ({
  accent = 'cyan',
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accentHex = accent === 'cyan' ? '#00e5ff' : '#ff2d78';

  const useMyLocation = async () => {
    setLocating(true);
    setError(null);
    try {
      const pos = await getCurrentPosition();
      const { latitude, longitude } = pos.coords;
      setCoords({ lat: latitude, lng: longitude });
      setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    } catch (err) {
      setError('Could not access location — you can type it in manually instead.');
    } finally {
      setLocating(false);
    }
  };

  const canSubmit = name.trim() && age.trim() && sex.trim() && location.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      age: age.trim(),
      sex: sex.trim(),
      location: location.trim(),
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div
        className="relative w-full max-w-md bg-panel border border-white/[0.08] rounded-2xl p-6 shadow-2xl"
        style={{ boxShadow: `0 0 40px ${accentHex}22` }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <FileDown size={16} style={{ color: accentHex }} />
          <h3 className="font-display font-semibold text-white text-lg">Generate Report</h3>
        </div>
        <p className="text-xs text-slate-500 mb-5">
          A few details for the report header. Nothing is sent anywhere except into your PDF.
        </p>

        <div className="space-y-3.5">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Full Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aditi Sharma"
              className="w-full mt-1 bg-black/20 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-white/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Age
              </label>
              <input
                value={age}
                onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="29"
                inputMode="numeric"
                className="w-full mt-1 bg-black/20 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-white/20"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Sex
              </label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className="w-full mt-1 bg-black/20 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
              >
                <option value="" className="bg-panel">
                  Select…
                </option>
                <option value="Male" className="bg-panel">Male</option>
                <option value="Female" className="bg-panel">Female</option>
                <option value="Other" className="bg-panel">Other</option>
                <option value="Prefer not to say" className="bg-panel">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Location
            </label>
            <div className="flex gap-2 mt-1">
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or coordinates"
                className="flex-1 bg-black/20 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-white/20"
              />
              <button
                onClick={useMyLocation}
                disabled={locating}
                className="flex items-center gap-1.5 px-3 rounded-lg border border-white/[0.08] text-xs text-slate-300 hover:border-white/20 transition disabled:opacity-50"
              >
                {locating ? <Loader2 size={13} className="animate-spin" /> : <MapPin size={13} />}
                Use mine
              </button>
            </div>
            {coords && (
              <p className="text-[10px] text-slate-600 mt-1">
                Using location to also find a nearby dermatologist for the report.
              </p>
            )}
            {error && <p className="text-[10px] text-magenta mt-1">{error}</p>}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full mt-6 flex items-center justify-center gap-2 font-display font-bold text-sm py-2.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-30"
          style={{ background: accentHex, color: '#05070a' }}
        >
          <FileDown size={14} /> Generate PDF Report
        </button>
      </div>
    </div>
  );
};
