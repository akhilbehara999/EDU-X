import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Clock, Target, BookOpen, BrainCircuit, Gamepad2, Languages, FileText, CheckCircle2, ChevronRight, Star, Zap, Award, Play } from 'lucide-react';
import { AppView } from '../types';
import { useLanguage } from '../LanguageContext';
import { useUser } from '../UserContext';

interface DashboardProps {
  setView: (view: AppView) => void;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  color: string;
  bgColor: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, onClick, color, bgColor }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`relative glass-card rounded-2xl border-white/5 overflow-hidden cursor-pointer transition-all duration-300 group ${bgColor}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-16 translate-x-16 transition-all duration-500 group-hover:scale-150"></div>
      <div className="p-6 relative z-10">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
          {icon}
        </div>
        <h3 className="text-lg font-extrabold text-white mb-2 drop-shadow-[0_0_1px_rgba(255,255,255,0.5)]">{title}</h3>
        <p className="text-sm text-gray-400 mb-4">{description}</p>
        <div className="flex items-center text-xs font-mono text-gray-500 group-hover:text-white transition-colors">
          <span>ACCESS MODULE</span>
          <ChevronRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
      <div className={`absolute inset-0 bg-gradient-to-br ${color.replace('text-', 'from-').replace('-400', '-500/10')} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, value: string, label: string, change?: string, changeType?: 'positive' | 'negative' }> = ({ 
  icon, value, label, change, changeType 
}) => {
  return (
    <div className="glass-card p-5 rounded-2xl border-white/5 hover:border-orange-500/40 transition-all duration-300 group hover:-translate-y-1">
      <div className="flex justify-between items-start mb-3">
        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-orange-500/20 transition-colors">
          {icon}
        </div>
        {change && (
          <span className={`text-xs font-mono flex items-center gap-1 ${changeType === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
            <TrendingUp size={12} className={changeType === 'negative' ? 'rotate-180' : ''} /> {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-extrabold text-white mb-1 drop-shadow-[0_0_1px_rgba(255,255,255,0.5)]">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
};

const MissionCard: React.FC<{ label: string, progress: number, completed: boolean }> = ({ 
  label, progress, completed 
}) => {
  return (
    <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-lava/30 transition-all duration-300 cursor-pointer group">
      <div className="flex justify-between text-sm mb-2 text-gray-300 group-hover:text-white">
        <span className="font-medium flex items-center">
          {completed ? (
            <CheckCircle2 size={16} className="text-green-500 mr-2" />
          ) : (
            <div className="w-4 h-4 rounded-full border border-gray-500 mr-2 flex items-center justify-center">
              {progress > 0 && <div className="w-2 h-2 rounded-full bg-lava"></div>}
            </div>
          )}
          <span className="font-bold drop-shadow-[0_0_1px_rgba(255,255,255,0.3)]">{label}</span>
        </span>
        <span className="text-lava font-mono font-bold">{progress}%</span>
      </div>
      <div className="h-2 bg-black/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-lava to-amber-500 shadow-glow-sm transition-all duration-700 ease-out" 
          style={{width: `${progress}%`}}
        ></div>
      </div>
    </div>
  );
};

const ProgressRing: React.FC<{ progress: number, size?: number, strokeWidth?: number }> = ({ 
  progress, size = 120, strokeWidth = 8 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF4500" />
            <stop offset="100%" stopColor="#FFBF00" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-white drop-shadow-[0_0_1px_rgba(255,255,255,0.5)]">{progress}%</span>
        <span className="text-xs text-gray-500">COMPLETE</span>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const { t } = useLanguage();
  const { profile } = useUser();
  const [currentTime, setCurrentTime] = useState(new Date());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number>(0);
  const particleCount = 30;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mouse move handler for interactive particles
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Canvas animation loop for interactive background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize particles
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.3 + 0.1
      });
    }
    
    // Animation loop
    const animate = () => {
      if (!ctx) return;
      
      // Clear canvas with a semi-transparent overlay for trail effect
      ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const mouse = mousePosition.current;
      
      // Update and draw particles
      particles.forEach(particle => {
        // Calculate distance to mouse
        const dx = particle.x - mouse.x;
        const dy = particle.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Mouse interaction
        if (distance < 100) {
          // Repel particles when mouse is close
          const force = (100 - distance) / 1000;
          particle.speedX += (dx / distance) * force || 0;
          particle.speedY += (dy / distance) * force || 0;
        }
        
        // Apply friction
        particle.speedX *= 0.98;
        particle.speedY *= 0.98;
        
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Boundary checks with wrapping
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;
        
        // Draw particle with lava/orange gradient
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 2
        );
        gradient.addColorStop(0, `rgba(255, 69, 0, ${particle.opacity})`);
        gradient.addColorStop(1, `rgba(255, 69, 0, 0)`);
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
      
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    animationFrameId.current = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full auto-rows-min relative">
      {/* Interactive Canvas Background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-0"
        style={{ background: 'transparent' }}
      />
      
      {/* Welcome Banner */}
      <div className="lg:col-span-3 p-8 glass-card rounded-3xl relative overflow-hidden border-orange-500/20 group animate-fade-in z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lava/10 blur-[100px] rounded-full pointer-events-none animate-pulse-slow"></div>
        <div className="absolute top-10 left-10 w-24 h-24 bg-amber/10 blur-[60px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 animate-slide-up drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]">
                Welcome back, <span className="lava-text">{profile.name}</span>.
              </h1>
              <p className="text-gray-400 max-w-2xl text-lg mb-6 animate-slide-up animation-delay-200">
                Ready to continue your learning journey? Let's achieve today's goals together.
              </p>
              <div className="flex flex-wrap gap-4 animate-slide-up animation-delay-400">
                <button 
                  onClick={() => setView(AppView.TUTOR)}
                  className="px-6 py-3 bg-gradient-to-r from-lava to-amber-600 text-white font-bold rounded-lg shadow-glow hover:scale-105 transition-all duration-300 flex items-center group"
                >
                  <Play size={18} className="mr-2 group-hover:animate-pulse" />
                  Resume Learning
                </button>
                <button 
                  onClick={() => setView(AppView.QUIZ)}
                  className="px-6 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/10 flex items-center group"
                >
                  <Star size={18} className="mr-2 group-hover:text-yellow-400" />
                  Daily Challenge
                </button>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-mono font-extrabold text-white animate-pulse drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]">{formattedTime}</div>
              <div className="text-gray-500 text-sm">{currentTime.toDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:col-span-3 animate-fade-in-up z-10">
        <StatCard 
          icon={<Clock className="text-orange-400" size={24} />}
          value="24.5h"
          label="Study Time"
          change="+12%"
          changeType="positive"
        />
        <StatCard 
          icon={<Target className="text-amber-400" size={24} />}
          value="89%"
          label="Avg Score"
          change="STABLE"
        />
        <StatCard 
          icon={<BookOpen className="text-purple-400" size={24} />}
          value="12"
          label="Modules"
          change="+2"
          changeType="positive"
        />
        <StatCard 
          icon={<Award className="text-blue-400" size={24} />}
          value="128"
          label="Points"
          change="+15"
          changeType="positive"
        />
      </div>

      {/* Feature Cards */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in-up animation-delay-200 z-10">
        <FeatureCard 
          icon={<BrainCircuit className="text-blue-400" size={24} />}
          title="Chat Tutor"
          description="Interactive AI-powered tutoring for personalized learning"
          onClick={() => setView(AppView.TUTOR)}
          color="text-blue-400"
          bgColor="hover:border-blue-500/40"
        />
        <FeatureCard 
          icon={<Gamepad2 className="text-purple-400" size={24} />}
          title="Quiz Arena"
          description="Test your knowledge with gamified quizzes"
          onClick={() => setView(AppView.QUIZ)}
          color="text-purple-400"
          bgColor="hover:border-purple-500/40"
        />
        <FeatureCard 
          icon={<Languages className="text-green-400" size={24} />}
          title="Translator"
          description="Translate text between 20+ languages instantly"
          onClick={() => setView(AppView.TRANSLATE)}
          color="text-green-400"
          bgColor="hover:border-green-500/40"
        />
        <FeatureCard 
          icon={<FileText className="text-amber-400" size={24} />}
          title="File Analyzer"
          description="Analyze documents and extract key insights"
          onClick={() => setView(AppView.FILES)}
          color="text-amber-400"
          bgColor="hover:border-amber-500/40"
        />
      </div>

      {/* Progress Section */}
      <div className="flex flex-col gap-5 animate-fade-in-up animation-delay-400 z-10">
        <div className="glass-card p-6 rounded-2xl border-white/5 flex-1">
          <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2 drop-shadow-[0_0_1px_rgba(255,255,255,0.5)]">
            <Target size={18} className="text-lava" /> Weekly Progress
          </h3>
          <div className="flex justify-center py-2">
            <ProgressRing progress={76} />
          </div>
          <div className="text-center mt-4">
            <p className="text-gray-400 text-sm">3 days streak</p>
            <div className="flex justify-center mt-2">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div 
                  key={day} 
                  className={`w-2 h-2 rounded-full mx-0.5 ${day <= 3 ? 'bg-lava' : 'bg-gray-700'}`}
                ></div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-2xl border-white/5 flex-1">
          <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2 drop-shadow-[0_0_1px_rgba(255,255,255,0.5)]">
            <Zap size={18} className="text-lava" /> Daily Missions
          </h3>
          <div className="space-y-3">
            <MissionCard 
              label="Complete Hindi Verbs Module" 
              progress={75} 
              completed={false} 
            />
            <MissionCard 
              label="Practice Spanish Pronunciation" 
              progress={30} 
              completed={false} 
            />
            <MissionCard 
              label="Daily Knowledge Check" 
              progress={0} 
              completed={false} 
            />
          </div>
        </div>
      </div>

      {/* Course Progress */}
      <div className="lg:col-span-3 glass-card p-6 rounded-2xl border-white/5 animate-fade-in-up animation-delay-600 z-10">
        <h3 className="text-lg font-extrabold text-white mb-6 drop-shadow-[0_0_1px_rgba(255,255,255,0.5)]">{t('dashboard.courseProgress')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 p-4 rounded-xl">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Hindi Grammar</span>
              <span className="text-sm font-mono text-lava font-bold">82%</span>
            </div>
            <div className="h-2 bg-black/50 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-lava to-amber-500 w-[82%] shadow-glow-sm"></div>
            </div>
            <div className="text-xs text-gray-500">Module 5 of 6</div>
          </div>
          
          <div className="bg-white/5 p-4 rounded-xl">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">French Basics</span>
              <span className="text-sm font-mono text-lava font-bold">45%</span>
            </div>
            <div className="h-2 bg-black/50 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-lava to-amber-500 w-[45%] shadow-glow-sm"></div>
            </div>
            <div className="text-xs text-gray-500">Module 2 of 5</div>
          </div>
          
          <div className="bg-white/5 p-4 rounded-xl">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Sanskrit Slokas</span>
              <span className="text-sm font-mono text-lava font-bold">15%</span>
            </div>
            <div className="h-2 bg-black/50 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-lava to-amber-500 w-[15%] shadow-glow-sm"></div>
            </div>
            <div className="text-xs text-gray-500">Module 1 of 7</div>
          </div>
          
          <div className="bg-white/5 p-4 rounded-xl">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Physics: Quantum</span>
              <span className="text-sm font-mono text-lava font-bold">5%</span>
            </div>
            <div className="h-2 bg-black/50 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-lava to-amber-500 w-[5%] shadow-glow-sm"></div>
            </div>
            <div className="text-xs text-gray-500">Module 1 of 20</div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;