import React from 'react';
import {
  X,
  Tv,
  QrCode,
  Smartphone,
  PlayCircle,
  Award,
  Laptop,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Zap,
} from 'lucide-react';

interface BoothGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQR: () => void;
}

export const BoothGuideModal: React.FC<BoothGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenQR,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-indigo-200 overflow-hidden text-slate-800 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booth-guide-title"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Tv className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 id="booth-guide-title" className="text-lg sm:text-xl font-black leading-tight">
                วิธีนำแอปไปเปิดใช้งานจริงที่บูธ (TV Booth Deployment Guide)
              </h2>
              <p className="text-xs text-indigo-100">
                คู่มือการเชื่อมต่อจอทีวี 16:9 และให้นักศึกษาสแกนมือถือเข้าแข่งขัน
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-sm text-slate-700">
          {/* Quick Summary Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 border-2 border-indigo-200 flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-black text-indigo-950 text-base">
                โครงสร้างระบบ: 1 จอทีวีใหญ่ + โน้ตบุ๊กพี่บูธ + มือถือนักศึกษา 2 เครื่อง
              </h3>
              <p className="text-xs text-indigo-900 leading-relaxed">
                ระบบทำงานแบบ Real-time WebSocket: จอทีวีจะทำหน้าที่เป็นหน้าจอหลักฉายกลางบูธ ส่วนนักศึกษาทั้งสองฝ่ายจะสแกน QR Code แล้วถือมือถือของตนเองเป็นจอยคอนโทรลเลอร์จับคู่คำศัพท์
              </p>
            </div>
          </div>

          {/* 5-Step Setup Pipeline */}
          <div className="space-y-3.5">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5 hover:border-indigo-300 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-base shadow-sm">
                1
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-indigo-600" />
                  <span>ต่อสายโน้ตบุ๊กขึ้นจอทีวี (TV 16:9)</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  • นำโน้ตบุ๊กต่อสาย <strong>HDMI</strong> หรือ <strong>Wireless Display (Cast)</strong> เข้ากับจอทีวีของบูธ<br />
                  • ตั้งค่าการแสดงผลบน Windows/Mac เป็นแบบ <strong>Duplicate (แสดงหน้าจอเหมือนกัน)</strong> หรือ Second Screen Only<br />
                  • เปิดเบราว์เซอร์ (Chrome / Edge / Safari) แล้วกดปุ่ม <strong>[เต็มจอ (Fullscreen)]</strong> บนหัวเว็บ หรือกด <strong>F11</strong> เพื่อให้ภาพขยายเต็มจอทีวีแบบสวยงาม
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5 hover:border-indigo-300 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-base shadow-sm">
                2
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span>กดปุ่ม QR Code บนจอทีวีให้นักศึกษาสแกน</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  • กดปุ่ม <strong>"Scan QR (สแกนเล่น)"</strong> บนแถบเมนูด้านบน จะมีคิวอาร์โค้ดขนาดใหญ่ขึ้นมาบนจอทีวี<br />
                  • ให้นักศึกษา 2 คนที่มาบูธ ใช้กล้องมือถือ / Line / สแกนเนอร์ สแกน QR Code เข้ามาที่หน้ามือถือทันที (ไม่ต้องดาวน์โหลดแอป)<br />
                  • คนแรกพิมพ์ชื่อเล่นแล้วกดเลือก <strong>Team Blue (ฝั่งน้ำเงิน)</strong> คนที่สองเลือก <strong>Team Red (ฝั่งแดง)</strong>
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5 hover:border-indigo-300 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-base shadow-sm">
                3
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>ทั้งสองฝ่ายกดปุ่ม "READY / พร้อม" เกมถึงเริ่ม!</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  • บนมือถือของทั้งสองฝ่ายจะมีปุ่มขนาดใหญ่ <strong>"READY TO PLAY! (กดพร้อมเริ่มแข่ง)"</strong><br />
                  • เมื่อทั้งฝ่ายน้ำเงินและฝ่ายแดงกดพร้อมครบทั้งคู่ ระบบจะส่งสัญญาณนับถอยหลัง <strong>3... 2... 1... GO! 🚀</strong> บนจอทีวีและมือถือพร้อมกันทันที<br />
                  • (พี่บูธสามารถกด Spacebar หรือคลิก <em>Staff: Force Start</em> บนโน้ตบุ๊กได้เช่นกัน)
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5 hover:border-indigo-300 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-black flex items-center justify-center shrink-0 text-base shadow-sm">
                4
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-600" />
                  <span>แข่งขัน: คำศัพท์อยู่ในมือถือ จอทีวีแสดงคะแนนสปีดและเฉลยคู่ที่ถูก</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  • คำศัพท์ Verb และ Noun จะ<strong>แสดงเฉพาะบนจอมือถือ</strong>ของแต่ละคน เพื่อไม่ให้แอบดูคำตอบกัน<br />
                  • <strong>ตอบไวยิ่งได้คะแนนเยอะ</strong>: ระบบคิดคะแนนตามเวลาที่เหลือ (+50 ฐาน + 5 คะแนนต่อวินาทีที่เหลือ)<br />
                  • บนจอทีวีจะ<strong>เปิดเผยคำศัพท์เฉพาะคู่ที่ตอบถูกแล้วเท่านั้น</strong> พร้อมแสดงกล่องแสงสีเขียวและคะแนนโบนัสแบบเรียลไทม์
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5 hover:border-indigo-300 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white font-black flex items-center justify-center shrink-0 text-base shadow-sm">
                5
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Award className="w-4 h-4 text-rose-600" />
                  <span>สุ่มการ์ดพูดประโยค & แจกตราประทับ PASS!</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  • เมื่อจับคู่เสร็จ ระบบจะนำเข้าสู่หน้าสุ่มการ์ดคำศัพท์ (Pick a Card)<br />
                  • ให้นักศึกษาพูดประโยคภาษาอังกฤษที่มีคำ Collocation นั้นให้พี่บูธฟัง<br />
                  • พี่บูธกด <strong>Approve [A]</strong> บนโน้ตบุ๊ก → ระบบจะขึ้นหน้าจอ <strong>PASS!</strong> พร้อมพลุ Confetti ฉลอง ตราประทับมหาวิทยาลัย และของรางวัลประจำบูธ<br />
                  • กด <strong>Next Player [N]</strong> เพื่อรีเซ็ตพร้อมรับนักศึกษาคู่ต่อไปได้ทันที!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              onClose();
              onOpenQR();
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>เปิดหน้าจอ QR Code ให้นักศึกษาสแกน</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
          >
            เข้าใจแล้ว (ปิดหน้าต่าง)
          </button>
        </div>
      </div>
    </div>
  );
};
