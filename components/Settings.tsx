import React, { useState } from 'react';
import { Settings as SettingsIcon, Globe, Moon, Bell, Database, Volume2, Target, Zap, RefreshCw, Check } from 'lucide-react';
import { LANGUAGES } from '../constants';
import { useLanguage } from '../LanguageContext';
import { useUser } from '../UserContext';

const Settings: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { profile, updatePreferences, updateProfile } = useUser();
  const [resetConfirm, setResetConfirm] = useState(false);

  const togglePreference = (key: keyof typeof profile.preferences) => {
    // Only toggle boolean values
    const current = profile.preferences[key];
    if (typeof current === 'boolean') {
        updatePreferences({ [key]: !current });
    }
  };

  const setDifficulty = (level: 'Beginner' | 'Intermediate' | 'Advanced') => {
      updatePreferences({ difficulty: level });
  };

  const handleReset = () => {
      if (!resetConfirm) {
          setResetConfirm(true);
          setTimeout(() => setResetConfirm(false), 3000);
          return;
      }
      // Simulate system reset
      window.location.reload();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <SettingsIcon className="text-lava" size={32} /> {t('settings.title')}
            </h2>
            <p className="text-gray-400">Configure your neural interface parameters.</p>
          </div>
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-gray-500">
              SYS_V 2.0.4
          </div>
      </div>

      <div className="space-y-6">
        
        {/* Language Section */}
        <div className="glass-card p-6 rounded-2xl border-white/10">
          <div className="flex items-start justify-between mb-4">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                    <Globe size={20} />
                </div>
                <div>
                    <h3 className="text-white font-medium text-lg">{t('settings.language')}</h3>
                    <p className="text-xs text-gray-500">{t('settings.languageDesc')}</p>
                </div>
             </div>
          </div>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-lava/50 outline-none transition-colors cursor-pointer"
          >
             {LANGUAGES.map(lang => (
                 <option key={lang.code} value={lang.code} className="bg-charcoal">
                     {lang.name} - {lang.nativeName}
                 </option>
             ))}
          </select>
        </div>

        {/* Toggles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Dark Mode (Mock - System is always Dark, treated as Focus Mode here) */}
            <div className="glass-card p-5 rounded-2xl border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                        <Moon size={20} />
                    </div>
                    <div>
                        <h3 className="text-white font-medium">Focus Mode</h3>
                        <p className="text-xs text-gray-500">Reduce visual noise</p>
                    </div>
                </div>
                <button 
                    onClick={() => togglePreference('focusMode')}
                    className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${profile.preferences.focusMode ? 'bg-lava' : 'bg-white/10'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-md ${profile.preferences.focusMode ? 'left-7' : 'left-1'}`}></div>
                </button>
            </div>

            {/* Notifications */}
            <div className="glass-card p-5 rounded-2xl border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                        <Bell size={20} />
                    </div>
                    <div>
                        <h3 className="text-white font-medium">{t('settings.notifications')}</h3>
                        <p className="text-xs text-gray-500">Exam & streak alerts</p>
                    </div>
                </div>
                <button 
                    onClick={() => togglePreference('notifications')}
                    className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${profile.preferences.notifications ? 'bg-green-500' : 'bg-white/10'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-md ${profile.preferences.notifications ? 'left-7' : 'left-1'}`}></div>
                </button>
            </div>

             {/* Sound */}
             <div className="glass-card p-5 rounded-2xl border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-500/20 rounded-lg text-pink-400">
                        <Volume2 size={20} />
                    </div>
                    <div>
                        <h3 className="text-white font-medium">System Audio</h3>
                        <p className="text-xs text-gray-500">Interface sounds</p>
                    </div>
                </div>
                <button 
                    onClick={() => togglePreference('soundEnabled')}
                    className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${profile.preferences.soundEnabled ? 'bg-pink-500' : 'bg-white/10'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-md ${profile.preferences.soundEnabled ? 'left-7' : 'left-1'}`}></div>
                </button>
            </div>

            {/* Data Saver */}
            <div className="glass-card p-5 rounded-2xl border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-500/20 rounded-lg text-gray-400">
                        <Database size={20} />
                    </div>
                    <div>
                        <h3 className="text-white font-medium">{t('settings.dataSaver')}</h3>
                        <p className="text-xs text-gray-500">Optimize bandwidth</p>
                    </div>
                </div>
                 {/* This toggle is just visual for now as logic is similar to focus mode */}
                 <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-not-allowed opacity-50">
                    <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-gray-500"></div>
                </div>
            </div>
        </div>

        {/* Difficulty Setting */}
        <div className="glass-card p-6 rounded-2xl border-white/10">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                    <Target size={20} />
                </div>
                <div>
                    <h3 className="text-white font-medium">Core Difficulty</h3>
                    <p className="text-xs text-gray-500">Adjusts AI Tutor & Quiz complexity</p>
                </div>
             </div>
             
             <div className="flex bg-black/40 p-1 rounded-xl">
                 {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                     <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                            profile.preferences.difficulty === level 
                            ? 'bg-white/10 text-white shadow-glow-sm border border-white/10' 
                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                        }`}
                     >
                         {level}
                     </button>
                 ))}
             </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-6 mt-6 border-t border-white/5">
             <button 
                onClick={handleReset}
                className={`w-full py-4 border border-red-500/30 rounded-xl text-red-400 font-bold transition-all flex items-center justify-center gap-2 ${resetConfirm ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' : 'bg-red-500/5 hover:bg-red-500/10'}`}
             >
                {resetConfirm ? (
                    <>CONFIRM SYSTEM REBOOT?</>
                ) : (
                    <><RefreshCw size={18} /> REBOOT SYSTEM CACHE</>
                )}
             </button>
             <p className="text-center text-xs text-gray-600 mt-2 font-mono">
                 Action will refresh the application state.
             </p>
        </div>

      </div>
    </div>
  );
};

export default Settings;