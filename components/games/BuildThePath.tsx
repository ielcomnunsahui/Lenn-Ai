
import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw, Layers } from 'lucide-react';
import { PathStep } from '../../types';

interface BuildThePathProps {
  data: { title: string; steps: PathStep[] };
  onComplete: (accuracy: number) => void;
  onBack: () => void;
}

const BuildThePath: React.FC<BuildThePathProps> = ({ data, onComplete, onBack }) => {
  const [currentSteps, setCurrentSteps] = useState<PathStep[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [accuracy, setAccuracy] = useState(0);

  useEffect(() => {
    // Shuffle steps initially
    setCurrentSteps([...data.steps].sort(() => Math.random() - 0.5));
  }, [data]);

  const handleMoveStep = (fromIndex: number, toIndex: number) => {
    if (isSubmitted) return;
    const newSteps = [...currentSteps];
    const [removed] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, removed);
    setCurrentSteps(newSteps);
  };

  const handleSubmit = () => {
    let correct = 0;
    currentSteps.forEach((step, idx) => {
      if (step.order === idx) correct++;
    });
    const result = Math.round((correct / data.steps.length) * 100);
    setAccuracy(result);
    setIsSubmitted(true);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10 animate-fadeIn">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="p-3 bg-slate-900 rounded-2xl text-slate-500 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">{data.title}</h2>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">Order the sequence correctly</p>
        </div>
        <div className="w-12 h-12" /> {/* Spacer */}
      </div>

      <div className="space-y-4">
        {currentSteps.map((step, idx) => (
          <div 
            key={step.id} 
            className={`flex items-center gap-6 p-6 glass-dark rounded-3xl border transition-all ${
              isSubmitted 
                ? step.order === idx 
                  ? 'border-emerald-500/50 bg-emerald-500/5' 
                  : 'border-red-500/50 bg-red-500/5'
                : 'border-slate-800'
            }`}
          >
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => handleMoveStep(idx, Math.max(0, idx - 1))}
                disabled={isSubmitted || idx === 0}
                className="p-1 hover:text-white text-slate-700 transition-colors disabled:opacity-0"
              >
                <RefreshCw size={14} className="rotate-90" />
              </button>
              <div className="w-10 h-10 liquid-metal rounded-xl flex items-center justify-center font-black text-slate-900">
                {idx + 1}
              </div>
              <button 
                onClick={() => handleMoveStep(idx, Math.min(currentSteps.length - 1, idx + 1))}
                disabled={isSubmitted || idx === currentSteps.length - 1}
                className="p-1 hover:text-white text-slate-700 transition-colors disabled:opacity-0"
              >
                <RefreshCw size={14} className="-rotate-90" />
              </button>
            </div>

            <div className="flex-1">
              <p className="text-xl font-bold text-slate-200">{step.text}</p>
            </div>

            {isSubmitted && (
              <div className="flex-shrink-0">
                {step.order === idx ? (
                  <CheckCircle2 className="text-emerald-500" size={32} />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <XCircle className="text-red-500" size={32} />
                    <span className="text-[10px] font-black text-slate-500">Correct: #{step.order + 1}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {!isSubmitted ? (
        <button 
          onClick={handleSubmit}
          className="w-full liquid-metal py-6 rounded-[2rem] font-black text-xl shadow-2xl hover:scale-[1.02] transition"
        >
          Check Logic Order
        </button>
      ) : (
        <div className="space-y-8 animate-fadeIn">
          <div className="p-10 glass-dark rounded-[2.5rem] border border-slate-800 text-center">
            <h3 className="text-4xl font-black text-white mb-2">{accuracy}% Accuracy</h3>
            <p className="text-slate-500 uppercase font-black tracking-widest text-xs">Sequence Analysis Complete</p>
          </div>
          <button 
            onClick={() => onComplete(accuracy)}
            className="w-full bg-blue-600 py-6 rounded-[2rem] font-black text-xl text-white shadow-2xl hover:bg-blue-500 transition"
          >
            Return to Games Hub
          </button>
        </div>
      )}
    </div>
  );
};

export default BuildThePath;
