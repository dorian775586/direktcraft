import React, { useState } from 'react';
import { Character, CharacterCategory } from '../types/chat';
import { VerifiedBadge } from './InstagramHeader';
import { DEFAULT_CUSTOM_AVATAR } from '../data/characters';
import { Plus, Pencil, MessageSquare, ArrowRight } from 'lucide-react';

interface CharacterRosterProps {
  characters: Character[];
  customCharacter: Character | null;
  activeCharacterId: string;
  activeCharacterName?: string;
  osType?: 'ios' | 'android';
  onToggleOsType?: (os: 'ios' | 'android') => void;
  onSelectCharacter: (character: Character) => void;
  onOpenCustomModal: () => void;
  onOpenChat?: () => void;
}

const FILTER_TABS: { id: 'ALL' | CharacterCategory; label: string }[] = [
  { id: 'ALL', label: 'Все (10+1)' },
  { id: 'IT', label: 'IT-индустрия' },
  { id: 'Рэперы', label: 'Рэперы' },
  { id: 'Блогеры', label: 'Блогеры' },
];

const AvatarWithFallback: React.FC<{ src: string; alt: string; isOnline: boolean }> = ({
  src,
  alt,
  isOnline,
}) => {
  const [imgSrc, setImgSrc] = useState(src);

  React.useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <div className="relative shrink-0">
      <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#FCAF45] via-[#E1306C] to-[#833AB4]">
        <img
          src={imgSrc || DEFAULT_CUSTOM_AVATAR}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setImgSrc(DEFAULT_CUSTOM_AVATAR)}
          className="w-12 h-12 rounded-full object-cover object-top bg-[#18181B] border-2 border-[#121215]"
        />
      </div>
      {isOnline && (
        <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#1CD14F] border-2 border-[#121215]" />
      )}
    </div>
  );
};

export const CharacterRoster: React.FC<CharacterRosterProps> = ({
  characters,
  customCharacter,
  activeCharacterId,
  activeCharacterName,
  osType = 'ios',
  onToggleOsType,
  onSelectCharacter,
  onOpenCustomModal,
  onOpenChat,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | CharacterCategory>('ALL');

  const filteredCharacters =
    activeFilter === 'ALL'
      ? characters
      : characters.filter((c) => c.category === activeFilter);

  return (
    <div className="flex flex-col gap-4">
      {/* Quick Return to Open Chat */}
      {onOpenChat && (
        <button
          type="button"
          onClick={onOpenChat}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#0095F6]/15 hover:bg-[#0095F6]/25 border border-[#0095F6]/50 text-white text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer shadow-md"
        >
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquare className="w-4 h-4 text-[#0095F6] shrink-0" />
            <span className="truncate">
              Вернуться в чат {activeCharacterName ? `(${activeCharacterName})` : ''}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[#0095F6] font-bold shrink-0 text-xs">
            <span>В чат</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      )}


      {/* Platform Switcher Banner (iOS vs Android) */}
      {onToggleOsType && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#141418] border border-white/10 shadow-sm">
          <div className="min-w-0">
            <span className="text-xs font-bold text-white block">Стиль системы</span>
            <span className="text-[11px] text-zinc-400 block truncate">
              {osType === 'android' ? 'Режим Android: Roboto, статус-бар и кнопки' : 'Режим iOS: SF Pro и статус-бар iPhone'}
            </span>
          </div>
          <div className="inline-flex rounded-xl bg-black/60 border border-white/10 p-1 shrink-0">
            <button
              type="button"
              onClick={() => onToggleOsType('ios')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                osType === 'ios'
                  ? 'bg-[#0095F6] text-white shadow-xs ring-1 ring-white/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>🍏</span>
              <span>iOS</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleOsType('android')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                osType === 'android'
                  ? 'bg-[#0095F6] text-white shadow-xs ring-1 ring-white/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>🤖</span>
              <span>Android</span>
            </button>
          </div>
        </div>
      )}

      {/* Segmented Category Filter */}
      <div className="flex items-center gap-1.5 p-1 bg-[#141417] border border-white/[0.07] rounded-xl overflow-x-auto no-scrollbar">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`min-h-[38px] px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#27272A] text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Grid of Characters with Custom Character as FIRST card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Item #1: Свой персонаж card in grid */}
        <div
          className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all min-h-[74px] ${
            customCharacter && activeCharacterId === customCharacter.id
              ? 'bg-[#181822] border-[#0095F6]'
              : 'bg-gradient-to-r from-[#171725] to-[#121624] border-[#0095F6]/40 hover:border-[#0095F6]/70'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              if (customCharacter) {
                onSelectCharacter(customCharacter);
              } else {
                onOpenCustomModal();
              }
            }}
            className="flex items-center gap-3.5 text-left min-w-0 flex-1 cursor-pointer"
          >
            {customCharacter ? (
              <AvatarWithFallback
                src={customCharacter.avatar}
                alt={customCharacter.name}
                isOnline={customCharacter.isOnline}
              />
            ) : (
              <div className="w-[52px] h-[52px] rounded-full bg-[#0095F6]/20 border border-dashed border-[#0095F6]/60 flex items-center justify-center text-[#0095F6] shrink-0">
                <Plus className="w-5 h-5" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[14px] font-bold text-white truncate">
                  {customCharacter ? `${customCharacter.name} ✨` : '✨ Свой персонаж'}
                </span>
                {customCharacter?.verified && <VerifiedBadge className="w-3.5 h-3.5" />}
              </div>
              <p className="text-[12px] text-zinc-400 mt-0.5 truncate">
                {customCharacter
                  ? `@${customCharacter.username} · Свой профиль`
                  : 'Создать со своим фото и ником'}
              </p>
            </div>
          </button>

          {customCharacter ? (
            <button
              type="button"
              onClick={onOpenCustomModal}
              title="Редактировать своего персонажа"
              className="min-w-[40px] min-h-[40px] rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-zinc-300 transition-colors shrink-0 cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenCustomModal}
              className="min-h-[36px] px-2.5 rounded-lg bg-[#0095F6] hover:bg-[#0081D6] text-white text-xs font-semibold shrink-0 cursor-pointer"
            >
              Настроить
            </button>
          )}
        </div>

        {/* 10 Celebrities */}
        {filteredCharacters.map((char) => {
          const isSelected = activeCharacterId === char.id;
          return (
            <button
              key={char.id}
              type="button"
              onClick={() => onSelectCharacter(char)}
              className={`group flex items-center gap-3.5 p-3 rounded-2xl text-left border transition-all cursor-pointer min-h-[74px] ${
                isSelected
                  ? 'bg-[#18181D] border-[#0095F6]/70'
                  : 'bg-[#121215] border-white/[0.06] hover:border-white/[0.15] hover:bg-[#16161A]'
              }`}
            >
              <AvatarWithFallback
                src={char.avatar}
                alt={char.name}
                isOnline={char.isOnline}
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[14px] font-semibold text-zinc-100 truncate">
                    {char.name}
                  </span>
                  {char.verified && <VerifiedBadge className="w-3.5 h-3.5" />}
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-zinc-400 mt-0.5 truncate">
                  <span className="truncate">@{char.username}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-zinc-500 shrink-0">{char.category}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
