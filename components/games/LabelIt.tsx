import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, HelpCircle, Loader2 } from 'lucide-react';
import { LabeledPart } from '../../types.ts';

interface LabelItProps {
  data: { title: string; imageUrl: string; parts: LabeledPart[] };
  onComplete: (won: boolean) => void;
  onBack: () => void;
}

const LabelIt: React.FC<LabelItProps> = ({ data, onComplete, onBack }) => {
  const [selectedMatches, setSelectedMatches] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleMatch = (partId: string, label: string) => {
    if (isSubmitted) return;
    setSelectedMatches(prev => ({ ...prev, [partId]: label }));
  };

  const handleSubmit = () => {
    let correct = 0;
    data.parts.forEach(p => {
      if (selectedMatches[p.id] === p.label) correct++;
    });
    setScore(correct);
    setIsSubmitted(true);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 animate-fadeIn">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="p-3 bg-slate-900 rounded-2xl text-slate-500 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">{data.title}</h2>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">Match structures to their definitions</p>
        </div>
        <div className="w-12 h-12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-[2.5rem] blur opacity-10"></div>
            <img 
              src={data.imageUrl} 
              alt="Anatomical Illustration" 
              className="relative rounded-[2rem] border border-slate-800 w-full shadow-2xl" 
            />
          </div>
          
          <div className="p-6 glass-dark border border-slate-800 rounded-2xl">
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <HelpCircle size={12} /> Clinical Insight
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed italic">
              "Visual identification is the first step in surgical readiness. Study the structure's relationship to surrounding markers before matching."
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-l-4 border-blue-500 pl-4 mb-6">Structures to Identify</h3>
          <div className="space-y-4">
            {data.parts.map((part) => (
              <div key={part.id} className="p-6 glass-dark border border-slate-800/50 rounded-3xl space-y-4 group hover:border-slate-700 transition-all">
                <p className="text-slate-300 text-sm leading-relaxed">{part.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  {data.parts.map(p => {
                    const isSelected = selectedMatches[part.id] === p.label;
                    const isCorrect = isSubmitted && part.label === p.label;
                    const isWrongSelection = isSubmitted && isSelected && part.label !== p.label;

                    return (
                      <button
                        key={p.id}
                        onClick={() => handleMatch(part.id, p.label)}
                        disabled={isSubmitted}
                        className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-between ${
                          isSelected && !isSubmitted
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : isCorrect
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                              : isWrongSelection
                                ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                : 'bg-slate-900 border-slate-800 text-slate-600 hover:text-slate-400'
                        }`}
                      >
                        {p.label}
                        {isCorrect && <CheckCircle2 size={12} />}
                        {isWrongSelection && <XCircle size={12} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {!isSubmitted ? (
            <button 
              onClick={handleSubmit}
              disabled={Object.keys(selectedMatches).length < data.parts.length}
              className="w-full liquid-metal py-6 rounded-[2rem] font-black text-xl shadow-2xl hover:scale-[1.02] transition disabled:opacity-50"
            >
              Confirm All Labels
            </button>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-8 glass-dark border border-slate-800 rounded-[2rem] text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Final Score</p>
                <h3 className="text-3xl font-black text-white">{score} / {data.parts.length}</h3>
              </div>
              <button 
                onClick={() => onComplete(score === data.parts.length)}
                className="w-full bg-emerald-600 py-6 rounded-[2rem] font-black text-xl text-white shadow-2xl hover:bg-emerald-500 transition"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabelIt;