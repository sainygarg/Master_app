import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { INITIAL_USERS } from '../data/initialUsers';

export const LoginPage = ({ onLogin, users = [] }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Fallback to INITIAL_USERS if users prop doesn't have accounts
  const allAccounts = (users && users.length > 0) ? users : INITIAL_USERS;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setError('Please enter your username.');
      return;
    }
    if (!cleanPass) {
      setError('Please enter your password.');
      return;
    }

    // Match against username, email, name, or role
    const foundUser = allAccounts.find(
      (u) =>
        u.username?.toLowerCase() === cleanUser ||
        u.email?.toLowerCase() === cleanUser ||
        u.name?.toLowerCase() === cleanUser ||
        (cleanUser === 'admin' && (u.role === 'Admin' || u.isAdmin))
    ) || INITIAL_USERS.find(
      (u) =>
        u.username?.toLowerCase() === cleanUser ||
        u.email?.toLowerCase() === cleanUser
    );

    if (!foundUser) {
      setError('User not found. Click one of the 1-click login buttons below.');
      return;
    }

    // Check password
    if (foundUser.password !== cleanPass) {
      setError('Incorrect password. Default password is "admin123" for Admin and "user123" for Users.');
      return;
    }

    onLogin(foundUser);
  };

  const handleQuickLogin = (demoUsername, demoPassword) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
    setError('');

    const foundUser =
      allAccounts.find((u) => u.username?.toLowerCase() === demoUsername.toLowerCase()) ||
      INITIAL_USERS.find((u) => u.username?.toLowerCase() === demoUsername.toLowerCase());

    if (foundUser) {
      onLogin(foundUser);
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
                placeholder="e.g. admin or priya"
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
            className="w-full mt-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#5B172E] via-[#6B1B37] to-[#802243] hover:from-[#431021] hover:to-[#5B172E] shadow-md hover:shadow-lg transition-all duration-200 transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign In to Atelier</span>
            <ArrowRight className="w-4 h-4 text-[#F3ECE2]" />
          </button>
        </form>

        {/* 1-Click Demo Accounts Selector */}
        <div className="pt-4 border-t border-[#F0E6D8] space-y-2.5">
          <div className="text-[11px] font-bold text-[#9B783E] uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Instant Logins:</span>
            </span>
            <span className="text-[10px] text-stone-400 font-normal">Click to test</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Admin Pill */}
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'admin123')}
              className="p-2.5 bg-[#FAF2E6] hover:bg-[#F3E7D3] border border-[#DECDB8] rounded-xl text-left transition-all cursor-pointer"
            >
              <div className="font-bold text-[#5B172E] flex items-center justify-between">
                <span>👑 Admin</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-[#5B172E] text-white rounded">All Data</span>
              </div>
              <div className="text-[10px] text-stone-500 mt-0.5 font-mono">admin / admin123</div>
            </button>

            {/* User 1 Pill (Priya) */}
            <button
              type="button"
              onClick={() => handleQuickLogin('priya', 'user123')}
              className="p-2.5 bg-white hover:bg-stone-50 border border-[#DECDB8] rounded-xl text-left transition-all cursor-pointer"
            >
              <div className="font-bold text-purple-900 flex items-center justify-between">
                <span>👤 Priya</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded">User</span>
              </div>
              <div className="text-[10px] text-stone-500 mt-0.5 font-mono">priya / user123</div>
            </button>

            {/* User 2 Pill (Ananya) */}
            <button
              type="button"
              onClick={() => handleQuickLogin('ananya', 'user123')}
              className="p-2.5 bg-white hover:bg-stone-50 border border-[#DECDB8] rounded-xl text-left transition-all cursor-pointer"
            >
              <div className="font-bold text-emerald-900 flex items-center justify-between">
                <span>👤 Ananya</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">User</span>
              </div>
              <div className="text-[10px] text-stone-500 mt-0.5 font-mono">ananya / user123</div>
            </button>

            {/* User 3 Pill (Kavita) */}
            <button
              type="button"
              onClick={() => handleQuickLogin('kavita', 'user123')}
              className="p-2.5 bg-white hover:bg-stone-50 border border-[#DECDB8] rounded-xl text-left transition-all cursor-pointer"
            >
              <div className="font-bold text-amber-900 flex items-center justify-between">
                <span>👤 Kavita</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">User</span>
              </div>
              <div className="text-[10px] text-stone-500 mt-0.5 font-mono">kavita / user123</div>
            </button>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="text-center text-[11px] text-stone-400 pt-2 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#9B783E]" />
          <span>Local Storage Persistence • Strict User Isolation</span>
        </div>

      </div>
    </div>
  );
};
