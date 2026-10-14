import React from 'react';
import { X, CheckCircle2, Clock, Sparkles, MessageSquare, Award } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <h2 id="modal-title" className="text-lg font-bold">
              Activity Booth Rules & Guide
            </h2>
            <p className="text-xs text-indigo-100">กติกาการเล่นกิจกรรมประจำบูธภาษาอังกฤษ</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close rules"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-sm text-slate-600">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-rose-50 border border-indigo-200 text-xs font-semibold text-slate-800">
            <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-black text-[10px]">NEW</span>
            <span>2-Team Battle Mode: Team Blue (น้ำเงิน) vs Team Red (แดง) แข่งประลองความเร็ว 30 วินาทีพร้อมกันบนจอทีวี!</span>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-sm">
              1
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                Step 1: Match 6 Pairs in 30 Seconds
              </h3>
              <p className="text-xs mt-1 text-slate-600">
                Click <strong>Start Challenge</strong> to begin. Pair each verb (e.g., MAKE, DO, TAKE) with the correct noun within 30 seconds.
              </p>
              <p className="text-[11px] text-indigo-700 mt-0.5">
                (จับคู่คำกริยากับคำนามที่เข้าคู่กันให้ครบทั้ง 6 คู่ภายใน 30 วินาที)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0 font-bold text-sm">
              2
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-slate-700" />
                Step 2: Booth Staff Check
              </h3>
              <p className="text-xs mt-1 text-slate-600">
                Booth staff reviews your 6 completed collocations and presses <strong>Confirm & Continue</strong>.
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                (พี่ประจำบูธตรวจสอบความถูกต้องและกดยืนยันเพื่อไปต่อ)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-50/70 border border-violet-100">
            <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0 font-bold text-sm">
              3
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-violet-600" />
                Step 3: Draw a Collocation Card
              </h3>
              <p className="text-xs mt-1 text-slate-600">
                Draw one random challenge card from the 7 possible collocations.
              </p>
              <p className="text-[11px] text-violet-700 mt-0.5">
                (สุ่มจับการ์ดคำศัพท์ 1 ใบจากทั้งหมด 7 ใบ)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/70 border border-amber-100">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 font-bold text-sm">
              4
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                Step 4: Speak or Type a Complete Sentence
              </h3>
              <p className="text-xs mt-1 text-slate-600">
                Say or type a complete English sentence using your drawn card. Any suitable tense is accepted! Staff will review and approve.
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                (แต่งประโยคภาษาอังกฤษให้สมบูรณ์ จะพูดกับพี่ที่บูธหรือพิมพ์ลงระบบก็ได้ ใช้ Tense ใดก็ได้ที่ถูกต้อง)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-sm">
              5
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                Step 5: PASS & Collect Your Stamp!
              </h3>
              <p className="text-xs mt-1 text-slate-600">
                Receive your digital booth stamp, claim your souvenir reward, and pass to the next player!
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                (ผ่านด่านสำเร็จ รับตราประทับสะสมแต้มและของรางวัลจากบูธ)
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm"
          >
            Got it, Let's Play! (เข้าใจแล้ว เริ่มเลย)
          </button>
        </div>
      </div>
    </div>
  );
};
