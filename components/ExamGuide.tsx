
import React, { useState } from 'react';
import { Search, Loader2, FileText, Send, Sparkles, AlertCircle } from 'lucide-react';
import { gemini } from '../services/geminiService';

const ExamGuide: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [guide, setGuide] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateOutline = async () => {
    if (!topic.trim() || isGenerating) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await gemini.generateExamOutline(topic);
      setGuide(result);
    } catch (e) {
      console.error(e);
      setError("Unable to generate outline. Please try a different topic.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      <div className="mb-12">
        <h2 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <FileText className="text-blue-400" size={32} /> Exam Guide
        </h2>
        <p className="text-slate-500 text-lg">Master your answer structure. Generate high-yield exam outlines for any nursing topic.</p>
      </div>

      <div className="relative group max-w-2xl">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateOutline()}
            placeholder="Type an exam topic or question (e.g. 'Mechanism of Action of Heparin')..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl py-5 px-8 text-white text-lg focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600 shadow-xl"
          />
          <button
            onClick={generateOutline}
            disabled={!topic.trim() || isGenerating}
            className={`p-5 rounded-2xl transition-all ${
              topic.trim() && !isGenerating ? 'liquid-metal text-slate-900 shadow-xl hover:scale-105' : 'text-slate-700 bg-slate-800 opacity-50'
            }`}
          >
            {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-6 bg-red-500/10 text-red-400 rounded-3xl flex items-center gap-5 border border-red-500/20 animate-shake">
          <AlertCircle size={24} />
          <span className="font-bold">{error}</span>
        </div>
      )}

      {isGenerating && (
        <div className="flex flex-col items-center py-20 animate-pulse">
          <Sparkles className="text-blue-500 mb-4" size={48} />
          <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">Architecting Subject-Locked Outline...</p>
        </div>
      )}

      {guide && !isGenerating && (
        <div className="glass-dark p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between mb-8 border-b border-slate-800/50 pb-6">
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Subject Detected</p>
              <h3 className="text-2xl font-bold text-white">{guide.subject}</h3>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
              <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Protocol Compliant</span>
            </div>
          </div>

          <div className="mb-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Exam Question / Topic</p>
            <p className="text-lg text-slate-200 font-medium italic">"{guide.topic}"</p>
          </div>

          <div className="space-y-6">
            <h4 className="text-md font-black text-white uppercase tracking-[0.1em] border-l-4 border-blue-500 pl-4">Suggested Answer Outline</h4>
            <div className="grid grid-cols-1 gap-4">
              {guide.outlinePoints.map((point: string, i: number) => (
                <div key={i} className="flex gap-6 p-6 bg-slate-900/40 rounded-2xl border border-slate-800/50 group hover:border-slate-700 transition-colors">
                  <span className="flex-shrink-0 w-10 h-10 rounded-xl liquid-metal text-slate-900 flex items-center justify-center font-black">
                    {i + 1}
                  </span>
                  <p className="text-slate-300 font-bold text-lg self-center">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10">
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-2">Tutor Insight</p>
            <p className="text-xs text-slate-500 leading-relaxed italic">
              Use this structure to ensure logical flow and maximum clinical relevance marks. 
              Always prioritize patient safety and standard protocols in your management sections.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamGuide;
