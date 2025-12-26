
import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Book, School, AlertCircle, ChevronDown, GraduationCap, UserCircle, Loader2 } from 'lucide-react';
import { User } from '../types';
import { storage } from '../services/storageService';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [regData, setRegData] = useState({
    fullName: '',
    email: '',
    course: '',
    school: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'student' | 'lecturer'
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const result = await storage.login(loginData.email, loginData.password);
    if (result.success && result.user) {
      onLogin(result.user);
    } else {
      setError(result.error || 'Login failed');
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regData.password !== regData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!regData.course) {
      setError(`Please select your ${regData.role === 'student' ? 'course' : 'department'}`);
      return;
    }
    
    setLoading(true);
    setError(null);

    const result = await storage.register(regData);
    if (result.success) {
      setMode('login');
      setError(null);
      setLoginData({ email: regData.email, password: regData.password });
    } else {
      setError(result.error || 'Registration failed');
    }
    setLoading(false);
  };

  const inputClasses = "w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-10 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700 text-sm appearance-none cursor-pointer";
  const iconClasses = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors pointer-events-none";

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] animate-pulse-soft"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-600/10 blur-[150px] animate-pulse-soft"></div>
      </div>

      <div className="w-full max-w-md animate-fadeIn relative z-10">
        <div className="glass-dark p-8 md:p-10 rounded-[2.5rem] border border-slate-800/50 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black liquid-metal-text leading-none">Lennai</h1>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest opacity-60 mt-2">powered by phurdio</p>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative group">
                <Mail className={iconClasses} size={18} />
                <input type="email" required placeholder="Email" className={inputClasses} value={loginData.email} onChange={e => setLoginData({...loginData, email: e.target.value})} />
              </div>
              <div className="relative group">
                <Lock className={iconClasses} size={18} />
                <input type="password" required placeholder="Password" className={inputClasses} value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} />
              </div>
              {error && <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20"><AlertCircle size={14} /> {error}</div>}
              <button type="submit" disabled={loading} className="w-full liquid-metal py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Login"}
              </button>
              <button onClick={() => setMode('register')} className="w-full mt-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-400">Register Profile</button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
               <div className="flex gap-2 mb-4 p-1 bg-slate-900 rounded-2xl border border-slate-800">
                <button type="button" onClick={() => setRegData({...regData, role: 'student'})} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${regData.role === 'student' ? 'liquid-metal text-slate-900' : 'text-slate-500'}`}>Student</button>
                <button type="button" onClick={() => setRegData({...regData, role: 'lecturer'})} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${regData.role === 'lecturer' ? 'liquid-metal text-slate-900' : 'text-slate-500'}`}>Lecturer</button>
              </div>
              <div className="relative group"><UserIcon className={iconClasses} size={18} /><input type="text" required placeholder="Full Name" className={inputClasses} value={regData.fullName} onChange={e => setRegData({...regData, fullName: e.target.value})} /></div>
              <div className="relative group"><Mail className={iconClasses} size={18} /><input type="email" required placeholder="Email" className={inputClasses} value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative group"><Book className={iconClasses} size={18} /><select required className={inputClasses} value={regData.course} onChange={e => setRegData({...regData, course: e.target.value})}><option value="" disabled>Course</option><option value="Nursing">Nursing</option><option value="MBBS">MBBS</option></select></div>
                <div className="relative group"><School className={iconClasses} size={18} /><input type="text" required placeholder="School" className={inputClasses} value={regData.school} onChange={e => setRegData({...regData, school: e.target.value})} /></div>
              </div>
              <div className="relative group"><Lock className={iconClasses} size={18} /><input type="password" required placeholder="Password" className={inputClasses} value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} /></div>
              <div className="relative group"><Lock className={iconClasses} size={18} /><input type="password" required placeholder="Confirm Password" className={inputClasses} value={regData.confirmPassword} onChange={e => setRegData({...regData, confirmPassword: e.target.value})} /></div>
              {error && <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20"><AlertCircle size={14} /> {error}</div>}
              <button type="submit" disabled={loading} className="w-full liquid-metal py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Initialize"}
              </button>
              <button onClick={() => setMode('login')} className="w-full mt-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-400">Back to Login</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
