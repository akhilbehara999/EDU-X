
import React, { useState } from 'react';
import { generateStudyGuide, generateLearningRoadmap } from '../services/geminiService';
import { 
  UploadCloud, 
  FileType, 
  Zap, 
  AlertCircle, 
  FileAudio, 
  FileText, 
  X, 
  Image as ImageIcon,
  BookOpen,
  Brain,
  List,
  RotateCcw,
  Volume2,
  Check,
  Map,
  Download,
  Target,
  ArrowRight,
  Clock,
  Layers,
  MapPin,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { StudyGuide, Roadmap } from '../types';

type Tab = 'summary' | 'vocabulary';
type ViewMode = 'analyzer' | 'roadmap';
type Difficulty = 'Beginner' | 'Intermediate' | 'Expert';

const FileAnalyzer: React.FC = () => {
  const { t, languageName } = useLanguage();
  
  // Navigation State
  const [viewMode, setViewMode] = useState<ViewMode>('analyzer');

  // Analyzer State
  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<{base64: string, mimeType: string} | null>(null);
  const [studyGuide, setStudyGuide] = useState<StudyGuide | null>(null);
  const [analyzerLoading, setAnalyzerLoading] = useState(false);
  const [analyzerError, setAnalyzerError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('summary');

  // Roadmap State
  const [roadmapTopic, setRoadmapTopic] = useState('');
  const [roadmapDifficulty, setRoadmapDifficulty] = useState<Difficulty>('Intermediate');
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);

  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/webp',
    'application/pdf',
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/aac', 'audio/x-m4a'
  ];

  // --- Analyzer Logic ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnalyzerError(null);
    setStudyGuide(null);
    
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      
      if (!allowedTypes.includes(selected.type)) {
        setAnalyzerError(`Unsupported file type: ${selected.type}. Please upload Images, PDFs, or Audio files.`);
        return;
      }

      setFile(selected);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        const base64 = result.split(',')[1];
        setFileData({ base64, mimeType: selected.type });
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleGenerateStudyGuide = async () => {
    if (!fileData) return;
    setAnalyzerLoading(true);
    setAnalyzerError(null);
    
    const result = await generateStudyGuide(fileData, languageName);
    
    if (result) {
      setStudyGuide(result);
      setActiveTab('summary');
    } else {
      setAnalyzerError("Failed to generate study materials. Please try a different file.");
    }
    setAnalyzerLoading(false);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setFileData(null);
    setStudyGuide(null);
    setAnalyzerError(null);
  };

  const handleSpeak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const renderFileIconSmall = () => {
    if (!file) return <FileType className="text-gray-500" />;
    if (file.type.startsWith('audio/')) return <FileAudio className="text-purple-500" />;
    if (file.type === 'application/pdf') return <FileText className="text-red-500" />;
    if (file.type.startsWith('image/')) return <ImageIcon className="text-blue-500" />;
    return <FileType className="text-gray-500" />;
  };

  const renderFileIconLarge = () => {
    if (!file) return <FileType size={64} className="text-gray-500 mb-4" />;
    if (file.type.startsWith('audio/')) return <FileAudio size={64} className="text-purple-500 mb-4" />;
    if (file.type === 'application/pdf') return <FileText size={64} className="text-red-500 mb-4" />;
    if (file.type.startsWith('image/') && preview) {
      return <img src={preview} alt="Preview" className="h-32 object-contain rounded-lg border border-white/20 mb-4" />;
    }
    return <ImageIcon size={64} className="text-blue-500 mb-4" />;
  };

  // --- Roadmap Logic ---
  const handleRoadmapGenerate = async () => {
    if (!roadmapTopic) return;
    setRoadmapLoading(true);
    setRoadmapError(null);
    setRoadmap(null);

    const result = await generateLearningRoadmap(roadmapTopic, roadmapDifficulty, languageName);
    
    if (result) {
        setRoadmap(result);
    } else {
        setRoadmapError("Failed to generate roadmap. Please try again.");
    }
    setRoadmapLoading(false);
  };

  const downloadRoadmap = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!roadmap) return;

    try {
        let content = `LEARNING ROADMAP: ${(roadmap.title || 'Untitled').toUpperCase()}\n`;
        content += `Difficulty: ${roadmap.difficulty}\n`;
        content += `Description: ${roadmap.description}\n\n`;
        content += `----------------------------------------\n\n`;

        roadmap.phases.forEach((phase, index) => {
            content += `PHASE ${index + 1}: ${phase.phaseTitle}\n`;
            content += `Duration: ${phase.duration}\n`;
            content += `Overview: ${phase.description}\n`;
            content += `Topics:\n`;
            phase.topics.forEach(topic => {
                content += `  - ${topic}\n`;
            });
            content += `\n----------------------------------------\n\n`;
        });

        const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        const filename = `${(roadmap.title || 'Roadmap').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    } catch (err) {
        console.error("Export failed:", err);
        alert("Failed to export file.");
    }
  };


  // --- Render Functions ---

  const renderAnalyzer = () => {
      if (studyGuide) {
        return (
          <div className="flex flex-col h-full space-y-6">
            
            {/* Analyzer Header Bar */}
            <div className="glass-card p-4 rounded-2xl border-white/10 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
               <div className="flex items-center gap-4 min-w-0">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 shrink-0">
                    {renderFileIconSmall()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold text-white truncate">{file?.name}</h2>
                    <div className="flex items-center gap-2 text-xs text-green-400 font-mono mt-0.5">
                       <Check size={12} /> ANALYSIS COMPLETE
                    </div>
                  </div>
               </div>
               
               <button 
                 onClick={clearFile}
                 className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/50 hover:text-red-400 rounded-xl text-sm font-bold text-gray-300 transition-all flex items-center gap-2 whitespace-nowrap"
               >
                 <RotateCcw size={16} /> <span className="hidden sm:inline">{t('files.reupload')}</span>
               </button>
            </div>
    
            {/* Analyzer Main Content Area */}
            <div className="flex-1 glass-card rounded-3xl border-white/10 bg-black/40 flex flex-col overflow-hidden shadow-2xl relative">
               
               {/* Top Tabs */}
               <div className="flex border-b border-white/10 overflow-x-auto shrink-0 bg-black/20">
                  <button 
                      onClick={() => setActiveTab('summary')}
                      className={`flex-1 min-w-[150px] py-4 text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'summary' ? 'bg-lava/10 text-lava border-b-2 border-lava' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                      <BookOpen size={18} /> {t('files.tabs.summary')}
                  </button>
                  <button 
                      onClick={() => setActiveTab('vocabulary')}
                      className={`flex-1 min-w-[150px] py-4 text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'vocabulary' ? 'bg-blue-500/10 text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                      <List size={18} /> {t('files.tabs.vocabulary')}
                  </button>
               </div>
    
               {/* Tab Content - Scrollable Area */}
               <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    
                    {/* 1. SUMMARY TAB */}
                    {activeTab === 'summary' && (
                        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-right-4 space-y-8 pb-12">
                            {/* Executive Brief Card */}
                            <div className="bg-white/5 p-6 md:p-8 rounded-3xl border border-white/5">
                                <div className="flex justify-between items-start mb-6">
                                     <div>
                                        <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">
                                            Executive <span className="lava-text">Brief</span>
                                        </h2>
                                        <div className="h-1 w-20 bg-gradient-to-r from-lava to-transparent rounded-full"></div>
                                     </div>
                                     <button 
                                        onClick={() => handleSpeak(studyGuide.summary)}
                                        className="p-3 bg-white/5 rounded-full hover:bg-lava hover:text-white text-gray-400 transition-all shrink-0 ml-4 border border-white/5"
                                        title="Listen to summary"
                                    >
                                        <Volume2 size={20} />
                                    </button>
                                </div>
                                <p className="text-lg leading-relaxed text-gray-200 font-light tracking-wide">
                                    {studyGuide.summary}
                                </p>
                            </div>
    
                            {/* Key Takeaways Section */}
                            <div>
                                 <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500">
                                        <Brain size={20} />
                                    </div>
                                    Key Takeaways
                                </h3>
                                <div className="grid gap-4">
                                    {studyGuide.keyPoints?.map((point, idx) => (
                                        <div key={idx} className="bg-black/20 p-5 rounded-2xl border border-white/5 hover:border-lava/30 transition-colors flex gap-4 items-start group">
                                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-lava/10 text-lava flex items-center justify-center font-bold text-sm border border-lava/20 group-hover:bg-lava group-hover:text-white transition-colors">
                                                {idx + 1}
                                            </span>
                                            <p className="text-gray-300 font-medium leading-relaxed pt-1">{point}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
    
                    {/* 2. VOCABULARY TAB */}
                    {activeTab === 'vocabulary' && (
                        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-right-4 pb-12">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-bold text-white mb-2">X-Ray Vocabulary</h2>
                                <p className="text-gray-400">Deep dive into complex terms found in your document.</p>
                            </div>
    
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                                {studyGuide.vocabulary?.map((vocab, idx) => (
                                    <div key={idx} className="glass-card p-6 rounded-3xl border-white/5 hover:border-blue-500/50 hover:bg-blue-900/5 transition-all group flex flex-col h-full relative overflow-hidden">
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleSpeak(vocab.term)}
                                                className="p-2 rounded-full bg-white/10 text-gray-400 hover:text-blue-400 hover:bg-white/20"
                                            >
                                                <Volume2 size={18} />
                                            </button>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <h3 className="text-xl font-black text-white mb-2 group-hover:text-blue-400 transition-colors pr-8 leading-tight">{vocab.term}</h3>
                                            {vocab.translation && (
                                                <span className="inline-block px-2 py-1 rounded-md bg-blue-500/10 text-blue-300 text-xs font-mono border border-blue-500/20">
                                                    {vocab.translation}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="mt-auto pt-4 border-t border-white/5">
                                            <p className="text-gray-400 leading-relaxed text-sm">
                                                {vocab.definition}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
    
               </div>
            </div>
          </div>
        );
      }
    
      // Initial Upload View
      return (
        <div className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto p-4 animate-in fade-in zoom-in-95">
           <div className="w-full text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">{t('files.title')}</h2>
              <p className="text-xl text-gray-400">{t('files.placeholder')}</p>
           </div>
    
           <div className="w-full glass-card p-12 rounded-[2rem] border-orange-500/20 flex flex-col items-center justify-center relative overflow-hidden group transition-all hover:border-lava/40 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              
              <div className="w-full h-80 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center relative bg-black/20 hover:bg-black/30 transition-colors">
                {!file ? (
                   <>
                     <input 
                        type="file" 
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.webp,.pdf,.mp3,.wav,.aac,.m4a"
                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                     />
                     <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/10 group-hover:border-lava/50">
                        <UploadCloud size={40} className="text-gray-400 group-hover:text-lava transition-colors" />
                     </div>
                     <p className="text-2xl font-bold text-white mb-2">{t('files.dragDrop')}</p>
                     <div className="flex gap-3 text-xs text-gray-500 font-mono uppercase tracking-widest mt-4">
                        <span className="px-3 py-1.5 bg-white/5 rounded border border-white/5">PDF</span>
                        <span className="px-3 py-1.5 bg-white/5 rounded border border-white/5">IMG</span>
                        <span className="px-3 py-1.5 bg-white/5 rounded border border-white/5">AUDIO</span>
                     </div>
                   </>
                ) : (
                   <div className="text-center w-full p-6 relative z-10 animate-in zoom-in-95">
                      <button 
                        onClick={clearFile}
                        className="absolute top-0 right-0 p-2 bg-white/10 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors z-20"
                      >
                        <X size={24} />
                      </button>
                      {renderFileIconLarge()}
                      <p className="text-3xl font-bold text-white truncate max-w-xl mx-auto mb-2">{file.name}</p>
                      <p className="text-lg text-gray-500 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                   </div>
                )}
              </div>
    
              {analyzerError && (
                <div className="mt-8 flex items-center gap-3 text-red-400 bg-red-500/10 px-6 py-4 rounded-xl border border-red-500/20 w-full animate-pulse">
                   <AlertCircle size={24} />
                   <span className="font-medium text-lg">{analyzerError}</span>
                </div>
              )}
    
              <button 
                onClick={handleGenerateStudyGuide}
                disabled={!file || analyzerLoading}
                className="w-full mt-10 py-6 bg-gradient-to-r from-lava to-amber-600 text-white font-black text-xl tracking-wider rounded-2xl shadow-glow hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
              >
                 {analyzerLoading ? (
                     <div className="flex items-center gap-3">
                        <div className="animate-spin w-6 h-6 border-4 border-white rounded-full border-t-transparent" />
                        <span>{t('files.processing')}</span>
                     </div>
                 ) : (
                     <><Zap size={28} /> {t('files.initiate')}</>
                 )}
              </button>
           </div>
        </div>
      );
  };

  const renderRoadmap = () => {
    if (roadmap) {
        return (
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="glass-card p-6 rounded-2xl border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in fade-in slide-in-from-top-4 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-lava/10 rounded-lg text-lava border border-lava/20">
                                <MapPin size={24} />
                             </div>
                             <div>
                                <h2 className="text-2xl font-black text-white">{roadmap.title}</h2>
                                <div className="flex items-center gap-2 text-xs text-gray-400 font-mono uppercase mt-1">
                                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">{roadmap.difficulty}</span>
                                    <span>•</span>
                                    <span>{roadmap.phases.length} PHASES</span>
                                </div>
                             </div>
                        </div>
                        <p className="text-gray-400 text-sm max-w-2xl mt-3">{roadmap.description}</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button 
                            onClick={(e) => downloadRoadmap(e)}
                            className="flex-1 md:flex-none px-5 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 hover:border-lava/50 flex items-center justify-center gap-2 transition-all"
                        >
                            <Download size={18} /> <span className="hidden sm:inline">Export</span>
                        </button>
                        <button 
                            onClick={() => { setRoadmap(null); setRoadmapTopic(''); }}
                            className="flex-1 md:flex-none px-5 py-3 bg-white hover:bg-gray-200 text-black font-bold rounded-xl shadow-glow transition-all flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={18} /> New Roadmap
                        </button>
                    </div>
                </div>

                {/* Timeline Visualization */}
                <div className="flex-1 overflow-y-auto custom-scrollbar glass-card rounded-3xl p-8 border-white/10 bg-black/40 relative">
                     {/* Content Container */}
                     <div className="max-w-4xl mx-auto relative pb-20">
                        {/* Vertical Timeline Line */}
                        <div className="absolute left-[28px] md:left-[44px] top-8 bottom-0 w-0.5 bg-gradient-to-b from-lava via-white/10 to-transparent"></div>
                        
                        <div className="space-y-12 relative z-10">
                            {roadmap.phases.map((phase, idx) => (
                                <div key={idx} className="flex gap-6 md:gap-10 group animate-in fade-in slide-in-from-bottom-4" style={{animationDelay: `${idx * 100}ms`}}>
                                    {/* Number Node */}
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className="w-14 h-14 md:w-22 md:h-22 rounded-2xl bg-obsidian border-2 border-white/10 group-hover:border-lava group-hover:shadow-[0_0_20px_rgba(255,69,0,0.4)] flex items-center justify-center text-xl md:text-2xl font-black text-white transition-all z-20 relative">
                                            {idx + 1}
                                            {/* Pulse Effect */}
                                            <div className="absolute inset-0 rounded-2xl bg-lava opacity-0 group-hover:animate-ping -z-10"></div>
                                        </div>
                                    </div>

                                    {/* Content Card */}
                                    <div className="flex-1 glass-card p-6 rounded-2xl border-white/5 hover:border-lava/30 transition-all group-hover:translate-x-1 duration-300 bg-black/20">
                                        <div className="flex flex-wrap justify-between items-start mb-4 gap-2">
                                            <h3 className="text-xl font-bold text-white">{phase.phaseTitle}</h3>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-xs font-mono text-lava whitespace-nowrap">
                                                <Clock size={12} /> {phase.duration}
                                            </div>
                                        </div>
                                        
                                        <p className="text-gray-400 mb-6 leading-relaxed text-sm border-b border-white/5 pb-4">
                                            {phase.description}
                                        </p>
                                        
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Target size={12} /> Key Topics
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {phase.topics.map((topic, tIdx) => (
                                                    <div key={tIdx} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-lava"></div>
                                                        <span className="text-sm text-gray-200">{topic}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                </div>
            </div>
        )
    }

    // Input View for Roadmap
    return (
        <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto p-4 animate-in fade-in zoom-in-95">
            <div className="w-full text-center mb-10">
                <h2 className="text-4xl font-black text-white mb-4">Neural Roadmap</h2>
                <p className="text-xl text-gray-400">Design your end-to-end learning path with AI precision.</p>
            </div>

            <div className="w-full glass-card p-10 rounded-[2rem] border-orange-500/20 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Map size={180} />
                </div>
                
                <div className="space-y-8 relative z-10">
                    <div className="space-y-3">
                        <label className="text-xs text-gray-500 font-mono uppercase tracking-widest ml-1">Learning Topic</label>
                        <input 
                            type="text"
                            value={roadmapTopic}
                            onChange={(e) => setRoadmapTopic(e.target.value)}
                            placeholder="e.g. Full Stack Development, Quantum Mechanics, Japanese..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-white text-lg focus:border-lava/50 outline-none transition-colors shadow-inner"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs text-gray-500 font-mono uppercase tracking-widest ml-1">Current Proficiency</label>
                        <div className="grid grid-cols-3 gap-3">
                            {(['Beginner', 'Intermediate', 'Expert'] as Difficulty[]).map(level => (
                                <button
                                    key={level}
                                    onClick={() => setRoadmapDifficulty(level)}
                                    className={`py-4 rounded-xl text-sm font-bold border transition-all ${
                                        roadmapDifficulty === level
                                        ? 'bg-lava text-white border-lava shadow-glow'
                                        : 'bg-white/5 text-gray-500 border-white/10 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {roadmapError && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
                            <AlertCircle size={20} />
                            <span>{roadmapError}</span>
                        </div>
                    )}

                    <button 
                        onClick={handleRoadmapGenerate}
                        disabled={roadmapLoading || !roadmapTopic}
                        className="w-full py-5 bg-white text-black font-black text-xl tracking-wider rounded-xl shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                    >
                         {roadmapLoading ? (
                            <div className="flex items-center gap-3">
                                <div className="animate-spin w-6 h-6 border-4 border-black rounded-full border-t-transparent" />
                                <span>Generating Path...</span>
                            </div>
                        ) : (
                            <>Generate Roadmap <ArrowRight size={24} /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-6">
        {/* Top Level Navigation Switcher */}
        <div className="flex justify-center mb-2">
            <div className="bg-black/40 p-1.5 rounded-full border border-white/10 inline-flex shadow-lg backdrop-blur-md">
                <button
                    onClick={() => setViewMode('analyzer')}
                    className={`px-8 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                        viewMode === 'analyzer' 
                        ? 'bg-white/10 text-white shadow-glow-sm border border-white/10' 
                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <Layers size={16} /> Content Analyzer
                </button>
                <button
                    onClick={() => setViewMode('roadmap')}
                    className={`px-8 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                        viewMode === 'roadmap' 
                        ? 'bg-white/10 text-white shadow-glow-sm border border-white/10' 
                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <Map size={16} /> Roadmap Generator
                </button>
            </div>
        </div>

        {/* View Content */}
        <div className="flex-1 overflow-hidden">
            {viewMode === 'analyzer' ? renderAnalyzer() : renderRoadmap()}
        </div>
    </div>
  );
};

export default FileAnalyzer;
