import React, { useState } from 'react';
import {
  GraduationCap,
  Bell,
  Search,
  ChevronDown,
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
  Trophy,
  CheckCircle2,
  Circle,
  Brain,
  Target,
  BarChart3,
  User,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Send,
  Heart,
  Compass,
  Cpu,
  Layers,
  Flame,
  Globe,
  FlaskConical,
  Calculator,
  Languages,
  BookMarked,
  Sun,
  Moon,
  Clock,
} from 'lucide-react';
import heroImg from '../assets/images/studysync_hero_study_1790954109119.jpg';
import mascotImg from '../assets/images/neev_ai_mascot_1790954131870.jpg';
import avatarImg from '../assets/images/avatar_akshat_student_1790954157734.jpg';
import bannerImg from '../assets/images/studysync_bottom_banner_1790954179347.jpg';
import { NeevAIChatModal } from './NeevAIChatModal.tsx';
import { SubjectDetailsModal } from './SubjectDetailsModal.tsx';

interface Props {
  onOpenGateway: () => void;
  onOpenAdmin: () => void;
}

export const StudySyncDashboard: React.FC<Props> = ({ onOpenGateway, onOpenAdmin }) => {
  const [activeNav, setActiveNav] = useState('Home');
  const [isNeevChatOpen, setIsNeevChatOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<{
    name: string;
    chapters: string;
    icon: React.ReactNode;
    color: string;
    borderColor: string;
    details: string[];
  } | null>(null);

  const subjects = [
    {
      name: 'Mathematics',
      chapters: '8 Chapters',
      icon: <Calculator className="w-5 h-5 text-cyan-400" />,
      color: 'bg-cyan-500/10 text-cyan-400',
      borderColor: 'border-cyan-500/30',
      details: [
        'Chapter 1: Number Systems',
        'Chapter 2: Polynomials (Factor Theorem)',
        'Chapter 3: Coordinate Geometry',
        'Chapter 4: Linear Equations in Two Variables',
        'Chapter 6: Lines and Angles',
        'Chapter 7: Triangles & Congruence',
      ],
    },
    {
      name: 'Science',
      chapters: '8 Chapters',
      icon: <FlaskConical className="w-5 h-5 text-emerald-400" />,
      color: 'bg-emerald-500/10 text-emerald-400',
      borderColor: 'border-emerald-500/30',
      details: [
        'Chapter 1: Matter in Our Surroundings',
        'Chapter 5: The Fundamental Unit of Life (Cell)',
        'Chapter 6: Tissues (Meristematic & Permanent)',
        'Chapter 7: Motion & Velocity Graphs',
        'Chapter 8: Force and Laws of Motion',
      ],
    },
    {
      name: 'Social Science',
      chapters: '8 Chapters',
      icon: <Globe className="w-5 h-5 text-amber-400" />,
      color: 'bg-amber-500/10 text-amber-400',
      borderColor: 'border-amber-500/30',
      details: [
        'History: The French Revolution',
        'Geography: India - Size and Location',
        'Geography: Physical Features of India',
        'Civics: What is Democracy? Why Democracy?',
        'Economics: The Story of Village Palampur',
      ],
    },
    {
      name: 'English',
      chapters: 'Before Mid-Term',
      icon: <BookOpen className="w-5 h-5 text-purple-400" />,
      color: 'bg-purple-500/10 text-purple-400',
      borderColor: 'border-purple-500/30',
      details: [
        'Beehive: The Fun They Had',
        'Beehive: The Sound of Music',
        'Poem: The Road Not Taken',
        'Moments: The Lost Child',
        'Grammar: Tenses & Modals Practice',
      ],
    },
    {
      name: 'Hindi',
      chapters: 'Before Mid-Term',
      icon: <Languages className="w-5 h-5 text-pink-400" />,
      color: 'bg-pink-500/10 text-pink-400',
      borderColor: 'border-pink-500/30',
      details: [
        'Kshitij: Do Bailon ki Katha',
        'Kshitij: Lhasa ki Aur',
        'Kavya: Sakhiyan evam Sabad',
        'Vyakaran: Upsarg evam Pratyay',
      ],
    },
    {
      name: 'Sanskrit',
      chapters: 'All Chapters',
      icon: <BookMarked className="w-5 h-5 text-teal-400" />,
      color: 'bg-teal-500/10 text-teal-400',
      borderColor: 'border-teal-500/30',
      details: [
        'Chapter 1: Bharati Vasant Gitih',
        'Chapter 2: Swarnakakah',
        'Chapter 3: Somprabham',
        'Shabda Roop & Dhatu Roop Sandhi',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-[#090e18]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Left */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">StudySync</span>
              <span className="hidden sm:inline text-xs text-slate-400 font-medium">
                Learn • Practice • Grow
              </span>
            </div>
          </div>

          {/* Navigation Links Center */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
            {['Home', 'Subjects', 'Resources', 'AI Assistant', 'Performance', 'Leaderboard'].map(
              (item) => (
                <button
                  key={item}
                  onClick={() => {
                    setActiveNav(item);
                    if (item === 'AI Assistant') setIsNeevChatOpen(true);
                  }}
                  className={`px-3.5 py-2 rounded-lg transition-all relative ${
                    activeNav === item
                      ? 'text-cyan-400 font-bold bg-cyan-950/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {item}
                  {activeNav === item && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-cyan-400 rounded-full"></span>
                  )}
                </button>
              )
            )}
          </nav>

          {/* Actions & Profile Right */}
          <div className="flex items-center gap-3">
            {/* WhatsApp VIP Community Button */}
            <button
              onClick={onOpenGateway}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-500/10 cursor-pointer"
              title="Unlock WhatsApp Community with Key"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Join WhatsApp Group</span>
            </button>

            {/* Admin Console Quick Link */}
            <button
              onClick={onOpenAdmin}
              className="hidden sm:flex px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Admin</span>
            </button>

            {/* Notification Bell */}
            <div className="relative cursor-pointer p-1.5 text-slate-400 hover:text-slate-200 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <img
                src={avatarImg}
                alt="Akshat"
                className="w-8 h-8 rounded-full object-cover border border-cyan-400/50 shadow-sm"
              />
              <div className="hidden sm:block text-left text-xs leading-tight">
                <span className="font-bold text-slate-100 block">Akshat</span>
                <span className="text-[11px] text-slate-400">Class 9</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Main Content (8 cols on large screens) */}
        <div className="lg:col-span-8 space-y-6">
          {/* HERO BANNER SECTION */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-[#0d1424] shadow-2xl min-h-[360px] sm:min-h-[420px] flex flex-col justify-end p-6 sm:p-10">
            {/* Background Anime Illustration */}
            <img
              src={heroImg}
              alt="StudySync Midnight Study Room"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-70"
            />
            {/* Gradient Overlays for readability and mood */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b13] via-[#070b13]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#070b13]/90 via-[#070b13]/40 to-transparent" />

            {/* Hero Content */}
            <div className="relative z-10 max-w-xl space-y-3.5">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 backdrop-blur-md text-[11px] text-slate-300 font-semibold shadow-sm">
                <span>CM SHRI Schools</span>
                <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
                <span>Class 9</span>
                <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
                <span className="text-cyan-300">2026-27</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Your Journey to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
                  Better Learning
                </span>{' '}
                Starts Here
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-lg">
                StudySync is your AI-powered learning platform designed for Class 9 CBSE students. Get
                study materials, practice questions, track your progress and achieve more — with the
                power of <strong>NEEV AI</strong>.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsNeevChatOpen(true)}
                  className="px-5 py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-400/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Start Learning</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={onOpenGateway}
                  className="px-5 py-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer backdrop-blur-sm"
                >
                  <span>Join WhatsApp Community</span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              </div>

              {/* Micro copy quote */}
              <div className="pt-1 text-[11px] text-cyan-300/80 italic font-mono flex items-center gap-1.5">
                <span>Small steps → Big Dreams ✨</span>
              </div>
            </div>
          </div>

          {/* QUICK ACCESS SUBJECTS SECTION */}
          <div className="space-y-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Quick Access</span>
              </h2>
              <p className="text-xs text-slate-400">Jump into your subjects and start learning instantly.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {subjects.map((sub) => (
                <div
                  key={sub.name}
                  onClick={() => setSelectedSubject(sub)}
                  className="p-3.5 rounded-2xl bg-[#0d1424] hover:bg-[#121c32] border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group flex flex-col justify-between h-28 shadow-md"
                >
                  <div
                    className={`w-9 h-9 rounded-xl ${sub.color} ${sub.borderColor} border flex items-center justify-center`}
                  >
                    {sub.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
                      {sub.name}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                      <span className="truncate">{sub.chapters}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WHY STUDY SYNC? SECTION */}
          <div className="space-y-3">
            <div>
              <h2 className="text-base font-bold text-white">Why StudySync?</h2>
              <p className="text-xs text-slate-400">Everything you need to excel, in one place.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-[#0d1424] border border-slate-800 flex flex-col justify-between">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">AI-Powered Learning</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Get instant explanations, notes, and summaries with NEEV AI.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0d1424] border border-slate-800 flex flex-col justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Practice & Improve</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Solve exercises, PYQs & sample papers with smart question sets.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0d1424] border border-slate-800 flex flex-col justify-between">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Track Your Growth</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Monitor progress, completion rate and performance analytics.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0d1424] border border-slate-800 flex flex-col justify-between">
                <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-3">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Personalized Experience</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Custom dashboard, reminders, themes and more — just for you.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM WIDE ARTWORK BANNER */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#0d1424] shadow-xl p-5 flex items-center justify-between min-h-[90px]">
            <img
              src={bannerImg}
              alt="Learn Today Lead Tomorrow"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#070b13]/90 via-[#070b13]/60 to-[#070b13]/80" />

            <div className="relative z-10 flex items-center gap-3">
              <img
                src={avatarImg}
                alt="Student"
                className="w-11 h-11 rounded-full object-cover border-2 border-cyan-400 shadow-md"
              />
              <div>
                <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                  <span>Learn Today, Lead Tomorrow</span>
                  <span>👑</span>
                </span>
                <span className="text-[10px] text-cyan-300 font-mono block">
                  Official CBSE Class 9 Study Platform
                </span>
              </div>
            </div>

            <div className="relative z-10 hidden md:flex items-center gap-2 text-[10px] font-mono font-bold text-slate-300 tracking-wider">
              <span>LEARN</span>
              <span className="text-cyan-400">/</span>
              <span>PRACTICE</span>
              <span className="text-cyan-400">/</span>
              <span>ANALYSE</span>
              <span className="text-cyan-400">/</span>
              <span>REVISE</span>
              <span className="text-cyan-400">/</span>
              <span>ADVANCE</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar Widgets (4 cols on large screens) */}
        <div className="lg:col-span-4 space-y-4">
          {/* WIDGET 1: MEET NEEV AI */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0e172a] to-[#0a1020] border border-cyan-500/30 shadow-xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Meet NEEV AI ✨</span>
                </div>
                <h3 className="text-sm font-bold text-white">Your Personal Study Assistant</h3>
                <p className="text-[11px] text-slate-300/80 leading-relaxed">
                  Always here to help you solve doubts, explain CBSE concepts, and practice exams.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setIsNeevChatOpen(true)}
                    className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md shadow-cyan-400/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Chat Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="shrink-0 relative">
                <img
                  src={mascotImg}
                  alt="NEEV AI Mascot"
                  className="w-20 h-20 rounded-2xl object-cover border border-cyan-400/40 shadow-lg shadow-cyan-500/20"
                />
              </div>
            </div>
          </div>

          {/* WIDGET 2: YOUR PROGRESS */}
          <div className="p-5 rounded-3xl bg-[#0d1424] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Your Progress</span>
              <span className="text-[10px] font-mono text-cyan-400">Term 1 Prep</span>
            </div>

            <div className="flex items-center gap-4">
              {/* Circular Gauge */}
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-cyan-400"
                    strokeDasharray="68, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-mono font-extrabold text-sm text-white">68%</span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-100 block">Overall Completion</span>
                <span className="text-[11px] text-cyan-300 font-medium">Keep going! ♥</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 italic text-center font-serif">
              &ldquo;Success is the sum of small efforts, repeated daily.&rdquo; 🏔️
            </div>
          </div>

          {/* WIDGET 3: UPCOMING EXAMS */}
          <div className="p-5 rounded-3xl bg-[#0d1424] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200">Upcoming Exams</span>
              </div>
              <button className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors">
                View All →
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300 flex items-center justify-center">
                    हि
                  </span>
                  <span className="text-slate-300 font-medium">Hindi</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <span>23 Sep 2026</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>

              {/* Biology - TODAY HIGHLIGHT */}
              <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-cyan-500 text-[10px] font-bold text-slate-950 flex items-center justify-center">
                    🧬
                  </span>
                  <span className="text-white font-bold">Biology</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-300 text-[11px] font-mono">24 Sep 2026</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                    Today
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300 flex items-center justify-center">
                    🌍
                  </span>
                  <span className="text-slate-300 font-medium">SST</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <span>26 Sep 2026</span>
                  <Circle className="w-3 h-3 text-slate-600" />
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300 flex items-center justify-center">
                    📖
                  </span>
                  <span className="text-slate-300 font-medium">English</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <span>28 Sep 2026</span>
                  <Circle className="w-3 h-3 text-slate-600" />
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300 flex items-center justify-center">
                    📐
                  </span>
                  <span className="text-slate-300 font-medium">Mathematics</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <span>30 Sep 2026</span>
                  <Circle className="w-3 h-3 text-slate-600" />
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-cyan-400 font-semibold flex items-center justify-between">
              <span>🚀 You can do it!</span>
              <Send className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* WIDGET 4: SECTION LEADERBOARD */}
          <div className="p-5 rounded-3xl bg-[#0d1424] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">Section Leaderboard</span>
              </div>
              <button className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors">
                View All →
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {/* Rank 1 */}
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 font-mono font-bold text-amber-400 text-center">1</span>
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-[11px] font-bold flex items-center justify-center text-slate-300">
                    RS
                  </div>
                  <span className="text-slate-200 font-medium">Riya Sharma</span>
                </div>
                <span className="font-mono font-bold text-cyan-400">98%</span>
              </div>

              {/* Rank 2 - AKSHAT THAKUR (CURRENT USER HIGHLIGHT) */}
              <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/50 shadow-md shadow-cyan-500/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 font-mono font-bold text-cyan-300 text-center">2</span>
                  <img
                    src={avatarImg}
                    alt="Akshat"
                    className="w-6 h-6 rounded-full object-cover border border-cyan-400"
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold">Akshat Thakur</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500 text-slate-950 font-black uppercase">
                      You
                    </span>
                  </div>
                </div>
                <span className="font-mono font-extrabold text-cyan-300">92%</span>
              </div>

              {/* Rank 3 */}
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 font-mono font-bold text-slate-400 text-center">3</span>
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-[11px] font-bold flex items-center justify-center text-slate-300">
                    AS
                  </div>
                  <span className="text-slate-300 font-medium">Ananya Singh</span>
                </div>
                <span className="font-mono font-bold text-slate-300">88%</span>
              </div>

              {/* Rank 4 */}
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 font-mono font-bold text-slate-400 text-center">4</span>
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-[11px] font-bold flex items-center justify-center text-slate-300">
                    AV
                  </div>
                  <span className="text-slate-300 font-medium">Aarav Verma</span>
                </div>
                <span className="font-mono font-bold text-slate-300">85%</span>
              </div>

              {/* Rank 5 */}
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 font-mono font-bold text-slate-400 text-center">5</span>
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-[11px] font-bold flex items-center justify-center text-slate-300">
                    SP
                  </div>
                  <span className="text-slate-300 font-medium">Sneha Patel</span>
                </div>
                <span className="font-mono font-bold text-slate-300">82%</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-amber-400/90 font-medium flex items-center gap-1.5 justify-center">
              <span>🏆 Top 10 from all sections</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#090e18] py-4 text-xs text-slate-400 mt-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[11px]">
            <span>📖 Powered by CBSE + NCERT + Edudel</span>
            <span className="hidden sm:inline">•</span>
            <span>📍 CM SHRI Schools</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-slate-400" />
              <div className="w-7 h-4 bg-cyan-500 rounded-full relative p-0.5 cursor-pointer">
                <div className="w-3 h-3 bg-slate-950 rounded-full ml-auto"></div>
              </div>
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-medium text-slate-300">Dark Mode</span>
            </div>
            <span>•</span>
            <span>© StudySync | 2026–27 ♥</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <NeevAIChatModal isOpen={isNeevChatOpen} onClose={() => setIsNeevChatOpen(false)} />
      <SubjectDetailsModal
        subject={selectedSubject}
        onClose={() => setSelectedSubject(null)}
        onOpenWhatsApp={onOpenGateway}
      />
    </div>
  );
};
