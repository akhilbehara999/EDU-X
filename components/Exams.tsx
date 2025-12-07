import React, { useState, useEffect } from 'react';
import { generateExam, generateExamFeedback } from '../services/geminiService';
import { QuizQuestion } from '../types';
import { Award, Calendar, CheckCircle, Brain, Play, RotateCcw, AlertTriangle, Clock, Activity, Fingerprint, Share2, Download } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Exams: React.FC = () => {
  const { t, languageName } = useLanguage();
  const [view, setView] = useState<'select' | 'active' | 'result'>('select');
  const [examType, setExamType] = useState<'weekly' | 'monthly'>('weekly');
  const [subject, setSubject] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [loading, setLoading] = useState(false);
  const [resultFeedback, setResultFeedback] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [resultTab, setResultTab] = useState<'analysis' | 'certificate'>('analysis');

  // Suggested "Trending" topics for quick selection
  const trendingTopics = [
    "Python Basics", 
    "French Grammar", 
    "World War II", 
    "Organic Chemistry", 
    "Microeconomics"
  ];

  // Timer Logic
  useEffect(() => {
    let timer: any;
    if (view === 'active' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitExam(); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [view, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartExam = async () => {
    if (!subject.trim()) return;
    setLoading(true);
    
    // Generate exam
    const qs = await generateExam(subject, examType, languageName);
    setQuestions(qs);
    setAnswers({});
    setResultFeedback('');
    
    // Set Time based on exam type (10 mins for weekly, 25 for monthly)
    setTimeLeft(examType === 'weekly' ? 600 : 1500); 
    
    if (qs.length > 0) {
      setView('active');
    }
    setLoading(false);
  };

  const handleSubmitExam = async () => {
    setLoading(true);
    const feedback = await generateExamFeedback(questions, answers, subject, examType, languageName);
    setResultFeedback(feedback);
    
    // Default to certificate tab if they passed the monthly exam
    const score = questions.reduce((acc, q, idx) => acc + (answers[idx] === q.correctAnswer ? 1 : 0), 0);
    const percentage = Math.round((score / questions.length) * 100);
    
    if (percentage >= 75 && examType === 'monthly') {
        setResultTab('certificate');
    } else {
        setResultTab('analysis');
    }

    setView('result');
    setLoading(false);
  };

  const getScore = () => {
    return questions.reduce((acc, q, idx) => {
      return acc + (answers[idx] === q.correctAnswer ? 1 : 0);
    }, 0);
  };

  const renderSelect = () => (
    <div className="max-w-6xl mx-auto min-h-full flex flex-col justify-center py-10">
      <div className="text-center mb-10">
        <h2 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase">
          {t('exams.title')}
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">{t('exams.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Weekly Card */}
        <div 
          onClick={() => setExamType('weekly')}
          className={`cursor-pointer group relative overflow-hidden p-8 rounded-3xl border transition-all duration-300 ${
            examType === 'weekly' 
              ? 'bg-gradient-to-br from-blue-900/20 to-black border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]' 
              : 'bg-white/5 border-white/10 hover:border-blue-500/50 hover:bg-white/10'
          }`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={120} />
          </div>
          <div className="relative z-10">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${examType === 'weekly' ? 'bg-blue-500 text-white shadow-glow-sm' : 'bg-white/10 text-gray-400'}`}>
              <Calendar size={28} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{t('exams.weekly')}</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">{t('exams.weeklyDesc')}</p>
            <div className="flex gap-2 text-xs font-mono">
               <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">XP +150</span>
               <span className="bg-white/10 text-gray-400 px-3 py-1 rounded-full border border-white/10">10:00</span>
            </div>
          </div>
        </div>

        {/* Monthly Card */}
        <div 
          onClick={() => setExamType('monthly')}
          className={`cursor-pointer group relative overflow-hidden p-8 rounded-3xl border transition-all duration-300 ${
            examType === 'monthly' 
              ? 'bg-gradient-to-br from-amber-900/20 to-black border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]' 
              : 'bg-white/5 border-white/10 hover:border-amber-500/50 hover:bg-white/10'
          }`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Award size={120} />
          </div>
          <div className="relative z-10">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${examType === 'monthly' ? 'bg-amber-500 text-white shadow-glow-sm' : 'bg-white/10 text-gray-400'}`}>
              <Award size={28} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{t('exams.monthly')}</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">{t('exams.monthlyDesc')}</p>
            <div className="flex gap-2 text-xs font-mono">
               <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">CERTIFICATE</span>
               <span className="bg-white/10 text-gray-400 px-3 py-1 rounded-full border border-white/10">25:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="glass-card p-8 rounded-3xl border-white/10 max-w-2xl mx-auto w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-lava to-amber-500"></div>
        
        <label className="block text-xs font-mono text-gray-500 mb-3 tracking-widest">{t('exams.subjectLabel')}</label>
        <div className="flex gap-3 mb-6">
          <input 
            type="text" 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t('exams.subjectPlaceholder')}
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white text-lg focus:border-lava/50 outline-none placeholder-gray-600 transition-all"
          />
          <button 
            onClick={handleStartExam}
            disabled={loading || !subject}
            className="px-8 bg-white text-black font-bold rounded-xl shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100 flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full"/> : <><Play size={20}/> {t('exams.start')}</>}
          </button>
        </div>

        {/* Trending Pills */}
        <div>
          <span className="text-xs text-gray-500 font-mono mr-2">{t('exams.trending')}</span>
          <div className="inline-flex flex-wrap gap-2 mt-2">
            {trendingTopics.map((topicItem, idx) => (
              <button
                key={idx}
                onClick={() => setSubject(topicItem)}
                className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-300 transition-colors"
              >
                {topicItem}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderActive = () => (
    <div className="max-w-5xl mx-auto flex flex-col relative min-h-full">
      {/* HUD Header */}
      <div className="flex justify-between items-center mb-6 bg-black/40 p-4 rounded-2xl border border-white/10 backdrop-blur-md sticky top-0 z-30 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
             <span className={`w-2 h-2 rounded-full ${examType === 'monthly' ? 'bg-amber-500' : 'bg-blue-500'} shadow-glow`}></span>
             {subject}
          </h2>
          <div className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-wider">{examType} PROTOCOL</div>
        </div>
        
        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${timeLeft < 60 ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' : 'bg-white/5 border-white/10 text-lava'}`}>
           <Clock size={20} />
           <span className="text-2xl font-mono font-bold">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="space-y-6 pb-32">
        {questions.map((q, idx) => (
          <div key={idx} className="glass-card p-6 rounded-2xl border-white/5 hover:border-white/10 transition-colors group relative">
            <div className="absolute -left-3 top-6 w-6 h-6 rounded-full bg-obsidian border border-white/20 flex items-center justify-center text-xs font-bold text-gray-400 z-10 group-hover:border-lava group-hover:text-lava transition-colors">
               {idx + 1}
            </div>
            
            <div className="pl-6">
              <p className="text-lg text-white font-medium mb-4 leading-relaxed">{q.question}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => setAnswers({...answers, [idx]: opt})}
                    className={`text-left px-5 py-4 rounded-xl border transition-all duration-200 flex items-center justify-between group/btn ${
                      answers[idx] === opt 
                        ? 'bg-lava/10 border-lava text-white shadow-[0_0_10px_rgba(255,69,0,0.1)]' 
                        : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="text-sm">{opt}</span>
                    {answers[idx] === opt && <div className="w-2 h-2 rounded-full bg-lava shadow-glow"></div>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-6 left-0 right-0 max-w-5xl mx-auto px-4 pointer-events-none z-30">
        <div className="bg-obsidian/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex justify-between items-center shadow-2xl pointer-events-auto">
           <div className="text-sm text-gray-400 font-mono">
              STATUS: {Object.keys(answers).length} / {questions.length} ANSWERED
           </div>
           <button 
              onClick={handleSubmitExam}
              disabled={loading || Object.keys(answers).length !== questions.length}
              className="px-8 py-3 bg-white text-black font-bold rounded-xl shadow-glow hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
            >
              {loading ? t('exams.analyzing') : <>{t('exams.submit')} <CheckCircle size={18} /></>}
            </button>
        </div>
      </div>
    </div>
  );

  const renderResult = () => {
    const score = getScore();
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= (examType === 'monthly' ? 75 : 60);
    const canClaimCertificate = passed && examType === 'monthly';

    return (
      <div className="max-w-4xl mx-auto flex flex-col pb-20">
        {/* Header Summary */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 pt-10">
          <div className={`inline-flex items-center justify-center p-4 rounded-full border-2 mb-4 shadow-lg ${
             passed ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-red-500 bg-red-500/10 text-red-400'
          }`}>
             {passed ? <Award size={48} /> : <AlertTriangle size={48} />}
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {passed ? t('exams.moduleComplete') : t('exams.reviewRequired')}
          </h2>
          <p className="text-gray-400">{passed ? t('exams.passedMsg') : t('exams.failedMsg')}</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 gap-4 sticky top-4 z-20">
          <button 
            onClick={() => setResultTab('analysis')}
            className={`px-6 py-2 rounded-full text-sm font-bold border transition-all ${
              resultTab === 'analysis' 
                ? 'bg-white text-black border-white' 
                : 'bg-black/40 text-gray-500 border-gray-700 hover:text-white backdrop-blur-md'
            }`}
          >
            {t('exams.aiAnalysis')}
          </button>
          
          {canClaimCertificate && (
             <button 
                onClick={() => setResultTab('certificate')}
                className={`px-6 py-2 rounded-full text-sm font-bold border transition-all flex items-center gap-2 ${
                  resultTab === 'certificate' 
                    ? 'bg-amber-500 text-black border-amber-500 shadow-glow' 
                    : 'bg-black/40 text-amber-500 border-amber-500/30 hover:border-amber-500 backdrop-blur-md'
                }`}
              >
                <Award size={14} /> {t('exams.certificate')}
              </button>
          )}
        </div>

        {/* Content */}
        <div className="w-full">
          
          {/* Analysis View */}
          {resultTab === 'analysis' && (
            <div className="glass-card p-8 rounded-3xl border-white/10 animate-in fade-in zoom-in-95">
               <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                  <div className="text-5xl font-black text-white">{percentage}%</div>
                  <div className="h-10 w-[1px] bg-white/10"></div>
                  <div>
                    <div className="text-xs text-gray-500 font-mono uppercase">Total Score</div>
                    <div className="text-lg text-gray-300">{score} / {questions.length} Correct</div>
                  </div>
               </div>
               
               <div className="prose prose-invert prose-lg max-w-none">
                 <h3 className="text-lava font-mono text-sm uppercase mb-4 flex items-center gap-2">
                   <Brain size={16} /> AI Mentor Feedback
                 </h3>
                 <p className="whitespace-pre-wrap leading-relaxed text-gray-300">
                    {resultFeedback}
                 </p>
               </div>
            </div>
          )}

          {/* Certificate View */}
          {resultTab === 'certificate' && canClaimCertificate && (
             <div className="animate-in fade-in zoom-in-95">
                {/* The Certificate */}
                <div className="bg-[#0f0f0f] border-4 border-double border-amber-500/50 p-10 rounded-xl relative overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.1)] text-center max-w-3xl mx-auto">
                   {/* Decorative Corners */}
                   <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-amber-500 rounded-tl-xl"></div>
                   <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-amber-500 rounded-tr-xl"></div>
                   <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-amber-500 rounded-bl-xl"></div>
                   <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-amber-500 rounded-br-xl"></div>
                   
                   {/* Background Texture */}
                   <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
                      backgroundImage: 'radial-gradient(circle at center, #fbbf24 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                   }}></div>

                   <div className="relative z-10">
                      <div className="w-20 h-20 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500 mb-6">
                         <Award size={40} className="text-amber-500" />
                      </div>
                      
                      <h1 className="text-4xl md:text-5xl font-serif text-white mb-2 tracking-wide text-amber-500">{t('exams.certTitle')}</h1>
                      <div className="h-1 w-32 bg-amber-500 mx-auto mb-8"></div>
                      
                      <p className="text-gray-400 italic text-lg mb-6">{t('exams.certSubtitle')}</p>
                      
                      <h2 className="text-3xl font-bold text-white mb-8 border-b border-white/10 inline-block px-12 pb-2">
                         {subject}
                      </h2>
                      
                      <div className="grid grid-cols-2 gap-8 text-left max-w-md mx-auto mt-12">
                         <div>
                            <p className="text-xs text-amber-700 font-mono uppercase mb-1">{t('exams.certDate')}</p>
                            <p className="text-white font-mono">{new Date().toLocaleDateString()}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-xs text-amber-700 font-mono uppercase mb-1">{t('exams.certId')}</p>
                            <p className="text-white font-mono">EDUX-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                         </div>
                      </div>
                      
                      <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                         <div className="text-left">
                            <div className="text-2xl font-black italic text-gray-700">EDU X</div>
                            <div className="text-[10px] text-gray-600 tracking-widest">AI LEARNING OS</div>
                         </div>
                         <Fingerprint size={48} className="text-amber-900/40" />
                      </div>
                   </div>
                </div>

                <div className="flex justify-center gap-4 mt-8">
                   <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2 transition-colors">
                      <Download size={18} /> Download PDF
                   </button>
                   <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2 transition-colors">
                      <Share2 size={18} /> Share Credential
                   </button>
                </div>
             </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="fixed top-24 right-8 z-50">
           <button 
             onClick={() => {
                setView('select');
                setSubject('');
                setQuestions([]);
                setResultTab('analysis');
             }}
             className="p-3 bg-black/50 hover:bg-red-500/20 text-white rounded-full border border-white/10 hover:border-red-500/50 backdrop-blur-md transition-all shadow-xl"
             title={t('exams.returnMenu')}
           >
             <RotateCcw size={20} />
           </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full">
      {view === 'select' && renderSelect()}
      {view === 'active' && renderActive()}
      {view === 'result' && renderResult()}
    </div>
  );
};

export default Exams;