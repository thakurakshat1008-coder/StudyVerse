import React, { useState } from 'react';
import { X, Send, Bot, Sparkles, User, BookOpen } from 'lucide-react';
import neevMascot from '../assets/images/neev_ai_mascot_1790954131870.jpg';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'neev';
  text: string;
  time: string;
}

export const NeevAIChatModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'neev',
      text: "Namaste Akshat! I'm NEEV AI, your personal Class 9 CBSE study companion. How can I help you prepare for tomorrow's Biology exam or practice Mathematics today?",
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: q.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    setTimeout(() => {
      let reply = "That's a great Class 9 question! Keep practicing this concept with sample papers.";
      const lower = q.toLowerCase();

      if (lower.includes('biology') || lower.includes('cell') || lower.includes('tissue')) {
        reply = "For Biology: Remember that Mitochondria is the powerhouse of the cell (generates ATP), while Plant cells have a rigid cellulose cell wall and plastids (chloroplasts) for photosynthesis! Review Chapter 5 & 6 diagrams before your exam.";
      } else if (lower.includes('math') || lower.includes('polynomial') || lower.includes('geometry')) {
        reply = "For Mathematics: Recall the Remainder Theorem and Factor Theorem in Polynomials. In Coordinate Geometry, remember the signs: Quadrant I (+,+), II (-,+), III (-,-), IV (+,-).";
      } else if (lower.includes('whatsapp') || lower.includes('community') || lower.includes('group')) {
        reply = "You can join our exclusive StudySync WhatsApp Community using your verified single-device activation key! Click the 'Join WhatsApp Community' button on the dashboard.";
      } else if (lower.includes('exam') || lower.includes('score') || lower.includes('rank')) {
        reply = "You're currently Rank #2 on the Section Leaderboard with 92%! Consistent revision and solving NCERT exemplar questions will help you reach #1!";
      }

      const botMsg: Message = {
        sender: 'neev',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setThinking(false);
    }, 700);
  };

  const samplePrompts = [
    'Quick revision for Biology exam',
    'Class 9 Science cell theory summary',
    'Polynomial formulas for Mathematics',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[520px]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={neevMascot}
                alt="NEEV AI"
                className="w-10 h-10 rounded-xl object-cover border border-cyan-400/40 shadow-sm shadow-cyan-500/20"
              />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white">NEEV AI Assistant</h3>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Class 9 CBSE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Always here to help you learn & excel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'neev' && (
                <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none shadow-sm'
                }`}
              >
                <p>{m.text}</p>
                <span
                  className={`text-[9px] mt-1 block ${
                    m.sender === 'user' ? 'text-slate-900/70 text-right' : 'text-slate-400'
                  }`}
                >
                  {m.time}
                </span>
              </div>
              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {thinking && (
            <div className="flex items-center gap-2 text-cyan-400 text-xs py-1">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>NEEV AI is preparing your explanation...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 flex items-center gap-1.5 overflow-x-auto">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] whitespace-nowrap border border-slate-700/80 transition-colors flex items-center gap-1 shrink-0"
            >
              <BookOpen className="w-3 h-3 text-cyan-400" />
              <span>{p}</span>
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask NEEV AI any concept, formula, or exam question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-slate-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
