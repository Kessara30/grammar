import React from 'react';
import { X, Keyboard, Laptop, Tv, Sparkles } from 'lucide-react';

interface StaffShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StaffShortcutsModal: React.FC<StaffShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-indigo-200 overflow-hidden text-slate-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <div className="bg-slate-900 text-white px-6 py-4.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 id="shortcuts-title" className="text-lg font-bold text-white leading-tight">
                Laptop Staff Keyboard Shortcuts
              </h2>
              <p className="text-xs text-slate-300">
                คีย์ลัดสำหรับเจ้าหน้าที่คุมบูธผ่านแล็ปท็อปที่ต่อกับจอทีวี
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm">
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 font-medium">
            <Laptop className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Connected to 16:9 TV? Use these hotkeys on your laptop to operate the booth effortlessly without touching the mouse!
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-semibold text-slate-900">
                Primary Action (Start / Draw Card / Confirm / Use Card)
              </div>
              <kbd className="px-3 py-1 rounded-lg bg-white border-2 border-slate-300 font-mono text-xs font-bold shadow-xs">
                Space / Enter
              </kbd>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-semibold text-slate-900">
                Approve Sentence (Step 4 PASS)
              </div>
              <kbd className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 border-2 border-emerald-300 font-mono text-xs font-bold shadow-xs">
                P
              </kbd>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-semibold text-slate-900">
                Retry Matching / Try Again Sentence
              </div>
              <kbd className="px-3 py-1 rounded-lg bg-amber-100 text-amber-900 border-2 border-amber-300 font-mono text-xs font-bold shadow-xs">
                R
              </kbd>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-semibold text-slate-900">
                Next Player Reset (Step 5)
              </div>
              <kbd className="px-3 py-1 rounded-lg bg-indigo-100 text-indigo-900 border-2 border-indigo-300 font-mono text-xs font-bold shadow-xs">
                N
              </kbd>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-semibold text-slate-900">
                Toggle Fullscreen 16:9 TV Mode
              </div>
              <kbd className="px-3 py-1 rounded-lg bg-white border-2 border-slate-300 font-mono text-xs font-bold shadow-xs">
                F
              </kbd>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-semibold text-slate-900">
                Toggle Sound Effects
              </div>
              <kbd className="px-3 py-1 rounded-lg bg-white border-2 border-slate-300 font-mono text-xs font-bold shadow-xs">
                M
              </kbd>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-semibold text-slate-900">
                Show QR Code Modal for Phone Players
              </div>
              <kbd className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 border-2 border-emerald-300 font-mono text-xs font-bold shadow-xs">
                Q
              </kbd>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            Got it (เข้าใจแล้ว)
          </button>
        </div>
      </div>
    </div>
  );
};
