import React, { useState, useRef } from 'react';
import { User, Briefcase, Save, Shield, Award, Sparkles, Camera, AlertCircle } from 'lucide-react';
import { useUser } from '../UserContext';
import { useLanguage } from '../LanguageContext';

const Profile: React.FC = () => {
  const { profile, updateProfile } = useUser();
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);

    if (file) {
        if (!file.type.startsWith('image/')) {
            setImageError('Invalid file type. Please upload an image.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            setImageError('File too large. Max size is 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, avatar: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      updateProfile(formData);
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      
      {/* Profile Header Card */}
      <div className="glass-card rounded-3xl p-8 mb-8 border-orange-500/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-lava to-amber-600 opacity-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-end md:items-center gap-6 mt-12">
            <div className="relative group cursor-pointer" onClick={handleImageClick}>
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-lava to-amber-500 p-1 shadow-glow ring-4 ring-black overflow-hidden">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center relative overflow-hidden">
                        {formData.avatar ? (
                            <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={64} className="text-gray-400" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Camera size={24} className="text-white" />
                        </div>
                    </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-obsidian p-2 rounded-full border border-white/10">
                    <Shield size={20} className="text-green-500" />
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                />
            </div>

            <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-1">{formData.name}</h1>
                <p className="text-lava font-mono tracking-widest uppercase mb-4">{formData.level} • {formData.title}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full"><Award size={14} className="text-amber-500" /> PRO MEMBER</span>
                    <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full"><Sparkles size={14} className="text-blue-500" /> EARLY ADOPTER</span>
                </div>
            </div>

            <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-3 bg-white text-black font-bold rounded-xl shadow-glow hover:scale-[1.02] transition-transform flex items-center gap-2 disabled:opacity-50"
            >
                {isSaving ? (
                    <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                ) : (
                    <><Save size={20} /> SAVE CHANGES</>
                )}
            </button>
        </div>
        
        {imageError && (
             <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20 max-w-md">
                <AlertCircle size={16} />
                <span className="text-sm">{imageError}</span>
             </div>
        )}
      </div>

      {showSuccess && (
          <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 text-green-400 animate-in fade-in slide-in-from-top-2">
             <Shield size={20} />
             <span className="font-bold">Profile updated successfully.</span>
          </div>
      )}

      {/* Edit Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         
         {/* Left Column: Personal Info */}
         <div className="md:col-span-2 space-y-6">
            <div className="glass-card p-6 rounded-2xl border-white/10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <User size={20} className="text-lava" /> Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500 font-mono uppercase">Full Name</label>
                        <input 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-lava/50 outline-none transition-colors"
                        />
                    </div>
                     <div className="space-y-2">
                        <label className="text-xs text-gray-500 font-mono uppercase">Job Title</label>
                        <div className="relative">
                            <Briefcase className="absolute left-4 top-3.5 text-gray-500" size={16} />
                            <input 
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-lava/50 outline-none transition-colors"
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs text-gray-500 font-mono uppercase">Bio</label>
                        <textarea 
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={4}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-lava/50 outline-none transition-colors resize-none"
                        />
                    </div>
                </div>
            </div>
         </div>

         {/* Right Column: Stats */}
         <div className="space-y-6">
              <div className="glass-card p-6 rounded-2xl border-white/10 bg-gradient-to-b from-transparent to-lava/10">
                <h3 className="text-lg font-bold text-white mb-4">Neural Stats</h3>
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                            <span>TOTAL XP</span>
                            <span className="text-white font-mono">245,090</span>
                        </div>
                        <div className="h-2 bg-black rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-lava to-amber-500 w-[75%]"></div>
                        </div>
                    </div>
                     <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                            <span>STREAK</span>
                            <span className="text-white font-mono">14 DAYS</span>
                        </div>
                        <div className="h-2 bg-black rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-[40%]"></div>
                        </div>
                    </div>
                </div>
             </div>
         </div>

      </div>
    </div>
  );
};

export default Profile;