
import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  X, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  Zap,
  Info,
  ShieldAlert,
  Layout,
  Layers,
  RefreshCcw
} from 'lucide-react';
import { gemini } from '../services/geminiService';

const MaterialLab: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<{ file: File, preview?: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
  const [visualUrl, setVisualUrl] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setSelectedFile({ file, preview: ev.target?.result as string });
      reader.readAsDataURL(file);
    } else {
      setSelectedFile({ file });
    }
    setAnalysis(null);
    setVisualUrl(null);
    setQuizAnswers({});
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const startAnalysis = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    setError(null);

    try {
      const fileData = {
        mimeType: selectedFile.file.type,
        data: await fileToBase64(selectedFile.file)
      };

      const result = await gemini.analyzeMaterial(fileData);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
      setError("I’m having trouble reading this file. Please ensure it's a valid medical document.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleFlip = (cardId: string) => {
    setFlippedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const generateVisual = async () => {
    if (!analysis) return;
    setIsGeneratingVisual(true);
    try {
      const url = await gemini.generateVisual(analysis.visualGuide || analysis.topicTitle);
      setVisualUrl(url);
    } finally {
      setIsGeneratingVisual(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Upload className="text-blue-400" size={32} /> Material Lab
          </h2>
          <p className="text-slate-500 text-lg">Document analysis & Study Aid synthesis.</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-2xl">
          <ShieldAlert size={16} className="text-blue-400" />
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Context Lockdown</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-dark p-8 rounded-[2.5rem] border border-slate-800 border-dashed hover:border-blue-500/50 transition-all flex flex-col items-center justify-center text-center group cursor-pointer h-64"
               onClick={() => fileInputRef.current?.click()}>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileSelect} />
            
            {!selectedFile ? (
              <>
                <div className="w-16 h-16 bg-blue-500/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="text-blue-500/40" size={32} />
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Drop PDF or Image</p>
                <p className="text-[10px] text-slate-600 mt-2">Maximum reliability analysis</p>
              </>
            ) : (
              <div className="w-full h-full flex flex-col">
                {selectedFile.preview ? (
                  <img src={selectedFile.preview} className="w-full h-32 object-cover rounded-2xl mb-4" />
                ) : (
                  <div className="w-full h-32 bg-slate-900 rounded-2xl flex items-center justify-center mb-4">
                    <FileText size={48} className="text-blue-500" />
                  </div>
                )}
                <p className="text-xs font-black text-white truncate px-4">{selectedFile.file.name}</p>
                <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setAnalysis(null); }} className="mt-auto text-[10px] text-red-500 uppercase font-black hover:text-red-400">Remove File</button>
              </div>
            )}
          </div>

          <button 
            onClick={startAnalysis}
            disabled={!selectedFile || isAnalyzing}
            className="w-full liquid-metal py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
            {isAnalyzing ? 'Decoding Material...' : 'Initialize Analysis'}
          </button>

          {analysis && (
            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl">
              <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <CheckCircle2 size={14} /> Subject: {analysis.subject}
              </h4>
              <p className="text-xs text-slate-400 italic">Material study aids generated successfully.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {!analysis && !isAnalyzing && (
            <div className="h-full flex flex-col items-center justify-center py-20 bg-slate-950/20 rounded-[3rem] border border-slate-900 border-dashed min-h-[500px]">
              <Sparkles className="text-slate-800 mb-6" size={48} />
              <p className="text-slate-600 font-bold uppercase tracking-widest text-sm">Standby</p>
              <p className="text-slate-700 text-xs mt-2 italic">Awaiting document input for synthesis</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="h-full flex flex-col items-center justify-center py-20 min-h-[500px]">
              <Loader2 className="animate-spin text-blue-500 mb-6" size={64} />
              <p className="text-white font-black uppercase tracking-[0.3em] text-xs animate-pulse">Generating Slides & Flashcards...</p>
            </div>
          )}

          {analysis && (
            <div className="space-y-12 animate-fadeIn pb-20">
              <div className="glass-dark p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl">
                <div className="flex justify-between items-start mb-10 border-b border-slate-800/50 pb-8">
                  <div>
                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-2">Topic Overview</p>
                    <h3 className="text-4xl font-bold text-white leading-tight">{analysis.topicTitle}</h3>
                  </div>
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full border border-blue-500/20 font-black uppercase tracking-widest">{analysis.subject}</span>
                </div>

                <div className="space-y-12">
                  <section>
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Core Explanation</h5>
                    <p className="text-xl text-slate-200 leading-relaxed font-medium">{analysis.simpleExplanation}</p>
                  </section>

                  {/* Slides Section */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-2">
                      <Layout className="text-blue-500" size={20} />
                      <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Educational Slides</h5>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      {analysis.slides?.map((slide: any, sIdx: number) => (
                        <div key={sIdx} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-4">
                          <h6 className="text-lg font-bold text-white border-l-4 border-blue-500 pl-4">{slide.title}</h6>
                          <ul className="space-y-2">
                            {slide.bullets.map((b: string, bIdx: number) => (
                              <li key={bIdx} className="flex gap-3 text-sm text-slate-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" /> {b}
                              </li>
                            ))}
                          </ul>
                          <div className="pt-4 mt-4 border-t border-slate-800 flex items-start gap-2">
                            <ImageIcon size={12} className="text-slate-700 mt-0.5" />
                            <p className="text-[10px] text-slate-600 italic leading-relaxed">{slide.imageDescription}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Flashcards Section */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-2">
                      <Layers className="text-emerald-500" size={20} />
                      <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">NCLEX Flashcards</h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.flashcards?.map((card: any, cIdx: number) => {
                        const cardId = `mat-card-${cIdx}`;
                        const isFlipped = flippedCards[cardId];
                        return (
                          <div 
                            key={cIdx} 
                            onClick={() => toggleFlip(cardId)}
                            className="h-48 perspective cursor-pointer"
                          >
                            <div className={`relative w-full h-full transition-all duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                              <div className="absolute inset-0 backface-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                                <p className="text-xs font-bold text-white">{card.front}</p>
                                <span className="mt-4 text-[8px] text-slate-600 uppercase font-black flex items-center gap-1"><RefreshCcw size={8}/> Flip</span>
                              </div>
                              <div className="absolute inset-0 backface-hidden bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center rotate-y-180">
                                <p className="text-xs font-bold text-slate-200">{card.back}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="pt-10 border-t border-slate-800 space-y-8">
                    <h5 className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Clinical Quiz</h5>
                    {analysis.practiceQuestions.map((q: any, qIdx: number) => (
                      <div key={q.id} className="p-8 bg-slate-950/60 rounded-[2.5rem] border border-slate-800">
                        <p className="font-bold text-white mb-8 leading-relaxed text-xl">{q.text}</p>
                        <div className="space-y-4">
                          {q.options.map((opt: string, oIdx: number) => {
                            const showResult = quizAnswers[q.id] !== undefined;
                            const isCorrect = oIdx === q.correctAnswer;
                            const isSelected = quizAnswers[q.id] === oIdx;

                            return (
                              <button
                                key={oIdx}
                                onClick={() => !showResult && setQuizAnswers(prev => ({...prev, [q.id]: oIdx}))}
                                className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center justify-between ${
                                  !showResult 
                                    ? 'bg-slate-900 border-slate-800 hover:border-slate-600' 
                                    : isCorrect 
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' 
                                      : isSelected 
                                        ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                                        : 'opacity-40 border-transparent'
                                }`}
                              >
                                <span className="text-sm font-medium">{opt}</span>
                                {showResult && isCorrect && <CheckCircle2 size={20} />}
                              </button>
                            );
                          })}
                        </div>
                        {quizAnswers[q.id] !== undefined && (
                          <div className="mt-8 pt-6 border-t border-slate-800 flex gap-4 text-[11px] text-slate-500 italic">
                            <Info size={18} className="text-blue-500 flex-shrink-0" />
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </section>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .perspective { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default MaterialLab;
