
import React, { useState, useEffect } from 'react';
import { Material, Topic, Question, User } from '../types';
import { 
  Play, 
  Layers, 
  Info, 
  Search, 
  Loader2, 
  Image as ImageIcon,
  BrainCircuit,
  AlertCircle,
  BookOpen,
  ClipboardCheck,
  Zap,
  Star,
  ChevronRight,
  CheckCircle2,
  XCircle,
  MessageSquareText
} from 'lucide-react';
import { gemini } from '../services/geminiService';
import TutorChat from './TutorChat';

interface StudyHubProps {
  materials: Material[];
  user: User;
}

const StudyHub: React.FC<StudyHubProps> = ({ materials, user }) => {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [visualUrl, setVisualUrl] = useState<string | null>(null);
  const [isLoadingVisual, setIsLoadingVisual] = useState(false);
  const [activeTab, setActiveTab] = useState<'simplified' | 'keypoints' | 'visual' | 'quiz' | 'tutor'>('simplified');
  
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  const generateVisualContent = async (topic: Topic) => {
    setIsLoadingVisual(true);
    try {
      const url = await gemini.generateVisual(topic.title);
      setVisualUrl(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingVisual(false);
    }
  };

  const loadQuiz = async (topic: Topic) => {
    if (!selectedMaterial) return;
    setIsLoadingQuiz(true);
    try {
      const questions = await gemini.generateQuestions(topic.title, 'Intermediate', selectedMaterial.subject);
      setQuizQuestions(questions);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  useEffect(() => {
    if (selectedTopic) {
      generateVisualContent(selectedTopic);
      setQuizQuestions([]);
      setQuizAnswers({});
    }
  }, [selectedTopic]);

  useEffect(() => {
    if (activeTab === 'quiz' && selectedTopic && quizQuestions.length === 0) {
      loadQuiz(selectedTopic);
    }
  }, [activeTab]);

  const selectTopicAndMaterial = (topic: Topic, material: Material) => {
    setSelectedTopic(topic);
    setSelectedMaterial(material);
  };

  if (materials.length === 0) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-slate-900/50 rounded-full flex items-center justify-center mb-8 text-slate-700 border border-slate-800">
          <Search size={40} />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">No Neural Maps Uploaded</h3>
        <p className="text-slate-500 max-w-md mx-auto leading-relaxed">Upload academic documents to initialize subject-pure tutoring.</p>
        <div className="mt-8 w-full max-w-2xl">
           <TutorChat activeUser={user} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
      <div className="w-full lg:w-80 space-y-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="text-blue-500" size={24} /> Subject Bank
        </h2>
        <div className="space-y-4">
          {materials.map((mat) => (
            <div key={mat.id} className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">
                <Layers size={14} />
                {mat.subject}
              </div>
              {mat.topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => selectTopicAndMaterial(topic, mat)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                    selectedTopic?.id === topic.id 
                      ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-lg' 
                      : 'bg-slate-900/40 border-slate-800/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="font-bold text-sm">{topic.title}</p>
                  <p className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${selectedTopic?.id === topic.id ? 'text-blue-300' : 'text-slate-600'}`}>
                    Locked Subject: {mat.subject}
                  </p>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[750px]">
        {selectedTopic ? (
          <div className="glass-dark rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-full">
            <div className="p-8 border-b border-slate-800/50 bg-slate-950/20">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{selectedTopic.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-blue-500/20">Subject-Pure Isolation</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-emerald-500/20">{selectedMaterial?.subject} Locked</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'simplified', label: 'Simplified', icon: BrainCircuit },
                  { id: 'keypoints', label: 'High Yield', icon: ClipboardCheck },
                  { id: 'visual', label: 'Models', icon: Play },
                  { id: 'quiz', label: 'Practice', icon: Zap },
                  { id: 'tutor', label: 'Ask Tutor', icon: MessageSquareText },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all ${
                      activeTab === tab.id ? 'liquid-metal shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'text-slate-500 hover:text-slate-300 bg-slate-900/50'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 p-10 overflow-y-auto max-h-[650px] custom-scrollbar">
              {activeTab === 'tutor' && (
                <div className="h-full animate-fadeIn">
                  <TutorChat currentMaterial={selectedMaterial || undefined} activeUser={user} />
                </div>
              )}

              {activeTab === 'simplified' && (
                <div className="space-y-10 animate-fadeIn">
                  <div className="bg-blue-500/5 p-8 rounded-[2rem] border border-blue-500/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                      <BrainCircuit size={80} />
                    </div>
                    <h4 className="text-blue-400 font-black text-xs uppercase tracking-[0.2em] mb-4">Pure-Language Explanation ({selectedMaterial?.subject})</h4>
                    <p className="text-xl text-slate-200 leading-relaxed font-medium">
                      {selectedTopic.plainExplanation || "No subject-pure explanation available."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                        <ChevronRight className="text-blue-500" size={16} /> Step-by-Step {selectedMaterial?.subject}
                      </h4>
                      <div className="space-y-4">
                        {selectedTopic.stepByStep?.map((step, i) => (
                          <div key={i} className="flex gap-4 p-5 bg-slate-900/30 rounded-2xl border border-slate-800/50">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-blue-400">
                              {i+1}
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                       <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                        <Star className="text-yellow-500" size={16} /> Subject Mnemonics
                      </h4>
                      <div className="p-6 bg-yellow-500/5 rounded-[2rem] border border-yellow-500/10">
                        <div className="space-y-3">
                          {selectedTopic.mnemonics?.map((m, i) => (
                            <div key={i} className="p-4 bg-slate-950/50 rounded-xl text-slate-300 text-sm italic border border-slate-800 flex gap-3">
                              <Zap className="text-yellow-500 flex-shrink-0" size={16} />
                              "{m}"
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'keypoints' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  {selectedTopic.keyPoints?.map((point, idx) => (
                    <div key={idx} className="p-6 bg-slate-900/30 border border-slate-800/50 rounded-3xl flex gap-5 hover:border-slate-700 transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 rounded-2xl liquid-metal text-slate-950 flex items-center justify-center font-black text-sm">
                        {idx + 1}
                      </div>
                      <p className="text-slate-300 font-medium leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'visual' && (
                <div className="flex flex-col items-center h-full animate-fadeIn">
                  {isLoadingVisual ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20">
                      <Loader2 className="animate-spin text-blue-500 mb-6" size={48} />
                      <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px] animate-pulse">Synthesizing {selectedMaterial?.subject} Model...</p>
                    </div>
                  ) : visualUrl ? (
                    <div className="relative group w-full max-w-2xl">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                      <img 
                        src={visualUrl} 
                        alt={selectedTopic.title} 
                        className="relative rounded-[2rem] border border-slate-800 w-full shadow-2xl transition-transform hover:scale-[1.01]"
                      />
                      <div className="mt-10 p-8 bg-slate-900/50 border border-slate-800 rounded-[2rem]">
                        <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                           <ImageIcon size={14}/> {selectedMaterial?.subject} Visual Triggers
                        </h5>
                        <ul className="space-y-3">
                          {selectedTopic.visualTriggers?.map((trigger, i) => (
                            <li key={i} className="flex items-center gap-3 text-slate-300 text-sm bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                               <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                               {trigger}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {activeTab === 'quiz' && (
                <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
                   {isLoadingQuiz ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Zap className="animate-bounce text-yellow-500 mb-6" size={48} />
                      <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Generating {selectedMaterial?.subject} Scenarios...</p>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      {quizQuestions.map((q, qIdx) => (
                        <div key={q.id} className="glass-dark p-8 rounded-[2rem] border border-slate-800/50">
                           <div className="flex items-center gap-3 mb-6">
                             <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 uppercase tracking-widest">Scenario {qIdx + 1}</span>
                           </div>
                           <p className="text-xl font-bold text-white mb-8 leading-relaxed">{q.text}</p>
                           <div className="space-y-4">
                             {q.options.map((opt, oIdx) => {
                               const isSelected = quizAnswers[q.id] === oIdx;
                               const isCorrect = oIdx === q.correctAnswer;
                               const showResult = quizAnswers[q.id] !== undefined;

                               return (
                                 <button
                                   key={oIdx}
                                   onClick={() => !showResult && setQuizAnswers(prev => ({...prev, [q.id]: oIdx}))}
                                   className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${
                                     !showResult 
                                      ? 'border-slate-800 bg-slate-950 hover:border-slate-600' 
                                      : isCorrect 
                                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' 
                                        : isSelected 
                                          ? 'border-red-500/50 bg-red-500/10 text-red-400' 
                                          : 'border-slate-900 bg-slate-950 opacity-40'
                                   }`}
                                 >
                                   <span className="font-bold">{opt}</span>
                                   {showResult && isCorrect && <CheckCircle2 className="text-emerald-500" size={24} />}
                                   {showResult && isSelected && !isCorrect && <XCircle className="text-red-500" size={24} />}
                                 </button>
                               );
                             })}
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-950/30 rounded-[3rem] border border-dashed border-slate-800">
            <BookOpen size={48} className="text-slate-800 mb-6" />
            <h3 className="text-xl font-bold text-slate-600">Select a neural map to start your subject-pure session</h3>
            <p className="text-slate-700 mt-2 text-sm max-w-sm text-center">Your Academic Tutor is ready to explain concepts using strict subject isolation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyHub;
