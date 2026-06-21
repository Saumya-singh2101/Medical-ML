import React, { useState } from 'react';
import { login, register, AuthUser } from '../services/auth';
import { Activity, User, Lock, Mail, AlertCircle, ScanLine } from 'lucide-react';

interface LoginProps {
  onAuthed: (user: AuthUser) => void;
}

export const Login: React.FC<LoginProps> = ({ onAuthed }) => {
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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-magenta/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-3">
            <div className="p-3 bg-panel border border-cyan/50 rounded-xl shadow-neon-cyan">
              <Activity className="text-cyan" size={26} />
            </div>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white">
            PULSE<span className="text-cyan">.</span>
          </h1>
          <p className="text-slate-400 font-mono text-xs mt-2 tracking-widest uppercase">
            AI-assisted diagnostics console
          </p>
        </div>

        <div className="bg-panel/80 backdrop-blur border border-white/10 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
          <div className="flex mb-6 border border-white/10 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 font-display font-semibold text-sm tracking-wide transition-colors ${
                mode === 'login' ? 'bg-cyan/15 text-cyan' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              LOG IN
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 font-display font-semibold text-sm tracking-wide transition-colors border-l border-white/10 ${
                mode === 'signup' ? 'bg-magenta/15 text-magenta' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SIGN UP
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-slate-400 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="clinician_01"
                  className="w-full pl-10 bg-panel2 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan/60 focus:ring-2 focus:ring-cyan/20 transition"
                  autoFocus
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-slate-400 mb-1.5">
                  Email (optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 bg-panel2 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan/60 focus:ring-2 focus:ring-cyan/20 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 bg-panel2 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan/60 focus:ring-2 focus:ring-cyan/20 transition"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-magenta/10 border border-magenta/40 text-magenta px-3 py-2 rounded-lg text-sm font-medium">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-cyan text-void font-display font-semibold py-2.5 rounded-lg shadow-neon-cyan hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50"
            >
              <ScanLine size={16} />
              {loading ? 'Verifying…' : mode === 'login' ? 'Enter Console' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          {mode === 'login' ? 'New to PULSE? ' : 'Already registered? '}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="font-semibold text-cyan hover:underline"
          >
            {mode === 'login' ? 'Create an account' : 'Log in instead'}
          </button>
        </p>
      </div>
    </div>
  );
};
