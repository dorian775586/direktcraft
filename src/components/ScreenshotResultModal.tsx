import React from 'react';
import { Download, X } from 'lucide-react';
import { TelegramStarIcon } from './StarsPaymentModal';

interface ScreenshotResultModalProps {
  imageDataUrl: string | null;
  filename: string;
  isProUnlocked: boolean;
  onClose: () => void;
  onOpenStarsModal: () => void;
}

export const ScreenshotResultModal: React.FC<ScreenshotResultModalProps> = ({
  imageDataUrl,
  filename,
  isProUnlocked,
  onClose,
  onOpenStarsModal,
}) => {
  if (!imageDataUrl) return null;

  const handleDownloadAgain = () => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = imageDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#141418] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[92dvh] flex flex-col">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">Скриншот готов</h2>
            <p className="text-xs text-zinc-400">
              Захвачена только область переписки (без элементов Telegram)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-zinc-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Captured Image Preview */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-black border border-white/10 p-2 flex items-center justify-center min-h-0">
          <img
            src={imageDataUrl}
            alt="Готовый скриншот Instagram Direct"
            className="max-h-[54dvh] w-auto rounded-xl object-contain shadow-lg"
          />
        </div>

        <p className="text-[11px] text-zinc-400 text-center mt-2.5 shrink-0">
          На iPhone/Android в Telegram можно также зажать изображение пальцем и выбрать «Сохранить в Фото».
        </p>

        <div className="mt-3 flex flex-col gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadAgain}
            className="w-full min-h-[46px] px-4 rounded-xl bg-[#0095F6] hover:bg-[#0081D6] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Скачать PNG файл
          </button>

          {!isProUnlocked && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenStarsModal();
              }}
              className="w-full min-h-[44px] px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/35 text-amber-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <TelegramStarIcon className="w-4 h-4" />
              Убрать водяной знак за 39 звезд
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
