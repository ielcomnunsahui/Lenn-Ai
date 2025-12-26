
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PracticeQuiz from './components/PracticeQuiz';
import ExamGuide from './components/ExamGuide';
import GamesHub from './components/GamesHub';
import Auth from './components/Auth';
import TutorChat from './components/TutorChat';
import MaterialLab from './components/MaterialLab';
import LecturerHub from './components/LecturerHub';
import { User } from './types';
import { storage } from './services/storageService';
import { LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initSession = async () => {
      const activeUser = await storage.getActiveUser();
      if (activeUser) {
        setUser(activeUser);
      }
      setIsInitialized(true);
    };
    initSession();
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    if (newUser.role === 'lecturer') setActiveTab('lecturer-hub');
    else setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    await storage.logout();
    setUser(null);
    setActiveTab('dashboard');
  };

  if (!isInitialized) return null;

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
