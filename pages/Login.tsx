
import React, { useState } from 'react';
import { useAuth } from '../App';
import { TrendingUp, Lock, User, ArrowRight, ShieldCheck, Mail } from 'lucide-react';

const Login: React.FC = () => {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignup) {
        const result = await signup(email, password, username);
        if (result.success) {
          setSuccess('Account created! Please check your email to verify your account.');
          setEmail('');
          setPassword('');
          setUsername('');
        } else {
          setError(result.error || 'Signup failed');
        }
      } else {
        const result = await login(email, password);
        if (!result.success) {
          setError(result.error || 'Login failed');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-amber-500 selection:text-white">
      <div className="w-full max-w-[1000px] grid md:grid-cols-2 bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100">
        
        {/* Visual Side */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-slate-900 text-white relative">
          <div className="z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-amber-500 p-2.5 rounded-xl shadow-lg shadow-amber-500/20">
                <TrendingUp size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight uppercase">GLAT System</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Track Your <br/><span className="text-amber-500">Gold Appraisals</span> <br/>Professionally.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm font-medium">
              The efficient way to manage loan entries across multiple bank branches.
            </p>
          </div>

          <div className="z-10 bg-slate-800/50 backdrop-blur-md p-6 rounded-[1.5rem] border border-slate-700/50 mt-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/10">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-100">Secure Access</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Authorized users only</p>
              </div>
            </div>
          </div>

          {/* Abstract subtle decorations */}
          <div className="absolute top-1/4 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Form Side */}
        <div className="p-8 md:p-16 flex flex-col justify-center bg-white">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {isSignup ? 'Create Account' : 'Portal Login'}
            </h2>
            <p className="text-slate-500 font-medium">
              {isSignup ? 'Register as a new appraiser' : 'Enter your appraiser credentials'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignup && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="text"
                    placeholder="Your name"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all font-semibold text-slate-900 placeholder-slate-400"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all font-semibold text-slate-900 placeholder-slate-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all font-semibold text-slate-900 placeholder-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {isSignup && (
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 mt-2">
                  <p className="text-[10px] text-blue-700 font-bold uppercase tracking-widest">
                    Password must be at least 6 characters
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-bold border border-red-100">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-100">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 bg-amber-500 text-white font-bold rounded-2xl shadow-xl shadow-amber-500/30 hover:bg-amber-600 active:scale-95 transition-all flex items-center justify-center gap-3 text-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Sign In')}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
                setSuccess('');
              }}
              className="text-amber-600 hover:text-amber-700 font-bold text-sm"
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              GLAT System v2.1
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
