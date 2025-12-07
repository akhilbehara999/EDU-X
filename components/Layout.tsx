import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Languages, 
  BrainCircuit, 
  FileText, 
  Settings, 
  Gamepad2,
  Bell,
  Menu,
  X,
  User,
  LogOut,
  Award,
  Book,
  ChevronDown,
} from 'lucide-react';
import { AppView } from '../types';
import { useLanguage } from '../LanguageContext';
import { useUser } from '../UserContext';
import { signOut } from '../services/authService';

interface LayoutProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const { profile } = useUser();

  const navItems = [
    { id: AppView.DASHBOARD, label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: AppView.EXAMS, label: t('nav.exams'), icon: Award },
    { id: AppView.DICTIONARY, label: t('nav.dictionary'), icon: Book },
    { id: AppView.TRANSLATE, label: t('nav.translate'), icon: Languages },
    { id: AppView.TUTOR, label: t('nav.tutor'), icon: BrainCircuit },
    { id: AppView.QUIZ, label: t('nav.quiz'), icon: Gamepad2 },
    { id: AppView.FILES, label: t('nav.files'), icon: FileText },
    { id: AppView.SETTINGS, label: t('nav.settings'), icon: Settings },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsProfileOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when resizing to larger screen
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:relative z-50 h-full bg-black/80 backdrop-blur-xl border-r border-white/5 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/5">
            <h1 className="text-2xl font-black text-white">
              EDU <span className="text-lava">X</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">Neural Interface v2.0.4</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 overflow-y-auto custom-scrollbar">
            <ul className="space-y-1 px-3">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setView(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all duration-200 ${
                      currentView === item.id
                        ? 'bg-lava/10 text-lava border border-lava/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Profile Section */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lava to-amber-600 flex items-center justify-center">
                <span className="font-bold text-white text-sm">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate text-sm">{profile.name}</p>
                <p className="text-gray-500 text-xs truncate">{profile.level}</p>
              </div>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div 
                ref={profileRef}
                className="mt-3 ml-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden animate-fade-in"
              >
                <div className="py-2">
                  <button 
                    onClick={() => { setView(AppView.PROFILE); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <User size={18} />
                    {t('nav.profile')}
                  </button>
                  <button 
                    onClick={() => { setView(AppView.SETTINGS); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <Settings size={18} />
                    {t('nav.settings')}
                  </button>
                  <div className="h-px bg-white/5 my-1 mx-2"></div>
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors group"
                  >
                    <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                    {t('nav.logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-white/5 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Menu size={20} />
              </button>
              <h2 className="text-xl font-bold capitalize">
                {navItems.find(item => item.id === currentView)?.label || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors relative">
                <Bell size={20} className="text-gray-400" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-lava rounded-full"></span>
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lava to-amber-600 flex items-center justify-center">
                    <span className="font-bold text-white text-xs">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                {isProfileOpen && (
                  <div 
                    ref={profileRef}
                    className="absolute right-0 mt-2 w-56 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in"
                  >
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-white/5">
                        <p className="text-white font-medium truncate">{profile.name}</p>
                        <p className="text-gray-500 text-xs truncate">{profile.email}</p>
                      </div>
                      <button 
                        onClick={() => { setView(AppView.PROFILE); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <User size={18} />
                        {t('nav.profile')}
                      </button>
                      <button 
                        onClick={() => { setView(AppView.SETTINGS); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <Settings size={18} />
                        {t('nav.settings')}
                      </button>
                      <div className="h-px bg-white/5 my-1 mx-2"></div>
                      <button 
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors group"
                      >
                        <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                        {t('nav.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;