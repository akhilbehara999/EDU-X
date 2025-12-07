
import React, { useState, useEffect, useRef } from 'react';
import { translateAdvanced, speakText, startLiveSession } from '../services/geminiService';
import { LANGUAGES } from '../constants';
import { TranslationResult } from '../types';
import { useLanguage } from '../LanguageContext';
import { 
  ArrowRightLeft, 
  Sparkles, 
  Copy, 
  Check, 
  Volume2, 
  ClipboardPaste, 
  Eraser,
  Lightbulb,
  ArrowRight,
  Loader2,
  Mic,
  MicOff,
  Radio,
  Activity,
  MessageSquare
} from 'lucide-react';

type Tone = 'Standard' | 'Formal' | 'Casual';
type Mode = 'neural' | 'live';
type TranscriptItem = { text: string; type: 'input' | 'output'; timestamp: Date };

const Translator: React.FC = () => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>('neural');
  
  // Neural Translator State
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [targetLang, setTargetLang] = useState('hi');
  const [tone, setTone] = useState<Tone>('Standard');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Live Translator State
  const [liveSourceLang, setLiveSourceLang] = useState('en');
  const [liveTargetLang, setLiveTargetLang] = useState('hi');
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const cleanupRef = useRef<(() => void) | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Cleanup on unmount or mode switch
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [mode]);

  // --- Neural Functions ---
  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    
    const targetLangName = LANGUAGES.find(l => l.code === targetLang)?.name || 'English';
    const translationResult = await translateAdvanced(inputText, targetLangName, tone);
    
    setResult(translationResult);
    setIsLoading(false);
  };

  const copyToClipboard = () => {
    if (!result?.translatedText) return;
    navigator.clipboard.writeText(result.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
    } catch (err) {
      console.error('Failed to read clipboard', err);
      alert("Unable to access clipboard automatically. Please press Ctrl+V (or Cmd+V) to paste.");
    }
  };

  const handleSpeak = async (text: string) => {
    if (!text || isSpeaking) return;
    setIsSpeaking(true);
    const langName = LANGUAGES.find(l => l.code === targetLang)?.name || 'English';
    await speakText(text, langName);
    setIsSpeaking(false);
  };

  // --- Live Functions ---
  const toggleLiveSession = async () => {
    if (isLiveActive) {
        // Stop Session
        if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
        }
        setIsLiveActive(false);
    } else {
        // Start Session
        setTranscript([]);
        const sourceName = LANGUAGES.find(l => l.code === liveSourceLang)?.name || 'English';
        const targetName = LANGUAGES.find(l => l.code === liveTargetLang)?.name || 'Hindi';
        
        setIsLiveActive(true);
        
        try {
            const cleanup = await startLiveSession(
                sourceName,
                targetName,
                (text, type) => {
                    setTranscript(prev => [...prev, { text, type, timestamp: new Date() }]);
                },
                (err) => {
                    console.error("Live Error", err);
                    setIsLiveActive(false);
                    alert("Connection interrupted. Please try again.");
                }
            );
            cleanupRef.current = cleanup;
        } catch (e) {
            console.error("Failed to start live session", e);
            setIsLiveActive(false);
        }
    }
  };


  // --- Render ---

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* Mode Toggle */}
      <div className="flex justify-center">
         <div className="bg-black/40 p-1.5 rounded-full border border-white/10 inline-flex shadow-lg backdrop-blur-md">
            <button
                onClick={() => { setMode('neural'); if(isLiveActive) toggleLiveSession(); }}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                    mode === 'neural' 
                    ? 'bg-white/10 text-white shadow-glow-sm border border-white/10' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
            >
                <Sparkles size={16} /> Neural Translator
            </button>
            <button
                onClick={() => setMode('live')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                    mode === 'live' 
                    ? 'bg-white/10 text-white shadow-glow-sm border border-white/10' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
            >
                <Radio size={16} /> Real-time Voice
            </button>
         </div>
      </div>

      {/* NEURAL TRANSLATOR VIEW */}
      {mode === 'neural' && (
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full h-full overflow-y-auto custom-scrollbar pb-10 animate-in fade-in slide-in-from-left-4">
            {/* Control Bar */}
            <div className="glass-card p-2 rounded-2xl border-white/10 mb-6 flex flex-wrap gap-2 items-center justify-between">
                <div className="flex gap-1 bg-black/40 p-1 rounded-xl overflow-x-auto">
                    {(['Standard', 'Formal', 'Casual'] as Tone[]).map((tOption) => (
                        <button
                            key={tOption}
                            onClick={() => setTone(tOption)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                tone === tOption 
                                ? 'bg-white/10 text-white shadow-glow-sm border border-white/20' 
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                            }`}
                        >
                            {t(`translator.tones.${tOption.toLowerCase()}`)}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 bg-black/40 p-1 pr-4 rounded-xl border border-white/5">
                    <div className="px-4 py-2 text-sm text-gray-400 font-mono border-r border-white/10">
                        {t('translator.autoDetect')}
                    </div>
                    <ArrowRight size={16} className="text-gray-600" />
                    <select
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="bg-transparent text-lava font-bold outline-none cursor-pointer"
                    >
                        {LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code} className="bg-charcoal text-white">
                                {lang.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Input/Output Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 min-h-[300px]">
                {/* Source */}
                <div className="glass-card p-5 rounded-3xl border-white/10 flex flex-col focus-within:border-lava/50 transition-colors bg-black/20 group relative">
                    <textarea
                        className="flex-1 bg-transparent border-none outline-none text-xl text-white resize-none placeholder-gray-600 leading-relaxed font-sans"
                        placeholder={t('translator.inputPlaceholder')}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        spellCheck="false"
                    />
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5 opacity-50 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-2">
                            <button onClick={() => setInputText('')} className="p-2 hover:bg-white/10 rounded-lg text-gray-400" title={t('translator.clear')}>
                                <Eraser size={18} />
                            </button>
                            <button onClick={handlePaste} className="p-2 hover:bg-white/10 rounded-lg text-gray-400" title={t('translator.paste')}>
                                <ClipboardPaste size={18} />
                            </button>
                        </div>
                        <span className="text-xs text-gray-600 font-mono">{inputText.length} chars</span>
                    </div>
                </div>

                {/* Target */}
                <div className="glass-card p-5 rounded-3xl border-white/10 flex flex-col bg-black/40 relative overflow-hidden">
                    {isLoading && (
                        <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex items-center justify-center flex-col gap-4">
                            <div className="w-12 h-12 border-2 border-lava border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-lava font-mono animate-pulse">NEURAL PROCESSING...</p>
                        </div>
                    )}
                    
                    <div className="flex-1 overflow-y-auto">
                        {result ? (
                            <div className="animate-in fade-in slide-in-from-bottom-2">
                                <p className="text-2xl text-amber-500 font-medium leading-relaxed mb-2">
                                    {result.translatedText}
                                </p>
                                {result.transliteration && (
                                    <p className="text-gray-500 text-sm font-mono italic">
                                        /{result.transliteration}/
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-700 italic">
                                {t('files.placeholder')}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end items-center mt-4 pt-4 border-t border-white/5 gap-2">
                         <button 
                            onClick={() => result && handleSpeak(result.translatedText)}
                            disabled={!result || isSpeaking}
                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title={t('translator.listen')}
                        >
                            {isSpeaking ? <Loader2 size={20} className="animate-spin text-lava" /> : <Volume2 size={20} />}
                        </button>
                        <button 
                            onClick={copyToClipboard}
                            disabled={!result}
                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title={t('translator.copy')}
                        >
                            {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mb-8">
                <button
                    onClick={handleTranslate}
                    disabled={isLoading || !inputText}
                    className="group relative px-10 py-5 bg-obsidian rounded-full border border-lava/50 text-white font-bold tracking-widest overflow-hidden hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(255,69,0,0.2)] hover:shadow-[0_0_50px_rgba(255,69,0,0.4)]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-lava via-amber-500 to-lava opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <span className="relative flex items-center gap-3 z-10 text-lg">
                        {t('translator.translate')} <ArrowRightLeft size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                    </span>
                </button>
            </div>

            {result?.culturalNote && (
                <div className="glass-card p-6 rounded-2xl border-blue-500/20 bg-blue-900/5 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-full text-blue-400">
                            <Lightbulb size={24} />
                        </div>
                        <div>
                            <h3 className="text-blue-400 font-bold mb-1 uppercase tracking-wider text-xs">{t('translator.nuance')}</h3>
                            <p className="text-gray-300 leading-relaxed">
                                {result.culturalNote}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
      )}

      {/* REAL-TIME VOICE VIEW */}
      {mode === 'live' && (
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full h-full animate-in fade-in slide-in-from-right-4 relative">
             
             {/* Language Selectors */}
             <div className="flex justify-between items-center gap-4 mb-12">
                 {/* Source */}
                 <div className="flex-1 glass-card p-4 rounded-2xl border-white/10 text-center">
                    <label className="text-xs text-gray-500 font-mono uppercase block mb-2">My Language</label>
                    <select
                        value={liveSourceLang}
                        onChange={(e) => setLiveSourceLang(e.target.value)}
                        className="bg-transparent text-xl font-bold text-white outline-none cursor-pointer w-full text-center"
                        disabled={isLiveActive}
                    >
                        {LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code} className="bg-charcoal">{lang.name}</option>
                        ))}
                    </select>
                 </div>

                 <ArrowRightLeft size={24} className="text-gray-600 shrink-0" />

                 {/* Target */}
                 <div className="flex-1 glass-card p-4 rounded-2xl border-white/10 text-center">
                    <label className="text-xs text-gray-500 font-mono uppercase block mb-2">Partner's Language</label>
                    <select
                        value={liveTargetLang}
                        onChange={(e) => setLiveTargetLang(e.target.value)}
                        className="bg-transparent text-xl font-bold text-lava outline-none cursor-pointer w-full text-center"
                        disabled={isLiveActive}
                    >
                        {LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code} className="bg-charcoal">{lang.name}</option>
                        ))}
                    </select>
                 </div>
             </div>

             {/* Central Viz & Control */}
             <div className="flex flex-col items-center justify-center mb-8 relative">
                 {isLiveActive && (
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="w-64 h-64 rounded-full bg-lava/5 animate-pulse"></div>
                         <div className="absolute w-48 h-48 rounded-full bg-lava/10 animate-ping opacity-20"></div>
                     </div>
                 )}
                 
                 <button 
                    onClick={toggleLiveSession}
                    className={`w-32 h-32 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 ${
                        isLiveActive 
                        ? 'bg-lava text-white shadow-[0_0_50px_rgba(255,69,0,0.5)] scale-110' 
                        : 'bg-white/5 border-2 border-white/10 text-gray-400 hover:border-lava/50 hover:text-white'
                    }`}
                 >
                    {isLiveActive ? <MicOff size={48} /> : <Mic size={48} />}
                 </button>
                 
                 <div className="mt-6 text-center">
                     <p className={`text-lg font-bold transition-colors ${isLiveActive ? 'text-white' : 'text-gray-500'}`}>
                         {isLiveActive ? 'Listening...' : 'Tap to Start Conversation'}
                     </p>
                     {isLiveActive && (
                        <p className="text-xs text-green-400 font-mono mt-1 flex items-center justify-center gap-1">
                            <Activity size={12} className="animate-bounce" /> LIVE CONNECTION
                        </p>
                     )}
                 </div>
             </div>

             {/* Transcript Area */}
             <div className="flex-1 glass-card rounded-3xl border-white/10 bg-black/40 p-6 overflow-hidden flex flex-col">
                <h3 className="text-xs text-gray-500 font-mono uppercase mb-4 flex items-center gap-2">
                    <MessageSquare size={12} /> Live Transcript
                </h3>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                    {transcript.length === 0 && (
                        <div className="h-full flex items-center justify-center text-gray-700 italic text-sm">
                            Conversation history will appear here...
                        </div>
                    )}
                    
                    {transcript.map((item, idx) => (
                        <div key={idx} className={`flex ${item.type === 'input' ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[80%] p-3 rounded-2xl ${
                                 item.type === 'input' 
                                 ? 'bg-white/10 text-white rounded-tr-none' 
                                 : 'bg-lava/10 text-gray-200 rounded-tl-none border border-lava/20'
                             }`}>
                                 <p className="text-sm">{item.text}</p>
                                 <p className="text-[10px] text-gray-500 mt-1 text-right">
                                     {item.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                 </p>
                             </div>
                        </div>
                    ))}
                    <div ref={transcriptEndRef} />
                </div>
             </div>

          </div>
      )}

    </div>
  );
};

export default Translator;
