import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import PracticeQuiz from './components/PracticeQuiz.tsx';
import ExamGuide from './components/ExamGuide.tsx';
import GamesHub from './components/GamesHub.tsx';
import Auth from './components/Auth.tsx';
import TutorChat from './components/TutorChat.tsx';
import MaterialLab from './components/MaterialLab.tsx';
import LecturerHub from './components/LecturerHub.tsx';
import { User } from './types.ts';
import { storage } from './services/storageService.ts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initSession = async () => {
      try {
        const activeUser = await storage.getActiveUser();
        if (activeUser) {
          setUser(activeUser);
        }
      } catch (err) {
        console.error("Initialization failed:", err);
      } finally {
        setIsInitialized(true);
      }
    };
    initSession();
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    if (newUser.role === 'lecturer') setActiveTab('lecturer-hub');
    else setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    try {
      await storage.logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
    setUser(null);
    setActiveTab('dashboard');
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#020617] text-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Initializing Lennai Protocol...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={user} />;
      case 'material-lab': return <MaterialLab />;
      case 'chat': return <div className="p-4 md:p-8 h-screen"><TutorChat activeUser={user} /></div>;
      case 'lecturer-hub': return <LecturerHub />;
      case 'exam-guide': return <ExamGuide />;
      case 'practice': return <PracticeQuiz materials={[]} />;
      case 'games': return <GamesHub user={user} />;
      default: return <Dashboard user={user} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-100 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} user={user} />
      <main className="flex-1 lg:ml-64 min-h-screen relative overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;