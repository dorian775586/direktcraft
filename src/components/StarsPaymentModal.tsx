import React, { useState } from 'react';
import { X, Check, ShieldCheck } from 'lucide-react';
import { purchaseRemoveWatermarkWithStars } from '../utils/telegram';

interface StarsPaymentModalProps {
  isOpen: boolean;
  isProUnlocked: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
  onResetToFree: () => void;
}

export const TelegramStarIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${className} shrink-0`}>
    <defs>
      <linearGradient id="tgStarGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFE066" />
        <stop offset="50%" stopColor="#FFB800" />
        <stop offset="100%" stopColor="#F58200" />
      </linearGradient>
    </defs>
    <path
      d="M12 1.8L15.05 8.12L22 9.08L16.92 13.94L18.18 20.85L12 17.52L5.82 20.85L7.08 13.94L2 9.08L8.95 8.12L12 1.8Z"
      fill="url(#tgStarGrad)"
    />
  </svg>
);

export const StarsPaymentModal: React.FC<StarsPaymentModalProps> = ({
  isOpen,
  isProUnlocked,
  onClose,
  onUnlockSuccess,
  onResetToFree,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayClick = () => {
    setIsProcessing(true);
    // Optional real invoice link from env if connected to Telegram Bot API createInvoiceLink
    const invoiceUrl = import.meta.env.VITE_TELEGRAM_STARS_INVOICE_URL as string | undefined;

    purchaseRemoveWatermarkWithStars(invoiceUrl, (status) => {
      setIsProcessing(false);
      if (status === 'paid') {
        onUnlockSuccess();
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md bg-[#16161C] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[92dvh] sm:max-h-[88vh] overflow-y-auto my-auto animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center">
            <TelegramStarIcon className="w-7 h-7" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-zinc-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h2 className="text-xl font-bold text-white mt-4">Чистый скриншот без водяного знака</h2>
        <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
          Оплатите доступ через <span className="text-zinc-200 font-medium">Telegram Stars</span>, чтобы
          скачивать кристалльно чистые Retina-скриншоты Instagram Direct 1-в-1 как на iPhone.
        </p>

        <div className="mt-5 space-y-2.5 p-4 rounded-2xl bg-[#1E1E26] border border-white/[0.06]">
          <div className="flex items-center gap-2.5 text-sm text-zinc-200">
            <Check className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Полное удаление водяного знака со всех скриншотов</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-zinc-200">
            <Check className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Экспорт в высоком разрешении iOS Retina (@3x PNG)</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-zinc-200">
            <Check className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Безлимитные диалоги со своими персонажами</span>
          </div>
        </div>

        {!isProUnlocked ? (
          <div className="mt-6 space-y-3">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handlePayClick}
              className="w-full min-h-[50px] px-5 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-[#EA580C] hover:brightness-110 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15 transition-all cursor-pointer whitespace-nowrap"
            >
              <TelegramStarIcon className="w-5 h-5" />
              <span>
                {isProcessing
                  ? 'Вызов Telegram.WebApp.openInvoice...'
                  : 'Убрать водяной знак за 39 звезд'}
              </span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
              <span>Безопасная оплата через Telegram WebApp Invoice API</span>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300 text-center font-medium">
              PRO-режим активен — водяной знак отключен
            </div>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onResetToFree}
                className="min-h-[44px] flex-1 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
              >
                Вернуть тест-водяной знак
              </button>
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] flex-1 px-4 rounded-xl bg-[#0095F6] hover:bg-[#0081D6] text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Готово
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
