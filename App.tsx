import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Translator from './components/Translator';
import ChatTutor from './components/ChatTutor';
import QuizArena from './components/QuizArena';
import FileAnalyzer from './components/FileAnalyzer';
import Exams from './components/Exams';
import Dictionary from './components/Dictionary';
import Settings from './components/Settings';
import Profile from './components/Profile';
import { Landing } from './components/Landing';
import { AppView } from './types';
import { LanguageProvider } from './LanguageContext';
import { UserProvider, useUser } from './UserContext';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useUser();
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lava mx-auto mb-4"></div>
          <p>Initializing neural interface...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return <Landing />;
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard setView={setCurrentView} />;
      case AppView.EXAMS:
        return <Exams />;
      case AppView.TRANSLATE:
        return <Translator />;
      case AppView.DICTIONARY:
        return <Dictionary />;
      case AppView.TUTOR:
        return <ChatTutor />;
      case AppView.QUIZ:
        return <QuizArena />;
      case AppView.FILES:
        return <FileAnalyzer />;
      case AppView.SETTINGS:
        return <Settings />;
      case AppView.PROFILE:
        return <Profile />;
      default:
        return <Dashboard setView={setCurrentView} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      setView={setCurrentView}
    >
      {renderView()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </LanguageProvider>
  );
};

export default App;