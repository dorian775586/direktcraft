import React, { useState } from 'react';
import { Character, ChatMessage, BubbleTheme } from '../types/chat';
import { QUICK_TEMPLATES, DEFAULT_CUSTOM_AVATAR } from '../data/characters';
import { TelegramStarIcon } from './StarsPaymentModal';
import {
  Send,
  Trash2,
  Heart,
  ArrowLeftRight,
  Download,
  SlidersHorizontal,
  RotateCcw,
  Users,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface MessageConstructorPanelProps {
  character: Character;
  messages: ChatMessage[];
  maxMessages: number;
  selectedMessageId: string | null;
  bubbleTheme: BubbleTheme;
  isProUnlocked: boolean;
  isExporting: boolean;
  osType?: 'ios' | 'android';
  onToggleOsType?: (os: 'ios' | 'android') => void;
  onAddMessage: (sender: 'them' | 'me', text: string) => void;
  onUpdateMessageText: (id: string, text: string) => void;
  onToggleLike: (id: string) => void;
  onSwapSender: (id: string) => void;
  onDeleteMessage: (id: string) => void;
  onSelectMessage: (id: string | null) => void;
  onSelectBubbleTheme: (theme: BubbleTheme) => void;
  onResetStarter: () => void;
  onClearAll: () => void;
  onExportScreenshot: () => void;
  onOpenStarsModal: () => void;
  onOpenSettingsModal: () => void;
  onBackToRoster?: () => void;
  onBackToRosterMobile?: () => void;
}

export const MessageConstructorPanel: React.FC<MessageConstructorPanelProps> = ({
  character,
  messages,
  maxMessages,
  selectedMessageId,
  bubbleTheme,
  isProUnlocked,
  isExporting,
  osType = 'ios',
  onToggleOsType,
  onAddMessage,
  onUpdateMessageText,
  onToggleLike,
  onSwapSender,
  onDeleteMessage,
  onSelectMessage,
  onSelectBubbleTheme,
  onResetStarter,
  onClearAll,
  onExportScreenshot,
  onOpenStarsModal,
  onOpenSettingsModal,
  onBackToRoster,
  onBackToRosterMobile,
}) => {
  const [sender, setSender] = useState<'them' | 'me'>('them');
  const [draft, setDraft] = useState('');

  const isLimitReached = messages.length >= maxMessages;
  const selectedMessage = messages.find((m) => m.id === selectedMessageId) || null;

  const handleBack = onBackToRoster || onBackToRosterMobile;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || isLimitReached) return;
    onAddMessage(sender, trimmed);
    setDraft('');
  };

  return (
    <div className="flex flex-col gap-4 bg-[#121216] border border-white/[0.08] rounded-3xl p-4 sm:p-5">
      {/* Top Row: Active Character Bar & Counter */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5 min-w-0">
          {handleBack && (
            <button
              type="button"
              onClick={handleBack}
              className="min-h-[38px] px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-xs font-semibold text-white inline-flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
              title="Вернуться к списку персонажей"
            >
              <ArrowLeft className="w-4 h-4 text-[#0095F6]" />
              <span>Назад</span>
            </button>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              Конструктор реплик
            </p>
            <p className="text-[11px] text-zinc-400 truncate">
              Нажмите на сообщение в чате для лайка или правки
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Quick OS Switcher */}
          {onToggleOsType && (
            <div className="inline-flex rounded-lg bg-black/40 border border-white/10 p-0.5">
              <button
                type="button"
                onClick={() => onToggleOsType('ios')}
                title="Переключить на стиль iOS (iPhone)"
                className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                  osType === 'ios'
                    ? 'bg-[#0095F6] text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                🍏 iOS
              </button>
              <button
                type="button"
                onClick={() => onToggleOsType('android')}
                title="Переключить на стиль Android"
                className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                  osType === 'android'
                    ? 'bg-[#0095F6] text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                🤖 Android
              </button>
            </div>
          )}

          <span
            className={`font-mono text-xs font-semibold tabular-nums ${
              isLimitReached ? 'text-amber-400' : 'text-zinc-400'
            }`}
          >
            {messages.length}/{maxMessages}
          </span>
          <button
            type="button"
            onClick={onOpenSettingsModal}
            title={osType === 'android' ? 'Настройки экрана Android' : 'Настройки экрана iOS'}
            className="min-w-[38px] min-h-[38px] rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-zinc-300 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selected Message Inspector (appears when user taps a bubble) */}
      {selectedMessage && (
        <div className="p-3.5 rounded-2xl bg-[#1A1A22] border border-[#0095F6]/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">
              Редактирование выбранной реплики
            </span>
            <button
              type="button"
              onClick={() => onSelectMessage(null)}
              className="text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Готово
            </button>
          </div>

          <input
            type="text"
            value={selectedMessage.text}
            onChange={(e) => onUpdateMessageText(selectedMessage.id, e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-[#111115] border border-white/10 text-sm text-white focus:outline-none focus:border-[#0095F6]"
          />

          <div className="flex items-center gap-2">
            {selectedMessage.sender !== 'system' && (
              <>
                <button
                  type="button"
                  onClick={() => onToggleLike(selectedMessage.id)}
                  className={`min-h-[38px] flex-1 px-3 rounded-xl border text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    selectedMessage.liked
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-200'
                      : 'bg-white/[0.05] border-white/10 text-zinc-300'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  {selectedMessage.liked ? 'Убрать ❤️' : 'Лайк ❤️'}
                </button>

                <button
                  type="button"
                  onClick={() => onSwapSender(selectedMessage.id)}
                  className="min-h-[38px] flex-1 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-zinc-300 inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  Сменить автора
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => onDeleteMessage(selectedMessage.id)}
              className="min-h-[38px] px-3.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-xs font-medium text-red-300 inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Удалить
            </button>
          </div>
        </div>
      )}

      {/* Sender Toggle: From Celebrity vs From User */}
      <div className="space-y-1.5">
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#18181E] rounded-2xl border border-white/[0.06]">
          <button
            type="button"
            onClick={() => setSender('them')}
            className={`min-h-[42px] px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer truncate ${
              sender === 'them'
                ? 'bg-[#2A2A33] text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <img
              src={character.avatar || DEFAULT_CUSTOM_AVATAR}
              alt={character.name}
              referrerPolicy="no-referrer"
              className="w-5 h-5 rounded-full object-cover object-top shrink-0"
            />
            <span className="truncate">От {character.name.split(' ')[0]}</span>
          </button>

          <button
            type="button"
            onClick={() => setSender('me')}
            className={`min-h-[42px] px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer truncate ${
              sender === 'me'
                ? bubbleTheme === 'purple' || bubbleTheme === 'solid_purple' || bubbleTheme === 'ig_purple_blue'
                  ? 'bg-[#7000FF] text-white shadow-xs'
                  : bubbleTheme === 'messenger_blue'
                  ? 'bg-[#0084FE] text-white shadow-xs'
                  : 'bg-[#0095F6] text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>
              От меня (
              {bubbleTheme === 'purple' || bubbleTheme === 'solid_purple' || bubbleTheme === 'ig_purple_blue'
                ? 'Фиолетовый'
                : 'Синий'}
              )
            </span>
          </button>
        </div>

        {/* Quick color selector for outgoing bubbles */}
        <div className="flex items-center justify-between px-2 text-[11px] text-zinc-400">
          <span>Цвет моих сообщений:</span>
          <div className="inline-flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onSelectBubbleTheme('solid_0095f6')}
              className={`px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors ${
                bubbleTheme !== 'purple' && bubbleTheme !== 'solid_purple' && bubbleTheme !== 'ig_purple_blue' && bubbleTheme !== 'messenger_blue'
                  ? 'bg-[#0095F6]/20 text-[#3797F0] border border-[#0095F6]/50 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#0095F6]" />
              <span>Синий</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectBubbleTheme('purple')}
              className={`px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors ${
                bubbleTheme === 'purple' || bubbleTheme === 'solid_purple' || bubbleTheme === 'ig_purple_blue'
                  ? 'bg-[#7000FF]/25 text-[#A855F7] border border-[#7000FF]/60 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#7000FF]" />
              <span>Фиолетовый</span>
            </button>
          </div>
        </div>
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={draft}
          disabled={isLimitReached}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={
            isLimitReached
              ? `Лимит ${maxMessages} сообщений под один экран iPhone`
              : sender === 'them'
              ? `Сообщение от ${character.name}...`
              : 'Ваш ответ в Direct...'
          }
          maxLength={140}
          className="flex-1 h-11 px-3.5 rounded-xl bg-[#18181E] border border-white/10 text-sm text-white placeholder:text-zinc-500 disabled:opacity-50 focus:outline-none focus:border-[#0095F6]"
        />
        <button
          type="submit"
          disabled={!draft.trim() || isLimitReached}
          className="min-w-[46px] h-11 px-3.5 rounded-xl bg-[#0095F6] hover:bg-[#0081D6] disabled:opacity-40 text-white font-semibold flex items-center justify-center transition-colors cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Quick Phrase Presets + Reset Controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full py-0.5">
          {QUICK_TEMPLATES.map((tpl) => (
            <button
              key={tpl.label}
              type="button"
              disabled={isLimitReached}
              onClick={() => onAddMessage(tpl.sender, tpl.text)}
              className="min-h-[32px] px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-40 text-[11px] text-zinc-300 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              + {tpl.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto text-xs">
          <button
            type="button"
            onClick={onResetStarter}
            className="min-h-[34px] px-2.5 rounded-lg text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Шаблон
          </button>
          <button
            type="button"
            onClick={onClearAll}
            className="min-h-[34px] px-2.5 rounded-lg text-zinc-400 hover:text-red-300 inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Очистить
          </button>
        </div>
      </div>

      {/* Primary Monetization & Export Actions */}
      <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row gap-2.5">
        <button
          type="button"
          disabled={isExporting}
          onClick={onExportScreenshot}
          className="min-h-[48px] flex-1 px-5 rounded-2xl bg-white hover:bg-zinc-200 disabled:opacity-60 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>{isExporting ? 'Рендеринг PNG...' : 'Скачать скриншот'}</span>
        </button>

        <button
          type="button"
          onClick={onOpenStarsModal}
          className={`min-h-[48px] flex-1 px-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shadow-xs ${
            isProUnlocked
              ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
              : 'bg-white hover:bg-zinc-200 text-zinc-950'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>
            {isProUnlocked ? 'Водяные знаки убраны' : 'Убрать водяные знаки'}
          </span>
        </button>
      </div>

      {handleBack && (
        <button
          type="button"
          onClick={handleBack}
          className="w-full min-h-[42px] px-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#0095F6]" />
          <span>Вернуться к выбору персонажей</span>
        </button>
      )}
    </div>
  );
};
