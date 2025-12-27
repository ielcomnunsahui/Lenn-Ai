import React from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Award, Clock, BookOpen, Target, ChevronRight, TrendingUp, Users, Presentation, FileCheck } from 'lucide-react';
import { User } from '../types.ts';

interface DashboardProps {
  user: User;
}

const studentPerformance = [
  { name: 'Mon', score: 65 },
  { name: 'Tue', score: 72 },
  { name: 'Wed', score: 68 },
  { name: 'Thu', score: 85 },
  { name: 'Fri', score: 78 },
  { name: 'Sat', score: 92 },
  { name: 'Sun', score: 88 },
];

const lecturerActivity = [
  { name: 'Mon', score: 40 },
  { name: 'Tue', score: 55 },
  { name: 'Wed', score: 90 },
  { name: 'Thu', score: 70 },
  { name: 'Fri', score: 85 },
  { name: 'Sat', score: 30 },
  { name: 'Sun', score: 20 },
];

const topicData = [
  { name: 'Anatomy', level: 85, color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
  { name: 'Pharma', level: 45, color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)' },
  { name: 'Med-Surg', level: 65, color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
  { name: 'PHC', level: 75, color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
];

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const isLecturer = user.role === 'lecturer';

  const stats = isLecturer ? [
    { label: 'Classes Taught', value: '48', icon: Presentation, color: 'blue' },
    { label: 'Resources Generated', value: '156', icon: BookOpen, color: 'emerald' },
    { label: 'Active Students', value: '320', icon: Users, color: 'orange' },
    { label: 'Exam Readiness', value: '92%', icon: FileCheck, color: 'purple' },
  ] : [
    { label: 'Topics Studied', value: '12', icon: BookOpen, color: 'blue' },
    { label: 'Practice Score', value: '82%', icon: Target, color: 'emerald' },
    { label: 'Study Time', value: '24.5h', icon: Clock, color: 'orange' },
    { label: 'Rank', value: 'Silver IV', icon: Award, color: 'purple' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-bold dark:text-white text-slate-900 mb-2">Welcome back, {user.fullName.split(' ')[0]}</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-500 px-3 py-1 rounded-full font-black uppercase tracking-widest">{user.school}</span>
            <span className={`text-[10px] border px-3 py-1 rounded-full font-black uppercase tracking-widest ${isLecturer ? 'bg-purple-500/10 border-purple-500/20 text-purple-600' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'}`}>
              {isLecturer ? `HOD ${user.course || 'Medical Science'}` : user.course}
            </span>
          </div>
          <p className="dark:text-slate-400 text-slate-600 text-lg font-medium italic">
            {isLecturer ? "Architecting the future of healthcare, one lecture at a time." : "I know say you no sabi book but I go help you 😂"}
          </p>
          {!isLecturer && (
            <p className="dark:text-slate-500 text-slate-500 text-xs mt-3 flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-500" />
              Your diagnostic accuracy improved by <span className="text-emerald-500 font-bold">12%</span> this week.
            </p>
          )}
        </div>
        <button className="liquid-metal px-8 py-3 rounded-2xl font-bold hover:scale-105 transition shadow-lg flex items-center gap-2 group">
          {isLecturer ? "New Lecture Plan" : "Resume Module"} <ChevronRight size={18} className="group-hover:translate-x-1 transition" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="glass-dark p-6 rounded-3xl group cursor-default">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 dark:bg-slate-800 bg-slate-100 ${isLecturer ? 'text-purple-500' : 'text-blue-500'}`}>
              <stat.icon size={24} />
            </div>
            <p className="text-xs font-bold dark:text-slate-500 text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-bold dark:text-white text-slate-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-dark p-8 rounded-3xl">
          <h3 className="text-xl font-bold mb-8 dark:text-white text-slate-900">{isLecturer ? "Departmental Output History" : "Quiz Performance History"}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={isLecturer ? lecturerActivity : studentPerformance}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isLecturer ? "#a855f7" : "#3b82f6"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={isLecturer ? "#a855f7" : "#3b82f6"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--panel-bg)', 
                    borderRadius: '16px', 
                    border: '1px solid var(--glass-border)', 
                    color: 'var(--text-main)' 
                  }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Area type="monotone" dataKey="score" stroke={isLecturer ? "#a855f7" : "#3b82f6"} strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-dark p-8 rounded-3xl">
          <h3 className="text-xl font-bold mb-8 dark:text-white text-slate-900">{isLecturer ? "Curriculum Coverage" : "Topic Mastery"}</h3>
          <div className="space-y-8">
            {topicData.map((topic) => (
              <div key={topic.name}>
                <div className="flex justify-between text-sm mb-3">
                  <span className="font-bold dark:text-slate-300 text-slate-700">{topic.name}</span>
                  <span className="dark:text-slate-500 text-slate-400">{isLecturer ? `${topic.level + 10}% Complete` : `${topic.level}%`}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full transition-all duration-1000" 
                    style={{ 
                      width: `${isLecturer ? topic.level + 10 : topic.level}%`, 
                      backgroundColor: isLecturer ? '#a855f7' : topic.color,
                      boxShadow: `0 0 12px ${isLecturer ? 'rgba(168, 85, 247, 0.4)' : topic.glow}`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className={`mt-12 p-6 rounded-2xl border ${isLecturer ? 'bg-purple-500/5 border-purple-500/20' : 'bg-blue-500/5 border-blue-500/20'}`}>
            <p className={`text-xs font-black uppercase tracking-widest mb-2 ${isLecturer ? 'text-purple-500' : 'text-blue-500'}`}>
              {isLecturer ? 'Instructional Priority' : 'High Priority Focus'}
            </p>
            <p className="text-sm dark:text-slate-400 text-slate-600 leading-relaxed">
              {isLecturer 
                ? "Students are struggling with Cardiac ADME. Suggest generating a specialized Pathophysiology case study." 
                : "Pharmacology: ADME cycles in geriatric patients. Revisit module 4."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;