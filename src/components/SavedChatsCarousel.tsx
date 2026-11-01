import React, { useState, useRef } from 'react';
import { SavedChat } from '../types/chat';
import { VerifiedBadge } from './InstagramHeader';
import { DEFAULT_CUSTOM_AVATAR } from '../data/characters';
import { TelegramStarIcon } from './StarsPaymentModal';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Copy,
  FolderHeart,
  Sparkles,
  Lock,
  ArrowRight,
  Check,
  X,
} from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';

interface SavedChatsCarouselProps {
  savedChats: SavedChat[];
  activeChatId: string;
  isProUnlocked: boolean;
  maxFreeChats?: number;
  onSelectChat: (chatId: string) => void;
  onCreateNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onDuplicateChat: (chatId: string) => void;
  onOpenStarsModal: () => void;
}

export const SavedChatsCarousel: React.FC<SavedChatsCarouselProps> = ({
  savedChats,
  activeChatId,
  isProUnlocked,
  maxFreeChats = 2,
  onSelectChat,
  onCreateNewChat,
  onDeleteChat,
  onDuplicateChat,
  onOpenStarsModal,
}) => {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<SavedChat | null>(null);

  const activeIndex = savedChats.findIndex((c) => c.id === activeChatId);
  const currentIndex = activeIndex >= 0 ? activeIndex : 0;

  const currentChat = savedChats[currentIndex] || savedChats[0];

  const handlePrev = () => {
    if (savedChats.length <= 1) return;
    triggerHaptic('selection');
    const prevIdx = (currentIndex - 1 + savedChats.length) % savedChats.length;
    onSelectChat(savedChats[prevIdx].id);
  };

  const handleNext = () => {
    if (savedChats.length <= 1) return;
    triggerHaptic('selection');
    const nextIdx = (currentIndex + 1) % savedChats.length;
    onSelectChat(savedChats[nextIdx].id);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance) {
      // Swiped Left -> go to Next
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> go to Prev
      handlePrev();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const handleCreateClick = () => {
    if (!isProUnlocked && savedChats.length >= maxFreeChats) {
      triggerHaptic('warning');
      setIsLimitModalOpen(true);
      return;
    }
    triggerHaptic('success');
    onCreateNewChat();
  };

  if (!currentChat) return null;

  const lastMessage = currentChat.messages[currentChat.messages.length - 1];

  return (
    <div className="w-full bg-[#121217] border border-white/10 rounded-3xl p-3.5 sm:p-4 shadow-xl">
      {/* Top Header: Title, Limit Badge, New Chat Button */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-[#0095F6]/15 border border-[#0095F6]/30 flex items-center justify-center shrink-0">
            <FolderHeart className="w-4 h-4 text-[#0095F6]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-tight">
                Сохраненные диалоги
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  savedChats.length >= maxFreeChats && !isProUnlocked
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-white/10 text-zinc-300'
                }`}
              >
                {savedChats.length} / {isProUnlocked ? '∞ PRO' : `${maxFreeChats} (бесплатно)`}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreateClick}
          className="min-h-[34px] px-3 rounded-xl bg-[#0095F6] hover:bg-[#0081D6] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Новый чат</span>
        </button>
      </div>

      {/* Swipeable Active Chat Card with Left / Right Navigation */}
      <div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#181822] to-[#14141B] border border-white/[0.08] p-3 touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={savedChats.length <= 1}
            title="Предыдущий сохраненный чат"
            className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-20 disabled:pointer-events-none flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Chat Info Content (Click to activate) */}
          <div
            onClick={() => {
              if (currentChat.id !== activeChatId) {
                triggerHaptic('selection');
                onSelectChat(currentChat.id);
              }
            }}
            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer select-none px-1"
          >
            {/* Character Avatar */}
            <div className="relative shrink-0">
              <img
                src={currentChat.character.avatar || DEFAULT_CUSTOM_AVATAR}
                alt={currentChat.character.name}
                className="w-11 h-11 rounded-full object-cover object-top border border-white/15 bg-zinc-800"
              />
              {currentChat.character.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#1CD14F] border-2 border-[#181822]" />
              )}
            </div>

            {/* Meta */}
            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-white truncate">
                  {currentChat.character.name}
                </span>
                {currentChat.character.verified && (
                  <VerifiedBadge className="w-3.5 h-3.5 shrink-0" />
                )}
                {currentChat.id === activeChatId && (
                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-[9px] font-bold text-emerald-300">
                    Активен
                  </span>
                )}
              </div>

              <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                {lastMessage
                  ? `${lastMessage.sender === 'me' ? 'Вы: ' : ''}${lastMessage.text}`
                  : 'Нет сообщений'}
              </p>

              <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500">
                <span>{currentChat.messages.length} реплик</span>
                <span>•</span>
                <span>{currentChat.settings.osType === 'android' ? 'Android' : 'iOS'}</span>
              </div>
            </div>
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={handleNext}
            disabled={savedChats.length <= 1}
            title="Следующий сохраненный чат"
            className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-20 disabled:pointer-events-none flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card Quick Actions: Duplicate & Delete */}
        <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-[11px] text-zinc-400">
            <span>Листайте стрелками или свайпом влево/вправо</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onDuplicateChat(currentChat.id);
              }}
              title="Дублировать диалог"
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Копия</span>
            </button>

            {savedChats.length > 1 && (
              <button
                type="button"
                onClick={() => setChatToDelete(currentChat)}
                title="Удалить этот сохраненный диалог"
                className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-red-500/20 text-zinc-400 hover:text-red-300 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Удалить</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pagination Indicators (Clickable Dots) */}
      <div className="flex items-center justify-center gap-1.5 mt-2.5">
        {savedChats.map((c, idx) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onSelectChat(c.id);
            }}
            title={`Диалог ${idx + 1}: ${c.character.name}`}
            className={`transition-all rounded-full cursor-pointer ${
              idx === currentIndex
                ? 'w-6 h-2 bg-[#0095F6]'
                : 'w-2 h-2 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Limit Exceeded Modal (Free tier reached 2 chats) */}
      {isLimitModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
          onClick={() => setIsLimitModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-[#16161C] border border-white/10 rounded-3xl p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center mb-3.5">
              <Lock className="w-6 h-6 text-amber-400" />
            </div>

            <h3 className="text-base font-bold text-white">Достигнут лимит: 2 чата</h3>
            <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
              В бесплатной версии сохраняется до 2-х диалогов одновременно. Оплатите доступ через Telegram Stars, чтобы сохранять неограниченное число переписок, или перезапишите текущий чат.
            </p>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsLimitModalOpen(false);
                  onOpenStarsModal();
                }}
                className="w-full min-h-[44px] px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <TelegramStarIcon className="w-4 h-4" />
                <span>Разблокировать безлимит за 39 ★</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLimitModalOpen(false);
                  // Replace current chat with clean dialog
                  onCreateNewChat();
                }}
                className="w-full min-h-[40px] px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
              >
                Очистить текущий диалог и начать новый
              </button>

              <button
                type="button"
                onClick={() => setIsLimitModalOpen(false)}
                className="w-full min-h-[38px] px-4 rounded-xl text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {chatToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
          onClick={() => setChatToDelete(null)}
        >
          <div
            className="w-full max-w-sm bg-[#16161C] border border-white/10 rounded-3xl p-5 shadow-2xl animate-in fade-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-white">Удалить этот чат?</h3>
            <p className="text-xs text-zinc-400 mt-1.5">
              Диалог с «{chatToDelete.character.name}» ({chatToDelete.messages.length} сообщений) будет удален из памяти приложения.
            </p>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setChatToDelete(null)}
                className="min-h-[42px] flex-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('warning');
                  onDeleteChat(chatToDelete.id);
                  setChatToDelete(null);
                }}
                className="min-h-[42px] flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
