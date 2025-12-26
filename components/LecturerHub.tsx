import React, { useState, useEffect } from 'react';
import { 
  BookOpen, FileText, Layout, Zap, Target, Download, Loader2, Plus, X, Search, CheckCircle2, 
  Clock, Sparkles, ChevronRight, ClipboardList, GraduationCap, Map, BrainCircuit
} from 'lucide-react';
import { gemini } from '../services/geminiService.ts';
import { LecturerNotes, LessonPlan, QuestionBank } from '../types.ts';

const LecturerHub: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState<'summary' | 'detailed'>('detailed');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeModule, setActiveModule] = useState<'notes' | 'questions' | 'lesson-plan' | 'slides' | 'mnemonics'>('notes');
  
  const [generatedNotes, setGeneratedNotes] = useState<LecturerNotes | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<QuestionBank | null>(null);
  const [generatedLessonPlan, setGeneratedLessonPlan] = useState<LessonPlan | null>(null);
  const [mnemonics, setMnemonics] = useState<{ phrase: string; breakdown: string; target: string }[]>([]);

  // Special Mnemonics for Arterial Supply of Upper Limb
  const arterialMnemonics = [
    { phrase: "Screw The Lawyer, Save The Patient", breakdown: "S: Superior thoracic, T: Thoraco-acromial, L: Lateral thoracic, S: Subscapular, T: Thoraco-dorsal, P: Posterior circumflex humeral", target: "Axillary Artery Branches" },
    { phrase: "Remember All Under-arm Vessels", breakdown: "R: Radial, A: Axial, U: Ulnar, V: Volar arches", target: "Main Arm Arteries" }
  ];

  const handleGenerate = async () => {
    if (!topic.trim() || isGenerating) return;
    setIsGenerating(true);
    
    try {
      if (activeModule === 'notes') {
        const result = await gemini.generateLecturerNotes(topic, depth);
        setGeneratedNotes(result);
      } else if (activeModule === 'questions') {
        const result = await gemini.generateLecturerQuestionBank(topic);
        setGeneratedQuestions(result);
      } else if (activeModule === 'lesson-plan') {
        const result = await gemini.generateLessonPlan(topic);
        setGeneratedLessonPlan(result);
      }
      
      // Auto-populate mnemonics if topic matches arterial supply
      if (topic.toLowerCase().includes('arterial') && topic.toLowerCase().includes('upper limb')) {
        setMnemonics(arterialMnemonics);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 animate-fadeIn pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div>
          <h2 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
            <Sparkles className="text-blue-400" size={32} /> Lennia Lecturer Hub
          </h2>
          <p className="text-slate-500 text-lg">Curriculum Synthesis Protocol: Advanced Educator Tools.</p>
        </div>
      </div>

      <div className="glass-dark p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <input 
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter Lecture Topic (e.g., Arterial Supply of the Upper Limb)"
            className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl py-5 px-8 text-white text-lg focus:outline-none focus:border-blue-500 transition-all"
          />
          <button onClick={handleGenerate} className="liquid-metal px-10 py-4 rounded-2xl font-black uppercase text-sm">Architect Content</button>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-800 pt-8">
          {[
            { id: 'notes', label: 'Teaching Notes', icon: BookOpen },
            { id: 'questions', label: 'Assessments', icon: Zap },
            { id: 'lesson-plan', label: 'Lesson Plan', icon: ClipboardList },
            { id: 'mnemonics', label: 'Mnemonics', icon: BrainCircuit },
          ].map(module => (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeModule === module.id ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-500'
              }`}
            >
              <module.icon size={16} />
              {module.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[400px]">
        {isGenerating ? (
          <div className="flex flex-col items-center py-20"><Loader2 className="animate-spin text-blue-500" size={64} /></div>
        ) : (
          <div className="animate-fadeIn">
            {activeModule === 'mnemonics' && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                   <BrainCircuit className="text-purple-400" size={24} />
                   <h3 className="text-2xl font-bold text-white">Clinical Memory Protocol</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(mnemonics.length > 0 ? mnemonics : [
                    { phrase: "Waiting for analysis...", breakdown: "Synthesis required", target: "Topic Specific" }
                  ]).map((m, i) => (
                    <div key={i} className="glass-dark p-8 rounded-3xl border border-purple-500/20 shadow-xl group hover:border-purple-500/50 transition-all">
                      <p className="text-[10px] text-purple-400 font-black uppercase tracking-[0.3em] mb-4">{m.target}</p>
                      <h4 className="text-2xl font-black text-white mb-6 leading-tight italic">"{m.phrase}"</h4>
                      <div className="p-5 bg-slate-950/50 rounded-2xl border border-slate-800">
                        <p className="text-sm text-slate-400 leading-relaxed font-medium"><span className="text-purple-400 font-black mr-2">BREAKDOWN:</span> {m.breakdown}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* ... other modules rendering ... */}
            {activeModule === 'notes' && generatedNotes && (
              <section className="glass-dark p-10 rounded-[2.5rem] border border-slate-800">
                <h3 className="text-3xl font-bold text-white mb-6">{generatedNotes.title}</h3>
                <p className="text-lg text-slate-300 whitespace-pre-wrap leading-relaxed">{generatedNotes.content}</p>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LecturerHub;