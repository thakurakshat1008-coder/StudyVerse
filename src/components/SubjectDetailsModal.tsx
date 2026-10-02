import React from 'react';
import { X, BookOpen, CheckCircle, FileText, Sparkles, ArrowRight } from 'lucide-react';

interface Props {
  subject: {
    name: string;
    chapters: string;
    icon: React.ReactNode;
    color: string;
    borderColor: string;
    details: string[];
  } | null;
  onClose: () => void;
  onOpenWhatsApp: () => void;
}

export const SubjectDetailsModal: React.FC<Props> = ({ subject, onClose, onOpenWhatsApp }) => {
  if (!subject) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${subject.color} ${subject.borderColor} border`}>
              {subject.icon}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{subject.name}</h3>
              <p className="text-xs text-slate-400">Class 9 CBSE • {subject.chapters}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div>
            <h4 className="font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Key Topics & Syllabus</span>
            </h4>
            <div className="space-y-2">
              {subject.details.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-slate-300">{item}</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono">CBSE 2026-27</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-slate-300">
            <p className="font-semibold text-cyan-300 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Need Doubt Solving & Sample Papers?</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Join our exclusive StudySync WhatsApp Community with verified Class 9 toppers & teachers.
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenWhatsApp();
              }}
              className="mt-2.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <span>Unlock WhatsApp Community Access</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
