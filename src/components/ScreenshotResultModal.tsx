import React, { useState, useEffect } from 'react';
import { Download, X, Share2, Copy, Check } from 'lucide-react';
import { TelegramStarIcon } from './StarsPaymentModal';
import { downloadImageFile, shareOrSaveImage, copyImageToClipboard, createBlobUrlFromDataUrl } from '../utils/download';

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
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (imageDataUrl) {
      try {
        const url = createBlobUrlFromDataUrl(imageDataUrl);
        setBlobUrl(url);
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch {
        setBlobUrl(imageDataUrl);
      }
    }
  }, [imageDataUrl]);

  if (!imageDataUrl) return null;

  const handleDownload = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    await shareOrSaveImage(imageDataUrl, filename);
  };

  const handleShare = async () => {
    await shareOrSaveImage(imageDataUrl, filename);
  };

  const handleCopy = async () => {
    const success = await copyImageToClipboard(imageDataUrl);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-xs p-0 sm:p-4 touch-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md bg-[#141418] border border-white/10 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl max-h-[92dvh] sm:max-h-[88vh] flex flex-col my-auto animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2.5 shrink-0 touch-none">
          <div>
            <h2 className="text-base font-bold text-white">Скриншот готов</h2>
            <p className="text-xs text-zinc-400">
              Захвачен чистый экран переписки в Instagram Direct
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
        <div
          className="flex-1 overflow-y-auto rounded-2xl bg-black border border-white/10 p-2 flex items-center justify-center min-h-0 overscroll-contain touch-pan-y"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <img
            src={imageDataUrl}
            alt="Готовый скриншот Instagram Direct"
            className="max-h-[48dvh] w-auto rounded-xl object-contain shadow-2xl select-auto"
          />
        </div>

        {/* Mobile / Telegram Hint */}
        <div className="mt-2.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-center shrink-0 touch-none">
          <p className="text-[11px] text-zinc-300 leading-tight">
            💡 <span className="font-semibold text-white">На телефоне:</span> зажмите изображение пальцем на 1 секунду → выберите <span className="text-[#0095F6] font-semibold">«Сохранить в Фото»</span>.
          </p>
        </div>

        {/* Actions Grid */}
        <div className="mt-2.5 flex flex-col gap-2 shrink-0 touch-none">
          <div className="grid grid-cols-2 gap-2">
            {/* Direct <a> Tag Download for Browsers */}
            <a
              href={blobUrl || imageDataUrl}
              download={filename}
              onClick={handleDownload}
              className="min-h-[44px] px-3 rounded-xl bg-[#0095F6] hover:bg-[#0081D6] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center no-underline shadow-md"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Скачать PNG</span>
            </a>

            {/* Native Mobile Share / Save to Gallery */}
            <button
              type="button"
              onClick={handleShare}
              className="min-h-[44px] px-3 rounded-xl bg-white/[0.1] hover:bg-white/[0.16] border border-white/15 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Открыть системное меню сохранения в фото"
            >
              <Share2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>В галерею</span>
            </button>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="w-full min-h-[38px] px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-zinc-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-semibold">Скопировано в буфер обмена!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Скопировать картинку в буфер обмена</span>
              </>
            )}
          </button>

          {!isProUnlocked && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenStarsModal();
              }}
              className="w-full min-h-[40px] px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/35 text-amber-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
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
