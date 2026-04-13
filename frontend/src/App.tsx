import React, { useState } from 'react';
import { UploadCloud, BookOpen, Hexagon, Terminal, Loader2, Database, BrainCircuit, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function App() {
  const [activeTab, setActiveTab] = useState<'study' | 'flashcards' | 'quiz'>('study');
  const [documentContent, setDocumentContent] = useState<string>('');
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Flashcards state
  const [flashcards, setFlashcards] = useState<{front: string, back: string, isFlipped?: boolean}[]>([]);
  const [cardIndex, setCardIndex] = useState(0);

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<{question: string, options: string[], answerIndex: number}[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        setDocumentContent(`# SYSTEM ALERT: \n\nDocument **${file.name}** ingested. Neural vector embeddings computed and stored in local Endee datastore Core-ID 77.\n\n_Awaiting query protocols..._`);
      }, 1500);
    }
  };

  const handleGenerateStudyGuide = async () => {
    if (!input.trim()) return;
    const currentInput = input;
    setInput('');
    setIsGenerating(true);
    setDocumentContent('');
    
    try {
      const res = await fetch('http://localhost:8081/api/study/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: currentInput })
      });
      const data = await res.json();
      setDocumentContent(data.answer);
    } catch (err) {
      setDocumentContent('# [ERROR]: Link to primary generator node failed.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateFlashcardsHandler = async () => {
      setIsGenerating(true);
      try {
        const res = await fetch('http://localhost:8081/api/study/flashcards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: documentContent.substring(0, 50) || "general" })
        });
        const data = await res.json();
        setFlashcards(data);
        setActiveTab('flashcards');
        setCardIndex(0);
      } catch (err) {
        console.error(err);
      } finally {
        setIsGenerating(false);
      }
  }

  const generateQuizHandler = async () => {
    setIsGenerating(true);
    setQuizAnswers({});
    setQuizScore(null);
    try {
      const res = await fetch('http://localhost:8081/api/study/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: documentContent.substring(0, 50) || "general" })
      });
      const data = await res.json();
      setQuizQuestions(data);
      setActiveTab('quiz');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }

  const handleQuizSubmit = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.answerIndex) score++;
    });
    setQuizScore(score);
  }

  return (
    <div className="min-h-screen flex flex-col font-mono relative overflow-hidden bg-[#050510] text-[#00ffcc]">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 z-0 opacity-10" 
           style={{ backgroundImage: 'linear-gradient(#00ffcc 1px, transparent 1px), linear-gradient(90deg, #00ffcc 1px, transparent 1px)', backgroundSize: '40px 40px', transform: 'perspective(500px) rotateX(60deg) scale(2.5)', transformOrigin: 'top center' }}>
      </div>

      <header className="w-full p-5 border-b border-[#00ffcc]/30 flex justify-between items-center z-10 bg-black/60 backdrop-blur-md">
        <div className="flex items-center gap-3 border border-[#00ffcc]/40 p-2 pr-6 rounded-sm bg-[#00ffcc]/5 shadow-[0_0_15px_rgba(0,255,204,0.15)]">
          <Hexagon className="text-[#00ffcc]" size={24} />
          <h1 className="text-xl font-bold tracking-widest uppercase">Nexus<span className="text-white">Learn</span> DB</h1>
        </div>
        
        <label className="cursor-pointer group flex items-center gap-3 bg-[#0a1520] hover:bg-[#00ffcc]/10 transition-colors px-6 py-2 border border-[#00ffcc]/40 rounded-sm hover:shadow-[0_0_10px_rgba(0,255,204,0.3)]">
          {isUploading ? <Loader2 className="animate-spin text-[#00ffcc]" size={18} /> : <Database className="text-[#00ffcc]" size={18} />}
          <span className="text-sm font-semibold tracking-wider text-white group-hover:text-[#00ffcc] uppercase">Ingest Data</span>
          <input type="file" className="hidden" onChange={handleFileUpload} />
        </label>
      </header>

      <main className="flex-1 flex w-full max-w-7xl mx-auto p-6 gap-6 z-10 h-[calc(100vh-88px)]">
        
        {/* HUD Sidebar */}
        <aside className="w-64 flex flex-col gap-4 border-r border-[#00ffcc]/20 pr-6">
          <div className="text-[10px] text-[#00ffcc]/70 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
             <Terminal size={12}/> Control Panels
          </div>
          <button 
            onClick={() => setActiveTab('study')}
            className={`flex items-center gap-3 w-full text-left p-3 border rounded-sm transition-all uppercase tracking-wide text-xs ${activeTab === 'study' ? 'border-[#00ffcc] bg-[#00ffcc]/10 text-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.2)]' : 'border-[#00ffcc]/20 text-white/70 hover:border-[#00ffcc]/50 hover:text-white'}`}>
            <Terminal size={16} />
            Study Console
          </button>
          <button 
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-3 w-full text-left p-3 border rounded-sm transition-all uppercase tracking-wide text-xs ${activeTab === 'flashcards' ? 'border-[#00ffcc] bg-[#00ffcc]/10 text-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.2)]' : 'border-[#00ffcc]/20 text-white/70 hover:border-[#00ffcc]/50 hover:text-white'}`}>
            <BookOpen size={16} />
            Memory Matrix
          </button>
          <button 
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-3 w-full text-left p-3 border rounded-sm transition-all uppercase tracking-wide text-xs ${activeTab === 'quiz' ? 'border-[#00ffcc] bg-[#00ffcc]/10 text-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.2)]' : 'border-[#00ffcc]/20 text-white/70 hover:border-[#00ffcc]/50 hover:text-white'}`}>
            <BrainCircuit size={16} />
            Simulation Test
          </button>
        </aside>

        {/* HUD Content Area */}
        <section className="flex-1 bg-black/40 border border-[#00ffcc]/30 rounded-sm backdrop-blur-xl flex flex-col overflow-hidden relative shadow-[0_0_30px_rgba(0,255,204,0.05)]">
          
          <AnimatePresence mode="wait">
            {activeTab === 'study' && (
              <motion.div 
                key="study"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-full absolute inset-0"
              >
                {/* HUD Header Input */}
                <div className="p-6 border-b border-[#00ffcc]/20 bg-[#00ffcc]/5">
                  <div className="text-xs uppercase tracking-widest text-[#00ffcc]/60 mb-3">Execute Query Request</div>
                  <div className="flex items-center border border-[#00ffcc]/50 bg-black/50 p-2 shadow-[inset_0_0_10px_rgba(0,255,204,0.1)]">
                    <span className="text-[#00ffcc] ml-2 mr-3 font-bold">&gt;</span>
                    <input 
                      type="text" 
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleGenerateStudyGuide()}
                      placeholder="E.g., Generate a comprehensive guide on DBMS..."
                      className="w-full bg-transparent outline-none text-white placeholder:text-white/30 text-sm font-sans"
                    />
                    <button 
                      onClick={handleGenerateStudyGuide}
                      className="ml-4 px-4 py-2 border border-[#00ffcc] bg-[#00ffcc]/10 text-[#00ffcc] hover:bg-[#00ffcc] hover:text-black uppercase text-xs font-bold transition-all tracking-wider">
                      Execute
                    </button>
                  </div>
                </div>

                {/* Markdown Display Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#00ffcc]/60 gap-4">
                      <div className="w-16 h-16 border-4 border-t-[#00ffcc] border-[#00ffcc]/20 rounded-full animate-spin"></div>
                      <span className="uppercase tracking-[0.2em] animate-pulse text-xs">Synthesizing Neuro-Data...</span>
                    </div>
                  ) : documentContent ? (
                    <div className="prose prose-invert max-w-none prose-pre:bg-black/50 prose-pre:border prose-pre:border-[#00ffcc]/30 prose-a:text-[#00ffcc] hover:prose-a:text-white prose-th:bg-[#00ffcc]/10 prose-th:px-4 prose-th:py-2 prose-td:px-4 prose-td:py-2 prose-tr:border-b prose-tr:border-[#00ffcc]/20 prose-table:border prose-table:border-[#00ffcc]/30">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {documentContent}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/20 uppercase tracking-widest text-sm">
                      Awaiting Input Query...
                    </div>
                  )}
                </div>
                
                {documentContent && !isGenerating && (
                  <div className="p-4 border-t border-[#00ffcc]/20 bg-black/40 flex justify-end gap-3">
                      <button onClick={generateFlashcardsHandler} className="text-[10px] uppercase tracking-widest flex items-center gap-2 border border-[#00ffcc]/50 px-4 py-2 bg-[#00ffcc]/5 hover:bg-[#00ffcc]/20 text-[#00ffcc] transition-colors">
                        Build Flashcards <BookOpen size={12}/>
                      </button>
                      <button onClick={generateQuizHandler} className="text-[10px] uppercase tracking-widest flex items-center gap-2 border border-[#00ffcc] px-4 py-2 bg-[#00ffcc] hover:bg-[#00ffcc]/80 text-black font-bold transition-colors shadow-[0_0_10px_rgba(0,255,204,0.4)]">
                        Launch Simulation Test <BrainCircuit size={12}/>
                      </button>
                  </div>
                )}
              </motion.div>
            )}

// ... removed the explicit line requirement and writing the inner flashcards section directly

            {activeTab === 'flashcards' && (
              <motion.div 
                key="flashcards"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-full absolute inset-0 items-center justify-center p-6"
              >
                {flashcards.length > 0 ? (
                  <>
                    <div className="w-full max-w-2xl aspect-[16/9] perspective-1000 mb-8 relative">
                      <motion.div 
                        className="w-full h-full relative cursor-pointer transform-style-3d transition-transform duration-500"
                        animate={{ rotateX: flashcards[cardIndex].isFlipped ? 180 : 0 }}
                        onClick={() => {
                           const newCards = [...flashcards];
                           newCards[cardIndex] = { ...newCards[cardIndex], isFlipped: !newCards[cardIndex].isFlipped };
                           setFlashcards(newCards);
                        }}
                      >
                        {/* Front Side */}
                        <div className="absolute inset-0 bg-black/80 border-2 border-[#00ffcc] shadow-[0_0_30px_rgba(0,255,204,0.15)] flex flex-col items-center justify-center p-12 text-center text-xl text-white backface-hidden">
                          <span className="text-xs font-bold text-[#00ffcc] uppercase tracking-[0.3em] absolute top-6 flex items-center gap-2 opacity-60">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> Side A : Subject
                          </span>
                          <p className="font-sans font-medium">{flashcards[cardIndex].front}</p>
                          <div className="absolute bottom-6 opacity-60">
                            <span className="text-[#00ffcc] text-xs uppercase tracking-widest animate-pulse">Tap block to decrypt</span>
                          </div>
                        </div>
                        
                        {/* Back Side */}
                        <div className="absolute inset-0 bg-[#00ffcc]/10 backdrop-blur-md border-2 border-[#00ffcc] flex flex-col items-center justify-center p-12 text-center text-lg text-white backface-hidden" style={{ transform: 'rotateX(180deg)' }}>
                           <span className="text-[10px] font-bold text-[#00ffcc] uppercase tracking-[0.3em] absolute top-6 border-b border-[#00ffcc]/30 pb-1">
                            Decrypted Answer
                          </span>
                          <p className="font-sans drop-shadow-[0_0_8px_black]">{flashcards[cardIndex].back}</p>
                        </div>
                      </motion.div>
                    </div>
                    
                    <div className="flex gap-6 items-center">
                      <button 
                        onClick={() => {
                          if (flashcards[cardIndex].isFlipped) {
                              const newCards = [...flashcards];
                              newCards[cardIndex].isFlipped = false;
                              setFlashcards(newCards);
                              setTimeout(() => setCardIndex(prev => Math.max(0, prev - 1)), 250);
                          } else {
                              setCardIndex(prev => Math.max(0, prev - 1));
                          }
                        }}
                        disabled={cardIndex === 0}
                        className="px-6 py-2 border border-[#00ffcc]/50 text-[#00ffcc] hover:bg-[#00ffcc]/10 transition-all disabled:opacity-30 disabled:hover:bg-transparent uppercase tracking-wider text-xs">
                        &lt;&lt; SYS.PREV
                      </button>
                      <span className="text-[#00ffcc]/50 font-mono">{cardIndex + 1} / {flashcards.length}</span>
                      <button 
                         onClick={() => {
                          if (flashcards[cardIndex].isFlipped) {
                              const newCards = [...flashcards];
                              newCards[cardIndex].isFlipped = false;
                              setFlashcards(newCards);
                              setTimeout(() => setCardIndex(prev => Math.min(flashcards.length - 1, prev + 1)), 250);
                          } else {
                              setCardIndex(prev => Math.min(flashcards.length - 1, prev + 1));
                          }
                         }}
                         disabled={cardIndex === flashcards.length - 1}
                         className="px-6 py-2 border border-[#00ffcc]/50 text-[#00ffcc] hover:bg-[#00ffcc]/10 transition-all disabled:opacity-30 disabled:hover:bg-transparent uppercase tracking-wider text-xs">
                        SYS.NEXT &gt;&gt;
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-[#00ffcc]/50 uppercase tracking-widest text-sm animate-pulse flex flex-col items-center gap-4">
                     <Database size={32} className="opacity-20"/>
                     No memory constructs detected.
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-full absolute inset-0 p-8"
              >
                {quizQuestions.length > 0 ? (
                  <div className="h-full flex flex-col max-w-4xl mx-auto w-full">
                    <div className="flex justify-between items-end border-b border-[#00ffcc]/20 pb-4 mb-6">
                       <h2 className="text-xl font-bold uppercase tracking-widest text-white">Nexus Knowledge Simulation</h2>
                       {quizScore !== null && (
                         <div className="text-[#00ffcc] border border-[#00ffcc] px-4 py-1 text-sm bg-[#00ffcc]/10">
                            SCORE: {quizScore} / {quizQuestions.length}
                         </div>
                       )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-8 pr-4">
                      {quizQuestions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-black/50 border border-[#00ffcc]/20 p-6 relative">
                          <span className="absolute top-0 right-0 bg-[#00ffcc]/20 text-[#00ffcc] px-3 py-1 text-xs">#{qIndex + 1}</span>
                          <h3 className="text-lg text-white font-sans mb-6 w-[90%]">{q.question}</h3>
                          
                          <div className="flex flex-col gap-3">
                            {q.options.map((opt, oIndex) => {
                               const isSelected = quizAnswers[qIndex] === oIndex;
                               const isSubmitted = quizScore !== null;
                               const isCorrect = isSubmitted && q.answerIndex === oIndex;
                               const isWrongSelection = isSubmitted && isSelected && q.answerIndex !== oIndex;
                               
                               let btnClasses = "text-left p-4 border text-sm font-sans transition-all flex justify-between items-center ";
                               if (isSubmitted) {
                                  if (isCorrect) btnClasses += "border-green-500 bg-green-500/20 text-green-300 ";
                                  else if (isWrongSelection) btnClasses += "border-red-500 bg-red-500/20 text-red-300 ";
                                  else btnClasses += "border-white/10 text-white/50 ";
                               } else {
                                  btnClasses += isSelected ? "border-[#00ffcc] bg-[#00ffcc]/20 text-[#00ffcc]" : "border-white/20 text-white/80 hover:border-[#00ffcc]/50";
                               }

                               return (
                                 <button 
                                   key={oIndex} 
                                   disabled={isSubmitted}
                                   onClick={() => setQuizAnswers(prev => ({...prev, [qIndex]: oIndex}))}
                                   className={btnClasses}
                                 >
                                    <span>{opt}</span>
                                    {isSubmitted && isCorrect && <CheckCircle size={16} className="text-green-500"/>}
                                    {isSubmitted && isWrongSelection && <XCircle size={16} className="text-red-500"/>}
                                 </button>
                               )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex justify-end">
                      {quizScore === null ? (
                        <button 
                          onClick={handleQuizSubmit}
                          disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                          className="px-8 py-3 bg-[#00ffcc] text-black font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:bg-[#00ffcc]/30 disabled:text-white/30"
                        >
                          Execute Analysis (Submit)
                        </button>
                      ) : (
                        <button 
                          onClick={generateQuizHandler}
                          className="px-8 py-3 border border-[#00ffcc] text-[#00ffcc] hover:bg-[#00ffcc]/20 uppercase tracking-widest transition-colors"
                        >
                          Re-Initialize Test
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-[#00ffcc]/50 uppercase tracking-widest text-sm animate-pulse flex-col gap-4">
                     <BrainCircuit size={32} className="opacity-20"/>
                     No active simulation loaded.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

export default App;
