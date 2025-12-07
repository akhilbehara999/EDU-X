import { Language, StudyStat } from './types';

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'ur', name: 'Urdu', nativeName: 'اُردُو' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
  // Adding a few requested ones
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
];

export const MOCK_STATS: StudyStat[] = [
  { day: 'Mon', hours: 2.5, score: 78 },
  { day: 'Tue', hours: 3.8, score: 85 },
  { day: 'Wed', hours: 1.2, score: 62 },
  { day: 'Thu', hours: 4.5, score: 92 },
  { day: 'Fri', hours: 3.0, score: 88 },
  { day: 'Sat', hours: 5.5, score: 95 },
  { day: 'Sun', hours: 2.0, score: 80 },
];
