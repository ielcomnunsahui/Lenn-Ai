import React, { useState } from 'react';
import { Question, Material } from '../types.ts';
import { gemini } from '../services/geminiService.ts';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  BrainCircuit, 
  Trophy,
  Info
} from 'lucide-react';

interface PracticeQuizProps {
  materials: Material[];
}

const PracticeQuiz: React.FC<PracticeQuizProps> = ({ materials }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const startQuiz = async () => {
    if (materials.length === 0) return;
    setIsGenerating(true);
    try {
      // Map all topics to their parent material's subject to ensure we can provide the required context.
      const allTopicsWithSubject = materials.flatMap(m => 
        m.topics.map(t => ({ topic: t, subject: m.subject }))
      );
      
      if (allTopicsWithSubject.length === 0) {
        setIsGenerating(false);
        return;
      }

      const randomEntry = allTopicsWithSubject[Math.floor(Math.random() * allTopicsWithSubject.length)];
      // Fix: Provided the required 3rd argument 'subject' to generateQuestions call.
      const generated = await gemini.generateQuestions(randomEntry.topic.title, 'Exam-level', randomEntry.subject);
      setQuestions(generated);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setScore(0);
      setIsFinished(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    if (index === questions[currentIndex].correctAnswer) {
      setScore(s => s + 1);
    }
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isGenerating) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center p-8">
        <div className="relative">
          <div className="w-32 h-32 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin"></div>
          <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" size={48} />
        </div>
        <p className="mt-12 text-2xl font-bold text-white tracking-widest uppercase">Synthesizing Clinical Scenarios...</p>
        <p className="text-slate-500 mt-4 text-center max-w-sm">Generating adaptive questions based on your unique knowledge gaps.</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-12 glass-dark rounded-[3rem] border border-slate-800 shadow-2xl text-center">
        <div className="w-24 h-24 liquid-metal rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
          <Trophy size={48} className="text-slate-900" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">Assessment Finalized</h2>
        <p className="text-slate-500 mb-10 text-lg">Your diagnostic reasoning data has been integrated into your progress profile.</p>
        
        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="p-8 bg-slate-900/50 rounded-3xl border border-slate-800">
            <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-2">Final Accuracy</p>
            <p className="text-5xl font-black text-blue-400">{Math.round((score/questions.length)*100)}%</p>
          </div>
          <div className="p-8 bg-slate-900/50 rounded-3xl border border-slate-800">
            <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-2">Raw Data</p>
            <p className="text-5xl font-black text-emerald-500">{score}/{questions.length}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button 
            onClick={startQuiz}
            className="liquid-metal px-10 py-4 rounded-full font-black text-lg hover:scale-105 transition"
          >
            New Assessment
          </button>
          <button className="px-10 py-4 glass-dark text-slate-200 border border-slate-700 rounded-full font-black text-lg hover:bg-slate-800 transition">
            Review Rationale
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mt-16 p-12 glass-dark rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white mb-6">Adaptive Clinical Simulation</h2>
          <p className="text-slate-400 mb-12 text-lg leading-relaxed max-w-2xl">Validate your clinical judgement with NCLEX-style scenarios generated from your specific study materials.</p>
          <button 
            onClick={startQuiz}
            className="liquid-metal px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition flex items-center gap-4 group shadow-[0_0_40px_rgba(255,255,255,0.1)]"
          >
            Launch Quiz Engine <ArrowRight size={24} className="group-hover:translate-x-2 transition" />
          </button>
        </div>
        <BrainCircuit size={400} className="absolute -right-20 -bottom-20 text-blue-500/5 rotate-12" />
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">Protocol Step {currentIndex + 1} of {questions.length}</span>
          <h2 className="text-md font-bold text-slate-500 mt-4">Advanced Medical-Surgical Reasoning</h2>
        </div>
        <div className="w-48 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="h-full liquid-metal transition-all duration-500" 
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="glass-dark p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl mb-8">
        <p className="text-2xl font-bold text-white leading-relaxed mb-12">
          {currentQ.text}
        </p>

        <div className="space-y-5">
          {currentQ.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={selectedAnswer !== null}
              className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group ${
                selectedAnswer === null 
                  ? 'border-slate-800 bg-slate-900/30 hover:border-blue-500/50 hover:bg-slate-900/60' 
                  : idx === currentQ.correctAnswer
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                    : selectedAnswer === idx
                      ? 'border-red-500/50 bg-red-500/10 text-red-400'
                      : 'border-slate-900 bg-slate-950 opacity-40'
              }`}
            >
              <span className="font-bold text-lg">{option}</span>
              {selectedAnswer !== null && idx === currentQ.correctAnswer && <CheckCircle2 className="text-emerald-500" size={28} />}
              {selectedAnswer === idx && idx !== currentQ.correctAnswer && <XCircle className="text-red-500" size={28} />}
            </button>
          ))}
        </div>
      </div>

      {showExplanation && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="glass-dark p-10 rounded-[2.5rem] border border-slate-800/50 mb-8 bg-blue-900/5">
            <h4 className="font-black text-white mb-4 flex items-center gap-3 text-lg uppercase tracking-widest">
              <Info className="text-blue-500" size={24} />
              Educational Rationale
            </h4>
            <p className="text-slate-400 text-lg leading-relaxed font-medium">{currentQ.explanation}</p>
          </div>

          <button 
            onClick={nextQuestion}
            className="w-full liquid-metal py-6 rounded-2xl font-black text-xl shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.02] transition"
          >
            {currentIndex < questions.length - 1 ? 'Next Scenario' : 'Finalize Assessment'} <ArrowRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PracticeQuiz;