
import React, { useState } from 'react';
import { Search, Book, Volume2, Globe, Sparkles, Languages, Loader2 } from 'lucide-react';
import { lookupWord, speakText } from '../services/geminiService';
import { useLanguage } from '../LanguageContext';
import { DictionaryData } from '../types';

const Dictionary: React.FC = () => {
  const { t, languageName } = useLanguage();
  const [inputWord, setInputWord] = useState('');
  const [data, setData] = useState<DictionaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!inputWord.trim()) return;
    setLoading(true);
    setData(null);
    try {
      const result = await lookupWord(inputWord, languageName);
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async (text: string, langName: string = 'English') => {
    if (speaking) return;
    setSpeaking(text);
    await speakText(text, langName);
    setSpeaking(null);
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Book className="text-lava" size={32} /> {t('dictionary.title')}
        </h2>
        <div className="relative max-w-xl mx-auto mt-6">
          <input
            type="text"
            value={inputWord}
            onChange={(e) => setInputWord(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t('dictionary.search')}
            className="w-full bg-black/40 border border-white/10 rounded-full px-6 py-4 pl-14 text-lg text-white placeholder-gray-500 focus:outline-none focus:border-lava/50 transition-colors shadow-lg"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={24} />
          <button 
            onClick={handleSearch}
            disabled={loading || !inputWord.trim()}
            className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-lava to-amber-600 rounded-full text-white font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
          >
            {loading ? <div className="animate-spin w-4 h-4 border-2 border-white rounded-full border-t-transparent" /> : t('dictionary.analyze')}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
        {loading && (
             <div className="animate-in fade-in space-y-6 pb-10">
                <div className="glass-card p-8 rounded-3xl border-white/5 relative overflow-hidden">
                    <div className="h-8 w-1/3 bg-white/10 rounded-lg animate-pulse mb-4"></div>
                    <div className="h-4 w-1/4 bg-white/5 rounded-lg animate-pulse mb-6"></div>
                    <div className="h-20 w-full bg-white/5 rounded-lg animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-6 rounded-2xl border-white/5 h-48 animate-pulse"></div>
                    <div className="glass-card p-6 rounded-2xl border-white/5 h-48 animate-pulse"></div>
                </div>
             </div>
        )}

        {data && !loading && (
          <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-10">
            
            {/* Main Definition Card */}
            <div className="glass-card p-8 rounded-3xl border-orange-500/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-5">
                  <Languages size={150} />
               </div>
               
               <div className="flex items-end gap-4 mb-4 relative z-10">
                  <h1 className="text-5xl font-black text-white tracking-tight">{data.word}</h1>
                  {data.phonetic && (
                    <span className="text-xl font-mono text-gray-400 mb-2">/{data.phonetic}/</span>
                  )}
                  <button 
                    onClick={() => handleSpeak(data.word)}
                    disabled={speaking === data.word}
                    className="mb-2 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-lava"
                  >
                    {speaking === data.word ? <Loader2 size={24} className="animate-spin"/> : <Volume2 size={24} />}
                  </button>
               </div>
               
               <div className="mb-6 relative z-10">
                  <h3 className="text-sm font-mono text-lava mb-2 uppercase tracking-wider">{t('dictionary.definition')}</h3>
                  <p className="text-xl text-gray-200 leading-relaxed">{data.definition}</p>
               </div>

               {/* Tags */}
               <div className="flex flex-wrap gap-2 relative z-10">
                  {data.synonyms?.map((syn, i) => (
                    <span key={i} className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-300 text-sm rounded-full">
                       {syn}
                    </span>
                  ))}
                  {data.antonyms?.map((ant, i) => (
                    <span key={i} className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-full">
                       {ant}
                    </span>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Translations */}
              <div className="glass-card p-6 rounded-2xl border-white/10 hover:border-blue-500/30 transition-colors">
                 <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Globe className="text-blue-400" size={20} /> {t('dictionary.translations')}
                 </h3>
                 <div className="space-y-3">
                    {data.translations?.length > 0 ? (
                        data.translations.map((trans, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                            <span className="text-gray-400 font-medium">{trans.lang}</span>
                            <span className="text-white text-lg font-semibold flex items-center gap-2">
                                {trans.text}
                                <button 
                                    onClick={() => handleSpeak(trans.text, trans.lang)}
                                    disabled={speaking === trans.text}
                                    className="text-gray-500 hover:text-white"
                                >
                                    <Volume2 size={16} />
                                </button>
                            </span>
                        </div>
                        ))
                    ) : (
                        <p className="text-gray-500 italic text-sm">No translations generated.</p>
                    )}
                 </div>
              </div>

              {/* Examples */}
              <div className="glass-card p-6 rounded-2xl border-white/10 hover:border-amber-500/30 transition-colors">
                 <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="text-amber-400" size={20} /> {t('dictionary.examples')}
                 </h3>
                 <div className="space-y-4">
                    {data.examples?.length > 0 ? (
                        data.examples.map((ex, i) => (
                        <div key={i} className="relative pl-6">
                            <div className="absolute left-0 top-1 w-1 h-full bg-gradient-to-b from-lava to-transparent rounded-full"></div>
                            <p className="text-gray-300 italic">"{ex}"</p>
                        </div>
                        ))
                    ) : (
                        <p className="text-gray-500 italic text-sm">No examples found.</p>
                    )}
                 </div>
              </div>

            </div>
          </div>
        )}

        {!data && !loading && (
           <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
              <Book size={64} className="mb-4 opacity-20" />
              <p>{t('dictionary.search')}</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default Dictionary;
