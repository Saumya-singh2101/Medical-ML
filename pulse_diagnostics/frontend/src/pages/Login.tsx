import React, { useState } from 'react';
import { Activity, User, Lock, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { login, register, AuthUser } from '../services/auth';

interface LoginProps {
  onAuthed: (user: AuthUser) => void;
  onBack?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onAuthed, onBack }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const user =
        mode === 'login'
          ? await login(username.trim(), password)
          : await register(username.trim(), password, email.trim() || undefined);
      onAuthed(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,229,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute top-[-20%] left-[-15%] w-[500px] h-[500px] rounded-full bg-cyan/[0.08] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-15%] w-[500px] h-[500px] rounded-full bg-magenta/[0.06] blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[400px] relative z-10">
        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.15em] uppercase text-slate-600 hover:text-slate-400 transition mb-6"
          >
            <ArrowLeft size={12} /> Back
          </button>
        )}

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-panel border border-cyan/30 rounded-2xl shadow-neon-cyan mb-4">
            <Activity size={22} className="text-cyan" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">
            PULSE<span className="text-cyan">.</span>
          </h1>
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-slate-600 mt-1.5">
            diagnostic console
          </p>
        </div>

        {/* Card */}
        <div className="bg-panel/70 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 relative overflow-hidden">
          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-black/30 rounded-xl mb-6">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null); }}
                className={`flex-1 py-2 rounded-lg font-display font-semibold text-xs tracking-[0.1em] uppercase transition-all ${
                  mode === m
                    ? m === 'login'
                      ? 'bg-cyan text-void shadow-neon-cyan'
                      : 'bg-magenta text-white shadow-neon-magenta'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-2">
                Username
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="clinician_01"
                  autoFocus
                  className="w-full bg-black/40 border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 transition"
                />
              </div>
            </div>

            {/* Email (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-2">
                  Email <span className="text-slate-700">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 text-xs">@</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-black/40 border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 transition"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 transition"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-magenta/8 border border-magenta/30 text-magenta px-3.5 py-2.5 rounded-xl text-xs font-medium">
                <AlertCircle size={13} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 font-display font-bold text-sm py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 ${
                mode === 'login'
                  ? 'bg-cyan text-void shadow-neon-cyan hover:brightness-110'
                  : 'bg-magenta text-white shadow-neon-magenta hover:brightness-110'
              }`}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Enter Console' : 'Create Account'}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-4">
            {mode === 'login' ? 'No account? ' : 'Already registered? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
              className="text-cyan hover:underline font-semibold"
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
