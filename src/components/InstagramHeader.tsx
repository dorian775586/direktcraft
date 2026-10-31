import React, { useState } from 'react';
import { Character, OsType } from '../types/chat';
import { DEFAULT_CUSTOM_AVATAR } from '../data/characters';

interface InstagramHeaderProps {
  character: Character;
  showOnlineDot: boolean;
  osType?: OsType;
  onBack: () => void;
  onTriggerAudioCall: () => void;
  onTriggerVideoCall: () => void;
  onOpenSettings: () => void;
}

export const VerifiedBadge: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    className={`${className} shrink-0`}
    aria-label="Подтвержденный аккаунт"
  >
    <path
      d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z"
      fill="#0095F6"
    />
  </svg>
);

export const InstagramHeader: React.FC<InstagramHeaderProps> = ({
  character,
  showOnlineDot,
  osType = 'ios',
  onBack,
  onTriggerAudioCall,
  onTriggerVideoCall,
  onOpenSettings,
}) => {
  const [imgSrc, setImgSrc] = useState(character.avatar);

  React.useEffect(() => {
    setImgSrc(character.avatar);
  }, [character.avatar]);

  return (
    <div className={`${osType === 'android' ? 'font-sans' : 'ios-font'} flex items-center justify-between px-2 py-2 bg-black border-b border-[#262626]/80 text-white select-none shrink-0`}>
      {/* Left: Back Arrow + Avatar + Name & Status */}
      <div className="flex items-center min-w-0 flex-1">
        <button
          type="button"
          onClick={onBack}
          title="К списку персонажей"
          className="min-w-[40px] min-h-[40px] flex items-center justify-center text-white active:opacity-60 transition-opacity cursor-pointer"
        >
          {osType === 'android' ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 12H4M4 12L10 18M4 12L10 6"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15.5 19.5L8 12L15.5 4.5"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          {/* Avatar with optional online indicator */}
          <div className="relative shrink-0">
            <img
              src={imgSrc || DEFAULT_CUSTOM_AVATAR}
              alt={character.name}
              onError={() => setImgSrc(DEFAULT_CUSTOM_AVATAR)}
              loading="eager"
              decoding="sync"
              className="w-9 h-9 rounded-full object-cover object-top bg-[#262626]"
            />
            {showOnlineDot && character.isOnline && (
              <span
                aria-label="Онлайн"
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#1CD14F] border-[2.5px] border-black"
              />
            )}
          </div>

          {/* Display Name + Blue Checkmark + Subtitle */}
          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-[15px] font-semibold leading-[18px] tracking-[-0.01em] text-white truncate">
                {character.name}
              </span>
              {character.verified && <VerifiedBadge className="w-[14px] h-[14px]" />}
            </div>
            <span className="text-[12px] leading-[15px] text-[#A8A8A8] truncate">
              {character.statusText || `@${character.username}`}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Audio Call, Video Call, Info Icons */}
      <div className="flex items-center shrink-0 pr-1">
        <button
          type="button"
          onClick={onTriggerAudioCall}
          title="Добавить пропущенный аудиозвонок в чат"
          className="min-w-[40px] min-h-[40px] flex items-center justify-center text-white hover:opacity-80 active:opacity-50 transition-opacity cursor-pointer"
        >
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
            <path
              d="M21.2 16.92v2.45a1.85 1.85 0 0 1-2.02 1.85 18.32 18.32 0 0 1-8-2.85 18.05 18.05 0 0 1-5.55-5.55 18.32 18.32 0 0 1-2.85-8.04A1.85 1.85 0 0 1 4.62 2.8h2.45a1.85 1.85 0 0 1 1.85 1.59c.12.89.34 1.76.65 2.6a1.85 1.85 0 0 1-.42 1.95l-1.04 1.04a14.8 14.8 0 0 0 5.55 5.55l1.04-1.04a1.85 1.85 0 0 1 1.95-.42c.84.31 1.71.53 2.6.65a1.85 1.85 0 0 1 1.95 1.88Z"
              stroke="white"
              strokeWidth="1.85"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={onTriggerVideoCall}
          title="Добавить видеозвонок в чат"
          className="min-w-[40px] min-h-[40px] flex items-center justify-center text-white hover:opacity-80 active:opacity-50 transition-opacity cursor-pointer"
        >
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
            <rect
              x="2.25"
              y="5.25"
              width="13.5"
              height="13.5"
              rx="3.2"
              stroke="white"
              strokeWidth="1.85"
            />
            <path
              d="M15.75 10.1L20.6 7.15C21.26 6.75 22.1 7.22 22.1 8V16C22.1 16.78 21.26 17.25 20.6 16.85L15.75 13.9"
              stroke="white"
              strokeWidth="1.85"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          title="Настройки статус-бара и чата"
          className="min-w-[40px] min-h-[40px] flex items-center justify-center text-white hover:opacity-80 active:opacity-50 transition-opacity cursor-pointer"
        >
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9.5" stroke="white" strokeWidth="1.85" />
            <path d="M12 11.2V16.4" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="7.9" r="1.15" fill="white" />
          </svg>
        </button>
      </div>
    </div>
  );
};
