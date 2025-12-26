
import React, { useState } from 'react';
import { Gamepad2, Layers, Map, Trophy, Flame, ChevronRight, Loader2, Star, Target, Users, Key } from 'lucide-react';
import { gemini } from '../services/geminiService';
import { SubjectArea, User } from '../types';
import BuildThePath from './games/BuildThePath';
import LabelIt from './games/LabelIt';

interface GamesHubProps {
  user?: User;
}

const GamesHub: React.FC<GamesHubProps> = ({ user }) => {
  const [activeGame, setActiveGame] = useState<'selection' | 'build-the-path' | 'label-it'>('selection');
  const [streak, setStreak] = useState(5);
  const [points, setPoints] = useState(1250);
  const [isGenerating, setIsGenerating] = useState(false);
  const [gameData, setGameData] = useState<any>(null);

  const leaderboard = [
    { name: user?.fullName || 'Scholar Jones', points: 1250, streak: 5, accuracy: 94, school: user?.school || 'Global Academy' },
    { name: 'Nurse Joy', points: 1100, streak: 12, accuracy: 88, school: user?.school || 'Global Academy' },
    { name: 'FutureMD', points: 950, streak: 3, accuracy: 91, school: 'Health Institute' },
    { name: 'MedGuru', points: 880, streak: 8, accuracy: 85, school: 'Royal College' },
  ];

  const handleStartBuildThePath = async () => {
    setIsGenerating(true);
    try {
      const data = await gemini.generatePathGame(SubjectArea.ANATOMY);
      setGameData(data);
      setActiveGame('build-the-path');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartLabelIt = async () => {
    if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }
    }

    setIsGenerating(true);
    try {
      const data = await gemini.generateLabelGame(SubjectArea.ANATOMY);
      setGameData(data);
      setActiveGame('label-it');
    } catch (e) {
      console.error(e);
      if (e instanceof Error && e.message.includes("Requested entity was not found")) {
        if ((window as any).aistudio?.openSelectKey) await (window as any).aistudio.openSelectKey();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGameEnd = (won: boolean) => {
    if (won) {
      setPoints(p => p + 100);
      setStreak(s => s + 1);
    }
    setActiveGame('selection');
  };

  if (activeGame === 'build-the-path' && gameData) {
    return <BuildThePath data={gameData} onComplete={(accuracy) => handleGameEnd(accuracy === 100)} onBack={() => setActiveGame('selection')} />;
  }

  if (activeGame === 'label-it' && gameData) {
    return <LabelIt data={gameData} onComplete={(won) => handleGameEnd(won)} onBack={() => setActiveGame('selection')} />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="liquid-metal p-3 rounded-2xl shadow-lg">
              <Gamepad2 size={32} className="text-slate-900" />
            </div>
            <h2 className="text-4xl font-bold text-white">Games & Fun</h2>
          </div>
          <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
            Level up your nursing knowledge with stress-free mini-games. Challenge yourself and climb the leaderboard!
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="glass-dark p-6 rounded-[2rem] border border-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.1)] flex items-center gap-6">
            <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center">
              <Flame size={28} className="text-orange-500 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Streak</p>
              <h3 className="text-2xl font-black text-white">{streak} Days</h3>
              <p className="text-[10px] text-orange-400 font-bold uppercase mt-1">{user?.fullName.split(' ')[0] || 'Scholar Jones'} is on fire! 🔥</p>
            </div>
          </div>
          <div className="glass-dark p-6 rounded-[2rem] border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)] flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <Star size={28} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">XP Points</p>
              <h3 className="text-2xl font-black text-white">{points.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Target size={20} className="text-blue-400" /> Choose Your Challenge
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-dark p-10 rounded-[2.5rem] border border-slate-800/50 hover:border-blue-500/30 transition-all group relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-12 text-blue-500/5 group-hover:scale-110 transition-transform">
                <Layers size={160} />
              </div>
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-8">
                  <Layers size={28} />
                </div>
                <h4 className="text-2xl font-bold text-white mb-4">Build the Path</h4>
                <p className="text-slate-500 mb-8 leading-relaxed italic">"The sequence of life matters. Order the biological processes correctly."</p>
                <div className="flex gap-2 mb-12 mt-auto">
                  <span className="text-[10px] font-black text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full uppercase tracking-widest">Anatomy</span>
                  <span className="text-[10px] font-black text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-widest">Physiology</span>
                </div>
                <button 
                  onClick={handleStartBuildThePath}
                  disabled={isGenerating}
                  className="w-full liquid-metal py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 group/btn"
                >
                  {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <>Play Game <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition" /></>}
                </button>
              </div>
            </div>

            <div className="glass-dark p-10 rounded-[2.5rem] border border-slate-800/50 hover:border-emerald-500/30 transition-all group relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-12 text-emerald-500/5 group-hover:scale-110 transition-transform">
                <Map size={160} />
              </div>
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-8">
                  <Map size={28} />
                </div>
                <h4 className="text-2xl font-bold text-white mb-4">Label It!</h4>
                <p className="text-slate-500 mb-8 leading-relaxed italic">"Identify key structures on high-fidelity anatomical illustrations."</p>
                <div className="flex gap-2 mb-12 mt-auto">
                  <span className="text-[10px] font-black text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full uppercase tracking-widest">Anatomy</span>
                  <span className="text-[10px] font-black text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full uppercase tracking-widest">Embryology</span>
                </div>
                <button 
                  onClick={handleStartLabelIt}
                  disabled={isGenerating}
                  className="w-full liquid-metal py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 group/btn"
                >
                  {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <>Play Game <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition" /></>}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy size={20} className="text-yellow-500" /> Leaderboard
          </h3>
          <div className="glass-dark rounded-[2rem] border border-slate-800/50 overflow-hidden">
            <div className="p-6 bg-slate-900/40 border-b border-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users size={16} className="text-slate-500" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Global Ranking</span>
              </div>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Weekly</span>
            </div>
            <div className="divide-y divide-slate-800/50">
              {leaderboard.map((u, i) => (
                <div key={u.name} className={`p-5 flex items-center justify-between hover:bg-slate-800/30 transition-colors ${u.name === user?.fullName ? 'bg-blue-500/5' : ''}`}>
                  <div className="flex items-center gap-4">
                    <span className={`w-6 text-xs font-black ${i === 0 ? 'text-yellow-500' : 'text-slate-600'}`}>{i + 1}</span>
                    <div>
                      <p className={`text-sm font-bold ${u.name === user?.fullName ? 'text-blue-400' : 'text-white'}`}>{u.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{u.accuracy}% Accuracy • {u.school}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white">{u.points.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">XP</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesHub;
