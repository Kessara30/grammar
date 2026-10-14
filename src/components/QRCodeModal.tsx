import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Smartphone, Users, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectedPlayersCount: number;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  connectedPlayersCount,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [joinUrl, setJoinUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/?role=player`;
      setJoinUrl(url);

      QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1e1b4b', // deep indigo
          light: '#ffffff',
        },
      })
        .then((dataUrl) => setQrDataUrl(dataUrl))
        .catch(() => {});
    }
  }, []);

  const handleCopy = () => {
    if (!joinUrl) return;
    navigator.clipboard?.writeText(joinUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-indigo-200 overflow-hidden text-slate-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-modal-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="qr-modal-title" className="text-lg font-black leading-tight">
                Scan to Join & Play!
              </h2>
              <p className="text-xs text-indigo-100">
                สแกนคิวอาร์โค้ดเพื่อเข้าเล่นบนมือถือ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Display */}
        <div className="p-6 text-center space-y-4">
          <div className="p-4 bg-slate-50 border-2 border-indigo-100 rounded-3xl inline-block shadow-inner">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code to Join"
                className="w-56 h-56 sm:w-64 sm:h-64 mx-auto rounded-2xl shadow-xs"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400">
                Generating QR...
              </div>
            )}
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200 mb-1">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>{connectedPlayersCount} Mobile Player(s) Connected</span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Participants scan with their phone camera to pick Team Blue or Team Red and match collocations in real time!
            </p>
          </div>

          {/* Join Link & Copy Button */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <input
              type="text"
              readOnly
              value={joinUrl}
              className="bg-transparent text-slate-700 w-full outline-hidden font-mono text-[11px] truncate px-1"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              title="Copy link"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="pt-1 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
            <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
            <span>Works on any iOS or Android phone with camera or browser</span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            Close & Show on TV (ปิดหน้าต่างและแสดงบนทีวี)
          </button>
        </div>
      </div>
    </div>
  );
};
