import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Zap, Globe, Shield, Activity, Lock, Mail, User, Brain, BookOpen, Trophy } from 'lucide-react';
import { signIn, signUp } from '../services/authService';
import { useUser } from '../UserContext';

interface LandingProps {}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  targetX?: number;
  targetY?: number;
  distance?: number;
}

export const Landing: React.FC<LandingProps> = () => {
  const { updateProfile } = useUser();
  const [authMode, setAuthMode] = useState<'hero' | 'login' | 'signup'>('hero');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number>(0);
  const particleCount = 50;

  // Initialize particles
  useEffect(() => {
    const initParticles = () => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.1
        });
      }
      setParticles(newParticles);
    };

    initParticles();

    const handleResize = () => {
      initParticles();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (!ctx) return;
      
      // Clear canvas with a semi-transparent black for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach(particle => {
        // Move particle
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Bounce off edges
        if (particle.x <= 0 || particle.x >= canvas.width) particle.speedX *= -1;
        if (particle.y <= 0 || particle.y >= canvas.height) particle.speedY *= -1;

        // Mouse interaction
        const dx = particle.x - mousePosition.current.x;
        const dy = particle.y - mousePosition.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          particle.targetX = mousePosition.current.x;
          particle.targetY = mousePosition.current.y;
          particle.distance = distance;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 69, 0, ${particle.opacity})`;
        ctx.fill();
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Start animation
    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [particles]);

  // Mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      if (authMode === 'login') {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        
        const { user } = await signIn(email, password);
        
        // Update user profile with Supabase user data
        updateProfile({
          email: user?.email || '',
          name: user?.user_metadata?.name || email.split('@')[0]
        });
      } else if (authMode === 'signup') {
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        
        const { user } = await signUp(email, password, name);
        
        // Update user profile with Supabase user data
        updateProfile({
          email: user?.email || '',
          name: user?.user_metadata?.name || name
        });
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderHero = () => (
    <div className="text-center max-w-4xl mx-auto px-4">
      <div className="relative inline-block mb-6">
        <h1 className="text-6xl md:text-8xl font-black text-white relative z-10 animate-fade-in">
          EDU <span className="text-lava">X</span>
        </h1>
        <div className="absolute -inset-4 bg-lava blur-2xl opacity-20 animate-pulse"></div>
      </div>
      
      <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up">
        EDU X is the neural interface for knowledge acquisition. Master 20+ languages and complex subjects with an adaptive AI core.
      </p>
      
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-slide-up-delay">
        <button 
          onClick={() => setAuthMode('signup')}
          className="group relative px-8 py-4 bg-white text-black font-bold tracking-wider rounded-lg overflow-hidden hover:scale-105 transition-all duration-300 transform hover:shadow-[0_0_30px_rgba(255,69,0,0.5)]"
        >
          <span className="relative z-10 flex items-center gap-2">INITIALIZE SYSTEM <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
        </button>
        
        <button 
          onClick={() => setAuthMode('login')}
          className="px-8 py-4 border border-white/30 text-white font-bold tracking-wider rounded-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
        >
          ACCESS SYSTEM
        </button>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto animate-fade-in-delay">
        <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-lava/30 transition-all duration-300">
          <Brain className="text-lava mb-4" size={32} />
          <h3 className="text-xl font-bold text-white mb-2">Neural Learning</h3>
          <p className="text-gray-400">Adaptive AI that evolves with your learning patterns and cognitive strengths.</p>
        </div>
        
        <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-lava/30 transition-all duration-300">
          <Globe className="text-lava mb-4" size={32} />
          <h3 className="text-xl font-bold text-white mb-2">20+ Languages</h3>
          <p className="text-gray-400">Master global languages with immersive contextual translation technology.</p>
        </div>
        
        <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-lava/30 transition-all duration-300">
          <Shield className="text-lava mb-4" size={32} />
          <h3 className="text-xl font-bold text-white mb-2">Secure Protocol</h3>
          <p className="text-gray-400">Military-grade encryption for your neural data and learning patterns.</p>
        </div>
      </div>
    </div>
  );

  const renderLogin = () => (
    <div className="relative z-10 max-w-md mx-auto px-4 w-full pt-12">
      <div className="glass-card p-8 rounded-3xl border-orange-500/20 shadow-glow animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white italic">EDU X</h2>
          <p className="text-gray-400 text-sm mt-2">Welcome back, Operator.</p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleAuthSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs text-gray-500 font-mono">IDENTITY_KEY (EMAIL)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input 
                type="email" 
                name="email"
                placeholder="user@edux.ai"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-lava outline-none transition-colors duration-300"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-gray-500 font-mono">ACCESS_CODE (PASSWORD)</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input 
                type="password" 
                name="password"
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-lava outline-none transition-colors duration-300"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-lava to-amber-600 text-white font-bold rounded-xl shadow-glow hover:scale-[1.02] transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,69,0,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AUTHENTICATING...
              </>
            ) : (
              'ESTABLISH CONNECTION'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            New unit? <button onClick={() => setAuthMode('signup')} className="text-lava hover:underline">Initialize protocol</button>
          </p>
          <button onClick={() => setAuthMode('hero')} className="mt-4 text-xs text-gray-600 hover:text-white transition-colors">
            ← Return to Main
          </button>
        </div>
      </div>
    </div>
  );

  const renderSignup = () => (
    <div className="relative z-10 max-w-md mx-auto px-4 w-full pt-12">
      <div className="glass-card p-8 rounded-3xl border-orange-500/20 shadow-glow animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white italic">EDU X</h2>
          <p className="text-gray-400 text-sm mt-2">Create new neural profile.</p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-gray-500 font-mono">DESIGNATION (NAME)</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input 
                type="text" 
                name="name"
                placeholder="Student Alpha"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-lava outline-none transition-colors duration-300"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-gray-500 font-mono">IDENTITY_KEY (EMAIL)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input 
                type="email" 
                name="email"
                placeholder="user@edux.ai"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-lava outline-none transition-colors duration-300"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-gray-500 font-mono">ACCESS_CODE (PASSWORD)</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input 
                type="password" 
                name="password"
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-lava outline-none transition-colors duration-300"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-white text-black font-bold rounded-xl shadow-glow hover:scale-[1.02] transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                INITIALIZING...
              </>
            ) : (
              'INITIALIZE SYSTEM'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Existing unit? <button onClick={() => setAuthMode('login')} className="text-lava hover:underline">Connect</button>
          </p>
          <button onClick={() => setAuthMode('hero')} className="mt-4 text-xs text-gray-600 hover:text-white transition-colors">
            ← Return to Main
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated background particles */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-lava/5 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-lava/5 to-transparent"></div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex justify-between items-center">
          <div className="text-2xl font-black text-white">
            EDU <span className="text-lava">X</span>
          </div>
          <button 
            onClick={() => setAuthMode('hero')}
            className="px-4 py-2 border border-white/20 rounded-lg text-sm hover:bg-white/10 transition-colors"
          >
            HOME
          </button>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-4">
          {authMode === 'hero' && renderHero()}
          {authMode === 'login' && renderLogin()}
          {authMode === 'signup' && renderSignup()}
        </main>
        
        {/* Footer */}
        <footer className="p-6 text-center text-gray-600 text-sm">
          © 2025 EDU X Neural Interface. Secure Cognitive Protocol v2.0.4
        </footer>
      </div>
    </div>
  );
};