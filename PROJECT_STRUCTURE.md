# Project Structure

This document explains the organization of the EDU X project.

## Directory Structure

```
├── components/          # React components
│   ├── ChatTutor.tsx    # AI chat interface
│   ├── Dashboard.tsx    # Main dashboard with statistics
│   ├── Dictionary.tsx   # Word lookup functionality
│   ├── Exams.tsx        # Exam generation and taking
│   ├── FileAnalyzer.tsx # Document analysis tools
│   ├── Landing.tsx      # Landing page with auth forms
│   ├── Layout.tsx       # Main application layout
│   ├── Profile.tsx      # User profile management
│   ├── QuizArena.tsx    # Quiz functionality
│   ├── Settings.tsx     # Application settings
│   └── Translator.tsx   # Translation tools
├── services/            # API services and clients
│   ├── authService.ts   # Supabase authentication service
│   ├── geminiService.ts # Google Gemini API integration
│   └── supabaseClient.ts# Supabase client configuration
├── .gitignore           # Git ignore rules
├── .env.example         # Environment variables template
├── App.tsx              # Main application component
├── AUTHENTICATION.md    # Authentication implementation details
├── index.css            # Global styles
├── index.html           # HTML entry point
├── index.tsx            # React DOM renderer
├── LanguageContext.tsx  # Internationalization context
├── LICENSE              # MIT license
├── metadata.json        # Application metadata
├── package.json         # NPM package configuration
├── PROJECT_STRUCTURE.md # This file
├── README.md            # Project documentation
├── supabase.d.ts        # Supabase TypeScript declarations
├── tsconfig.json        # TypeScript configuration
├── UserContext.tsx      # User state management
├── constants.ts         # Application constants
├── translations.ts      # Language translations
├── types.ts             # TypeScript type definitions
└── vite.config.ts       # Vite build configuration
```

## Key Directories and Files

### `/components`
Contains all React components organized by feature:
- **Landing.tsx**: Authentication forms and hero section
- **Layout.tsx**: Main application layout with navigation
- **Dashboard.tsx**: Home screen with learning statistics
- **ChatTutor.tsx**: AI-powered tutoring interface
- **Translator.tsx**: Text translation tools
- **Dictionary.tsx**: Word lookup functionality
- **QuizArena.tsx**: Interactive quizzes
- **Exams.tsx**: Exam generation and management
- **FileAnalyzer.tsx**: Document processing tools
- **Profile.tsx**: User profile settings
- **Settings.tsx**: Application preferences

### `/services`
API integrations and business logic:
- **supabaseClient.ts**: Supabase configuration and client initialization
- **authService.ts**: Authentication functions (sign up, sign in, sign out)
- **geminiService.ts**: Google Gemini API integration for AI features

### Root Files
- **App.tsx**: Main application component that handles routing
- **index.tsx**: React DOM rendering entry point
- **UserContext.tsx**: Global user state management
- **LanguageContext.tsx**: Internationalization support
- **types.ts**: Shared TypeScript interfaces and enums
- **constants.ts**: Application-wide constants
- **translations.ts**: Multi-language support strings

## Development Guidelines

### Adding New Components
1. Create the component in the `/components` directory
2. Import required contexts (UserContext, LanguageContext)
3. Use the established styling patterns (glass morphism, dark theme)
4. Follow the existing TypeScript typing patterns

### Adding New Services
1. Create service files in the `/services` directory
2. Export functions that encapsulate API calls
3. Handle errors appropriately
4. Use TypeScript interfaces for API responses

### Styling
- Use the existing CSS classes for consistency
- Follow the glass morphism design pattern
- Maintain dark theme with lava/orange accent colors
- Ensure mobile responsiveness