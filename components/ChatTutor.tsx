import React, { useState, useRef, useEffect } from 'react';
import { chatWithTutor } from '../services/geminiService';
import { Message } from '../types';
import { Send, Globe, Bot, Loader2, ExternalLink, Mic, MicOff } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const ChatTutor: React.FC = () => {
  const { t, languageName, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      content: 'Hello, student. I am Luminous. Which language or subject shall we master today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language; // Use the selected native language code

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setInput((prev) => prev ? `${prev} ${transcript}` : transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare history
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      
      // Pass languageName to the service
      const result = await chatWithTutor(userMsg.content, history, useSearch, languageName);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: result.text,
        sources: result.sources,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "I'm experiencing technical difficulties right now. This might be due to API rate limits or connectivity issues. Please try again in a moment or check your API key configuration.",
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] glass-card rounded-2xl overflow-hidden border-orange-500/20">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lava to-amber-600 flex items-center justify-center shadow-glow-sm">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">{t('tutor.title')}</h3>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              {t('tutor.online')}
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => setUseSearch(!useSearch)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-all ${
            useSearch 
              ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          <Globe size={14} />
          {useSearch ? t('tutor.webSearchOn') : t('tutor.webSearchOff')}
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-obsidian to-[#0a0a0a]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-white/10 border border-white/10 text-white rounded-tr-none' 
                : 'bg-orange-900/10 border border-orange-500/20 text-gray-200 rounded-tl-none shadow-glow-sm'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              
              {/* Display Sources if available */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                    <Globe size={10} /> Sources:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] bg-blue-500/10 text-blue-300 hover:text-white px-2 py-1 rounded border border-blue-500/20 hover:border-blue-500/50 transition-colors flex items-center gap-1 max-w-[200px] truncate"
                        title={source.title}
                      >
                        {source.title || 'Source'} <ExternalLink size={8} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-orange-900/10 border border-orange-500/20 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-lava" />
                <span className="text-xs text-gray-400">{t('tutor.thinking')}</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/40 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? "Listening..." : t('tutor.placeholder')}
            className={`flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lava/50 transition-colors ${isListening ? 'animate-pulse border-lava/50' : ''}`}
          />
          <button 
            onClick={toggleListening}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              isListening 
                ? 'bg-red-500/20 border border-red-500 text-red-500 shadow-glow-sm scale-105' 
                : 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-lava to-amber-600 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-glow hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatTutor;