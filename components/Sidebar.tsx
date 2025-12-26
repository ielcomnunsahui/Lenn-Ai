import React from 'react';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  Settings, 
  Info,
  Menu,
  X,
  FileText,
  Gamepad2,
  LogOut,
  User as UserIcon,
  MessageSquare,
  FlaskConical,
  GraduationCap
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, user }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // Define menu items with role restrictions
  const allMenuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['student', 'lecturer'] },
    { id: 'material-lab', icon: FlaskConical, label: 'Material Lab', roles: ['student'] },
    { id: 'chat', icon: MessageSquare, label: 'Lennai Chat', roles: ['student'] },
    { id: 'lecturer-hub', icon: GraduationCap, label: 'Lecturer Protocol', roles: ['lecturer'] },
    { id: 'exam-guide', icon: FileText, label: 'Exam Guide', roles: ['student', 'lecturer'] },
    { id: 'practice', icon: BrainCircuit, label: 'NCLEX Practice', roles: ['student'] },
    { id: 'games', icon: Gamepad2, label: 'Neural Games', roles: ['student'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(user.role || 'student'));

  const bottomItems = [
    { id: 'about', icon: Info, label: 'Ethics & Privacy' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass-dark rounded-xl shadow-lg border border-slate-700"
      >
        {isOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
      </button>

      <div className={`
        fixed top-0 left-0 h-full bg-[#0f172a] border-r border-slate-800/50 z-50 transition-transform duration-500 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 w-64 flex flex-col
      `}>
        <div className="p-6 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3 mb-10">
            <div className="liquid-metal p-2.5 rounded-xl shadow-lg">
              <BrainCircuit className="text-slate-900" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight liquid-metal-text leading-none">Lennai</h1>
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest opacity-60 mt-1">powered by phurdio</p>
            </div>
          </div>

          <div className="mb-8 p-4 glass-dark rounded-[1.5rem] border border-slate-800/50">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${user.role === 'lecturer' ? 'bg-purple-500/20 border-purple-500/30 text-purple-400' : 'bg-blue-500/20 border-blue-500/30 text-blue-400'}`}>
                {user.role === 'lecturer' ? <GraduationCap size={16} /> : <UserIcon size={16} />}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-white truncate uppercase tracking-tight">{user.fullName}</p>
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest truncate">{user.role === 'lecturer' ? 'Senior Educator' : (user.course || 'Scholar')}</p>
              </div>
            </div>
            <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
              <div className={`h-full w-[65%] rounded-full shadow-lg ${user.role === 'lecturer' ? 'bg-purple-500 shadow-purple-500/30' : 'bg-blue-500 shadow-blue-500/30'}`}></div>
            </div>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === item.id 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <item.icon size={18} className={activeTab === item.id ? 'text-blue-400' : 'text-slate-500'} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-slate-800/50 space-y-3">
          <nav className="space-y-1">
            {bottomItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === item.id 
                    ? 'text-blue-400' 
                    : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                <item.icon size={14} />
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500/70 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;