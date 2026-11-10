import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { loginUser } from '../utils/userStorage';

export const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const { user, error: loginError } = await loginUser(username, password.trim());
      if (loginError) {
        setError(loginError);
        return;
      }
      onLogin(user);
    } catch (err) {
      setError('Could not reach the database: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-center items-center p-4 sm:p-6 text-stone-800">
      
      {/* Background Decorative Blur */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#EADCCB] blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#EADCCB] blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E8DFD3] shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Emblem & Logo */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#5B172E] text-white flex items-center justify-center font-serif font-bold text-2xl shadow-md border-2 border-[#C5A059]/40">
            SG
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wider text-[#431021] uppercase">
              Sainy Garg
            </h1>
            <p className="text-[11px] uppercase tracking-widest font-bold text-[#9B783E]">
              Couture Atelier • Order To Delivery
            </p>
          </div>
          <p className="text-xs text-stone-500 pt-1">
            Sign in with your credentials to access your production orders.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold animate-in shake flex items-center justify-between">
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username Input */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Username or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username or email"
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#FAF8F5] border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 text-stone-900 font-medium"
              />
            </div>
          </div>

          {/* Password Input WITH HIDE / UNHIDE TOGGLE (AS REQUESTED) */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full pl-9 pr-10 py-2 text-sm bg-[#FAF8F5] border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 text-stone-900 font-medium tracking-wide"
              />

              {/* Password Hide / Unhide Toggle Icon */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#5B172E] transition-colors p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-[#5B172E]" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#5B172E] via-[#6B1B37] to-[#802243] hover:from-[#431021] hover:to-[#5B172E] shadow-md hover:shadow-lg transition-all duration-200 transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? "Signing in..." : "Sign In to Atelier"}</span>
            <ArrowRight className="w-4 h-4 text-[#F3ECE2]" />
          </button>
        </form>

        {/* Footer Guarantee */}
        <div className="text-center text-[11px] text-stone-400 pt-2 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#9B783E]" />
          <span>Database-backed accounts • Strict User Isolation</span>
        </div>

      </div>
    </div>
  );
};
