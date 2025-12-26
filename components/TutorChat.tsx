import React, { useState, useRef, useEffect } from 'react';
import { Send, User, BrainCircuit, Sparkles, Loader2, Plus, MessageSquare, History, ChevronRight, Layers, Layout, Zap, Info } from 'lucide-react';
import { gemini } from '../services/geminiService.ts';
import { ChatMessage, User as UserType } from '../types.ts';
import { storage } from '../services/storageService.ts';

interface TutorChatProps {
  activeUser: UserType;
}

const TutorChat: React.FC<TutorChatProps> = ({ activeUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTabs, setActiveTabs] = useState<Record<string, string>>({});
  const [showHistory, setShowHistory] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
  }, [activeUser]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const loadSessions = async () => {
    const data = await storage.getSessions(activeUser.id);
    setSessions(data);
  };

  const selectSession = async (id: string) => {
    setCurrentSessionId(id);
    setShowHistory(false);
    setIsTyping(true);
    
    try {
      const history = await storage.getSessionHistory(id);
      setMessages(history);
      
      // Initialize tabs for the loaded history
      const tabs: Record<string, string> = {};
      history.forEach(m => { 
        if (m.role === 'tutor') tabs[m.id] = 'overview'; 
      });
      setActiveTabs(tabs);
    } catch (error) {
      console.error("Failed to load session history:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const startNewSession = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setShowHistory(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    let sessionId = currentSessionId;
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      // 1. Ensure we have a session
      if (!sessionId) {
        const newSession = await storage.createSession(activeUser.id, currentInput.slice(0, 40));
        sessionId = newSession.id;
        setCurrentSessionId(sessionId);
        loadSessions(); // Update history list
      }

      // 2. Add user message to UI and cloud
      const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: currentInput };
      setMessages(prev => [...prev, userMsg]);
      await storage.saveMessage(sessionId!, activeUser.id, currentInput, 'user');

      // 3. Query Gemini with history context
      const historyContext = messages.slice(-5).map(m => ({
        role: m.role === 'user' ? 'user' : 'ai',
        content: m.content
      }));

      const response = await gemini.chatQuery(currentInput, historyContext);
      
      // 4. Construct metadata for study aids
      const metadata = {
        topicName: response.topicTitle,
        practiceQuestions: response.practiceQuestions,
        keyPoints: response.keyConcepts,
        subject: response.subject,
        visualDescription: response.visualGuide,
        examFocus: response.examFocus,
        slides: response.slides,
        flashcards: response.flashcards
      };

      const tutorMsg: ChatMessage = {
        id: `tutor-${Date.now()}`,
        role: 'tutor',
        content: response.simpleExplanation,
        ...metadata
      };

      // 5. Update UI and persist turn
      setMessages(prev => [...prev, tutorMsg]);
      setActiveTabs(prev => ({ ...prev, [tutorMsg.id]: 'overview' }));
      await storage.saveMessage(sessionId!, activeUser.id, response.simpleExplanation, 'ai', metadata);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { 
        id: 'err', 
        role: 'tutor', 
        content: "I encountered a protocol error. Please try again or re-initialize the session." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full glass-dark rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl relative">
      {/* Header with History Control */}
      <div className="p-6 border-b border-slate-800/50 bg-slate-900/40 flex items-center justify-between backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="liquid-metal p-2.5 rounded-xl shadow-lg">
            <MessageSquare className="text-slate-900" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider leading-none">Lennai Clinical Persistence</h3>
            <p className="text-[7px] text-blue-400 font-black uppercase tracking-widest mt-1">
              {currentSessionId ? 'Protocol Active • Cloud Synced' : 'Awaiting Diagnostic Input'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2.5 rounded-xl transition-all border ${
              showHistory ? 'bg-blue-600 text-white border-blue-500 shadow-lg' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <History size={18} />
          </button>
          <button onClick={startNewSession} className="p-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-all border border-slate-700">
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Session History Overlay */}
      {showHistory && (
        <div className="absolute top-20 right-6 w-80 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl z-50 p-5 backdrop-blur-xl animate-fadeIn max-h-[70%] overflow-hidden flex flex-col">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Academic Protocol History</h4>
          <div className="space-y-2 overflow-y-auto flex-1 custom-scrollbar pr-2">
            {sessions.length === 0 && <p className="text-center py-10 text-slate-600 text-xs italic">No saved protocols found.</p>}
            {sessions.map(s => (
              <button 
                key={s.id} 
                onClick={() => selectSession(s.id)}
                className={`w-full text-left p-4 rounded-2xl transition-all group border ${
                  currentSessionId === s.id ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-slate-800/50 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold truncate pr-2">{s.title || 'Untitled Session'}</span>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all text-blue-400" />
                </div>
                <p className="text-[8px] text-slate-600 mt-2 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  {new Date(s.created_at).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-12 custom-scrollbar bg-slate-950/10">
        {messages.length === 0 && !isTyping && (
          <div className="h-full flex flex-col items-center justify-center text-center px-10 py-20">
            <div className="w-24 h-24 bg-blue-500/5 rounded-full flex items-center justify-center mb-8 border border-blue-500/10 animate-pulse">
               <BrainCircuit className="text-blue-500/40" size={40} />
            </div>
            <h2 className="text-3xl font-black text-white mb-3 italic">Persistent Scholar Protocol</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] max-w-sm leading-relaxed">
              Every diagnostic query is archived to your neural profile for exam-readiness tracking.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div className={`flex gap-4 md:gap-6 max-w-[95%] lg:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center border shadow-xl ${
                msg.role === 'user' ? 'bg-slate-800 border-slate-700' : 'liquid-metal border-white/20'
              }`}>
                {msg.role === 'user' ? <User size={18} className="text-slate-400" /> : <Sparkles size={18} className="text-slate-900" />}
              </div>
              
              <div className="space-y-4 flex-1 min-w-0">
                {msg.role === 'user' ? (
                  <div className="bg-blue-600/90 p-5 px-7 rounded-[2rem] text-white font-medium shadow-xl shadow-blue-500/10 max-w-fit ml-auto">
                    {msg.content}
                  </div>
                ) : (
                  <div className="glass-dark border border-slate-800/80 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="bg-slate-900/80 px-8 py-5 border-b border-slate-800/50 flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <h4 className="text-xl font-bold text-white leading-tight">{msg.topicName || 'Lennai Protocol'}</h4>
                        <span className="text-[9px] text-blue-400 font-black uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">{msg.subject || 'Clinical Science'}</span>
                      </div>
                      <div className="flex gap-2 p-1 bg-slate-950/50 rounded-xl border border-slate-800">
                        {['overview', 'slides', 'flashcards', 'quiz'].map(tabId => (
                          <button
                            key={tabId}
                            onClick={() => setActiveTabs(prev => ({ ...prev, [msg.id]: tabId }))}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                              (activeTabs[msg.id] || 'overview') === tabId 
                                ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {tabId}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-10 space-y-8 min-h-[200px]">
                      {(activeTabs[msg.id] || 'overview') === 'overview' && (
                        <div className="animate-fadeIn space-y-10">
                          <p className="text-xl text-slate-200 leading-relaxed font-medium">{msg.content}</p>
                          {msg.keyPoints && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {msg.keyPoints.map((p, i) => (
                                <div key={i} className="flex gap-4 p-5 bg-slate-900/50 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.6)]" /> 
                                  <span className="text-sm text-slate-300 font-medium">{p}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {(activeTabs[msg.id] || 'overview') === 'slides' && msg.slides && (
                        <div className="space-y-6 animate-fadeIn">
                          {msg.slides.map((s, idx) => (
                            <div key={idx} className="p-8 bg-slate-900/60 rounded-[2rem] border border-slate-800 shadow-xl group">
                              <h5 className="font-black text-white mb-4 text-lg border-l-4 border-blue-500 pl-4">{s.title}</h5>
                              <ul className="space-y-3">
                                {s.bullets.map((b, bidx) => (
                                  <li key={bidx} className="text-sm text-slate-400 flex gap-3">
                                    <span className="text-blue-500 font-black">•</span> {b}
                                  </li>
                                ))}
                              </ul>
                              {s.imageDescription && (
                                <div className="mt-8 pt-6 border-t border-slate-800/50 flex gap-3">
                                   <Layout size={14} className="text-slate-600 flex-shrink-0" />
                                   <p className="text-[10px] text-slate-500 italic leading-relaxed">{s.imageDescription}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {(activeTabs[msg.id] || 'overview') === 'flashcards' && msg.flashcards && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fadeIn">
                          {msg.flashcards.map((c, idx) => (
                            <div key={idx} className="h-40 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 flex items-center justify-center text-center hover:bg-slate-900/60 transition-all cursor-help border-dashed">
                              <p className="text-sm font-bold text-slate-300 leading-relaxed italic">"{c.front}"</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {(activeTabs[msg.id] || 'overview') === 'quiz' && msg.practiceQuestions && (
                        <div className="space-y-8 animate-fadeIn">
                           {msg.practiceQuestions.map((q, qidx) => (
                             <div key={q.id || qidx} className="p-8 bg-slate-950/50 border border-slate-800 rounded-[2rem]">
                               <p className="font-bold text-white mb-6 text-lg">{q.text}</p>
                               <div className="space-y-3">
                                 {q.options.map((opt, oidx) => (
                                   <div key={oidx} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-xs text-slate-400 flex justify-between items-center">
                                      {opt}
                                      {oidx === q.correctAnswer && <Info size={14} className="text-blue-500 opacity-50" />}
                                   </div>
                                 ))}
                               </div>
                               <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-slate-600 italic">
                                 {q.explanation}
                               </div>
                             </div>
                           ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start items-center gap-5 animate-pulse">
            <div className="w-10 h-10 rounded-2xl liquid-metal flex items-center justify-center shadow-lg">
              <Loader2 className="animate-spin text-slate-900" size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Lennai is syncing neural protocol...</p>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Persistence Input */}
      <div className="p-4 md:p-8 bg-slate-950/90 border-t border-slate-800/50 backdrop-blur-3xl relative z-30">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a diagnostic question (e.g. 'Arterial supply of the arm')..."
            className="flex-1 bg-slate-900/80 border border-slate-800 rounded-3xl py-5 px-8 text-white text-base focus:outline-none focus:border-blue-500/50 shadow-inner transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`p-5 rounded-[1.8rem] transition-all ${input.trim() ? 'liquid-metal text-slate-900 shadow-xl shadow-white/5 hover:scale-105' : 'text-slate-700 bg-slate-900 border border-slate-800 opacity-40'}`}
          >
            {isTyping ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorChat;