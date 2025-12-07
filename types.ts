
export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  isError?: boolean;
  sources?: { uri: string; title: string }[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface StudyStat {
  day: string;
  hours: number;
  score: number;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface DictionaryData {
  word: string;
  phonetic: string;
  definition: string;
  translations: { lang: string; text: string }[];
  examples: string[];
  synonyms: string[];
  antonyms: string[];
}

export interface TranslationResult {
  translatedText: string;
  transliteration?: string;
  culturalNote?: string;
  detectedLanguage?: string;
}

export interface StudyGuide {
  summary: string;
  keyPoints: string[];
  vocabulary: {
    term: string;
    definition: string;
    translation: string;
  }[];
}

export interface RoadmapPhase {
  phaseTitle: string;
  duration: string;
  topics: string[];
  description: string;
}

export interface Roadmap {
  title: string;
  description: string;
  difficulty: string;
  phases: RoadmapPhase[];
}

export interface UserPreferences {
  soundEnabled: boolean;
  notifications: boolean;
  hapticFeedback: boolean;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  focusMode: boolean; // Reduces animations
}

export interface UserProfile {
  name: string;
  email: string;
  title: string;
  level: string;
  bio: string;
  phone: string;
  location: string;
  avatar?: string;
  preferences: UserPreferences;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  TRANSLATE = 'TRANSLATE',
  TUTOR = 'TUTOR',
  QUIZ = 'QUIZ',
  EXAMS = 'EXAMS',
  FILES = 'FILES',
  SETTINGS = 'SETTINGS',
  DICTIONARY = 'DICTIONARY',
  PROFILE = 'PROFILE',
}
