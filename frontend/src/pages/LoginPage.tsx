import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Recycle, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onNavigateHome: () => void;
  onNavigateRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateHome, onNavigateRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onNavigateHome();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSeed = (seedEmail: string, seedPass: string) => {
    setEmail(seedEmail);
    setPassword(seedPass);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to RECYCLORA
        </button>

        <Card className="p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-brand-800 p-2.5 rounded-xl text-white">
              <Recycle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Sign In to RECYCLORA</h2>
              <p className="text-xs text-slate-500">Access your role-based SaaS dashboard</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. citizen@recyclora.org"
                className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>

            <Button type="submit" isLoading={loading} className="w-full py-2.5">
              Sign In to Account
            </Button>
          </form>

          {/* Seed Credentials Quick Fill Box */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" /> One-Click Seed Account Fill:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
              <button onClick={() => handleQuickSeed('citizen@recyclora.org', 'Citizen123!')} className="p-1.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-emerald-50 text-slate-700 dark:text-slate-200 text-left font-mono">
                👤 Citizen
              </button>
              <button onClick={() => handleQuickSeed('collector@recyclora.org', 'Collector123!')} className="p-1.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-emerald-50 text-slate-700 dark:text-slate-200 text-left font-mono">
                🚛 Collector
              </button>
              <button onClick={() => handleQuickSeed('recycler@recyclora.org', 'Recycler123!')} className="p-1.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-emerald-50 text-slate-700 dark:text-slate-200 text-left font-mono">
                ♻️ Recycler
              </button>
              <button onClick={() => handleQuickSeed('admin@recyclora.org', 'Admin123!')} className="p-1.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-emerald-50 text-slate-700 dark:text-slate-200 text-left font-mono">
                🛡️ Admin
              </button>
              <button onClick={() => handleQuickSeed('analyst@recyclora.org', 'Analyst123!')} className="p-1.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-emerald-50 text-slate-700 dark:text-slate-200 text-left font-mono">
                📊 Analyst
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <button onClick={onNavigateRegister} className="font-bold text-emerald-600 hover:underline">
              Register New Account
            </button>
          </p>
        </Card>
      </div>
    </div>
  );
};
