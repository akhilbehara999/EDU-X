
import React, { useState } from 'react';
import { generateQuiz, generateExamFeedback } from '../services/geminiService';
import { QuizQuestion } from '../types';
import { Trophy, CheckCircle, XCircle, Brain, Play, Sliders, Activity, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const QuizArena: React.FC = () => {
  const { t, languageName } = useLanguage();
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [finalAnalysis, setFinalAnalysis] = useState<string>('');

  const startQuiz = async () => {
    if (!topic) return;
    setLoading(true);
    setError(null);
    setQuizFinished(false);
    setScore(0);
    setCurrentQ(0);
    setAnswers({});
    setFinalAnalysis('');
    
    try {
        // Pass numQuestions to the service
        const generated = await generateQuiz(topic, languageName, numQuestions);
        if (generated && generated.length > 0) {
            setQuestions(generated);
        } else {
            setError("Unable to generate valid quiz questions. Please try a specific topic or simpler language.");
        }
    } catch (e) {
        setError("Connection error. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleAnswer = (option: string) => {
    setSelectedOption(option);
    setShowResult(true);
    setAnswers(prev => ({...prev, [currentQ]: option}));
    if (option === questions[currentQ].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = async () => {
    setShowResult(false);
    setSelectedOption(null);
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
    } else {
      await finishQuiz();
    }
  };

  const finishQuiz = async () => {
      setQuizFinished(true);
      setAnalyzing(true);
      // Generate AI analysis
      const analysis = await generateExamFeedback(questions, answers, topic, 'Quiz', languageName);
      setFinalAnalysis(analysis);
      setAnalyzing(false);
  };

  const resetQuiz = () => {
    setQuestions([]);
    setTopic('');
    setQuizFinished(false);
    setScore(0);
    setCurrentQ(0);
    setAnswers({});
    setShowResult(false);
  };

  if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
            <div className="glass-card w-full p-12 rounded-3xl border-orange-500/20 text-center animate-in fade-in zoom-in-95 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lava to-amber-500 animate-[pulse-slow_2s_infinite]"></div>
                
                <div className="relative mb-8 mx-auto w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-lava border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    <Brain size={40} className="text-white animate-pulse" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">Generating Neural Scenarios</h3>
                <p className="text-gray-400 font-mono text-sm">Synthesizing {numQuestions} questions on "{topic}"...</p>
                
                <div className="mt-8 flex gap-2 justify-center">
                    <div className="w-2 h-2 rounded-full bg-lava animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 rounded-full bg-lava animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 rounded-full bg-lava animate-bounce"></div>
                </div>
            </div>
        </div>
      );
  }

  if (quizFinished) {
    return (
      <div className="flex flex-col items-center min-h-full py-12 max-w-2xl mx-auto">
        <div className="glass-card w-full rounded-2xl p-8 text-center border-orange-500/20 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 my-auto">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-lava to-amber-500"></div>
            
            <Trophy size={64} className="text-amber-500 mb-4 mx-auto drop-shadow-[0_0_15px_rgba(255,191,0,0.5)]" />
            <h2 className="text-4xl font-bold text-white mb-2">{t('quiz.complete')}</h2>
            
            <div className="flex justify-center items-center gap-4 my-6">
                <div className="bg-white/5 px-6 py-3 rounded-xl border border-white/10">
                    <p className="text-xs text-gray-500 font-mono uppercase">Score</p>
                    <p className="text-3xl text-lava font-bold">{score} / {questions.length}</p>
                </div>
                <div className="bg-white/5 px-6 py-3 rounded-xl border border-white/10">
                    <p className="text-xs text-gray-500 font-mono uppercase">Accuracy</p>
                    <p className="text-3xl text-green-400 font-bold">{Math.round((score/questions.length)*100)}%</p>
                </div>
            </div>

            <div className="text-left bg-black/40 p-6 rounded-xl border border-white/10 mb-8">
                 <h3 className="text-lava font-mono text-sm uppercase mb-3 flex items-center gap-2">
                   <Brain size={16} /> AI Performance Analysis
                 </h3>
                 {analyzing ? (
                     <div className="flex items-center gap-2 text-gray-400">
                         <div className="w-4 h-4 border-2 border-lava border-t-transparent rounded-full animate-spin"></div>
                         Generating insights...
                     </div>
                 ) : (
                    <p className="text-gray-300 leading-relaxed text-sm">
                        {finalAnalysis}
                    </p>
                 )}
            </div>

            <button 
                onClick={resetQuiz}
                className="px-8 py-3 bg-white hover:bg-gray-200 text-black font-bold rounded-xl shadow-glow transition-all flex items-center gap-2 mx-auto"
            >
                <RotateCcw size={18} /> {t('quiz.return')}
            </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-10 md:mt-20">
        <div className="glass-card p-8 rounded-3xl border-orange-500/20 shadow-glow text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
             <Brain size={120} />
          </div>
          
          <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_20px_rgba(255,69,0,0.2)]">
            <Brain size={32} className="text-lava" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t('quiz.title')}</h2>
          <p className="text-gray-400 mb-8">{t('quiz.subtitle')}</p>
          
          <div className="space-y-6">
            <div className="text-left">
                <label className="text-xs text-gray-500 font-mono uppercase ml-1 mb-2 block">Topic</label>
                <input 
                type="text" 
                placeholder={t('quiz.topicPlaceholder')}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-lava/50 outline-none transition-colors"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                />
            </div>
            
            <div className="text-left">
                <label className="text-xs text-gray-500 font-mono uppercase ml-1 mb-2 block flex justify-between">
                    <span>Question Count</span>
                    <span className="text-lava">{numQuestions}</span>
                </label>
                <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex justify-between gap-2">
                    {[5, 10, 15, 20].map(count => (
                        <button
                            key={count}
                            onClick={() => setNumQuestions(count)}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                                numQuestions === count 
                                ? 'bg-white text-black shadow-glow-sm' 
                                : 'text-gray-500 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            {count}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-sm text-left">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <button 
              onClick={startQuiz}
              disabled={loading || !topic}
              className="w-full py-4 bg-gradient-to-r from-lava to-amber-600 text-white font-bold rounded-xl shadow-glow hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 mt-4"
            >
              <Play size={20}/> {t('quiz.generate')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="max-w-3xl mx-auto min-h-full flex flex-col py-12">
      <div className="glass-card p-8 rounded-3xl border-orange-500/20 relative my-auto">
        {/* Progress */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
          <div 
            className="h-full bg-gradient-to-r from-lava to-amber-500 transition-all duration-500 shadow-glow"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-xs text-gray-500 mb-6 font-mono mt-2">
          <span>{t('quiz.question')} {currentQ + 1}/{questions.length}</span>
          <span>{t('quiz.score')}: {score}</span>
        </div>

        <h3 className="text-2xl font-bold text-white mb-8 leading-snug">{q.question}</h3>

        <div className="space-y-3">
          {q.options && q.options.length > 0 ? (
            q.options.map((opt, idx) => {
                let btnClass = "w-full p-4 rounded-xl text-left border transition-all duration-200 flex justify-between items-center ";
                if (showResult) {
                if (opt === q.correctAnswer) btnClass += "bg-green-500/20 border-green-500 text-green-100";
                else if (opt === selectedOption) btnClass += "bg-red-500/20 border-red-500 text-red-100";
                else btnClass += "bg-white/5 border-white/5 opacity-50";
                } else {
                btnClass += "bg-white/5 border-white/10 hover:bg-white/10 hover:border-lava/50 text-gray-200";
                }

                return (
                <button 
                    key={idx}
                    onClick={() => !showResult && handleAnswer(opt)}
                    className={btnClass}
                    disabled={showResult}
                >
                    <span>{opt}</span>
                    {showResult && opt === q.correctAnswer && <CheckCircle size={20} className="text-green-400"/>}
                    {showResult && opt === selectedOption && opt !== q.correctAnswer && <XCircle size={20} className="text-red-400"/>}
                </button>
                )
            })
          ) : (
            <div className="text-red-400 p-4 border border-red-500/30 rounded-xl">
                Error: No options generated for this question.
                <button onClick={nextQuestion} className="ml-4 underline text-white">Skip Question</button>
            </div>
          )}
        </div>

        {showResult && (
          <div className="mt-6 p-4 bg-blue-900/10 border border-blue-500/30 rounded-xl animate-in fade-in slide-in-from-bottom-4">
            <p className="text-blue-200 text-sm"><span className="font-bold">{t('quiz.explanation')}</span> {q.explanation}</p>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={nextQuestion}
                className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                {currentQ === questions.length - 1 ? t('quiz.finish') : t('quiz.next')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizArena;
