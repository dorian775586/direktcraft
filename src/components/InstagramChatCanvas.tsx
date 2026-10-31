import React, { forwardRef, useState } from 'react';
import { Character, ChatMessage, DeviceSettings } from '../types/chat';
import { DeviceStatusBar } from './DeviceStatusBar';
import { InstagramHeader, VerifiedBadge } from './InstagramHeader';
import { DEFAULT_CUSTOM_AVATAR } from '../data/characters';

interface InstagramChatCanvasProps {
  character: Character;
  messages: ChatMessage[];
  settings: DeviceSettings;
  isProUnlocked: boolean;
  selectedMessageId: string | null;
  onSelectMessage: (id: string) => void;
  onToggleLikeMessage: (id: string) => void;
  onBack: () => void;
  onTriggerAudioCall: () => void;
  onTriggerVideoCall: () => void;
  onOpenSettings: () => void;
  onOpenStarsModal: () => void;
}

function getOutgoingBubbleStyle(theme?: string): React.CSSProperties {
  if (theme === 'messenger_blue') {
    return {
      backgroundColor: '#0084FE',
      color: '#ffffff',
    };
  }
  // Чистый сплошной цвет без какого-либо градиента (Instagram #0095F6)
  return {
    backgroundColor: '#0095F6',
    color: '#ffffff',
  };
}

export const InstagramChatCanvas = forwardRef<HTMLDivElement, InstagramChatCanvasProps>(
  (
    {
      character,
      messages,
      settings,
      isProUnlocked,
      selectedMessageId,
      onSelectMessage,
      onToggleLikeMessage,
      onBack,
      onTriggerAudioCall,
      onTriggerVideoCall,
      onOpenSettings,
      onOpenStarsModal,
    },
    ref
  ) => {
    const lastMessage = messages[messages.length - 1];
    const showSeenBelowLast = settings.showSeenStatus && lastMessage?.sender === 'me';

    return (
      <div
        ref={ref}
        className={`${settings.osType === 'android' ? 'font-sans' : 'ios-font'} relative w-full max-w-[393px] mx-auto bg-black text-white flex flex-col justify-between overflow-hidden select-none min-h-[690px] sm:min-h-[740px]`}
      >
        {/* Top Section: iOS / Android Status Bar + Instagram Direct Header */}
        <div className="shrink-0 z-10">
          <DeviceStatusBar
            osType={settings.osType}
            time={settings.time}
            batteryLevel={settings.batteryLevel}
          />
          <InstagramHeader
            character={character}
            showOnlineDot={settings.showOnlineDot}
            osType={settings.osType}
            onBack={onBack}
            onTriggerAudioCall={onTriggerAudioCall}
            onTriggerVideoCall={onTriggerVideoCall}
            onOpenSettings={onOpenSettings}
          />
        </div>

        {/* Middle Section: Authentic Instagram Direct Feed */}
        <div className="flex-1 flex flex-col justify-end px-3.5 pt-3 pb-2 relative z-10">
          {/* Optional Instagram Profile Mini-Header at top of short DMs */}
          {settings.showProfileIntro && (
            <div className="flex flex-col items-center text-center pt-1 pb-4 mb-auto">
              <img
                src={character.avatar || DEFAULT_CUSTOM_AVATAR}
                alt={character.name}
                crossOrigin="anonymous"
                className="w-16 h-16 rounded-full object-cover object-top bg-[#262626] mb-2.5"
              />
              <div className="flex items-center gap-1 justify-center">
                <span className="text-[16px] font-semibold text-white">{character.name}</span>
                {character.verified && <VerifiedBadge className="w-4 h-4" />}
              </div>
              <p className="text-[13px] text-[#A8A8A8] mt-0.5">
                {character.username} · Instagram
              </p>
              <p className="text-[12px] text-[#737373] mt-0.5">{character.followers}</p>
            </div>
          )}

          {/* Timestamp Divider */}
          {settings.dateDivider && (
            <div className="text-center my-2.5">
              <span className="text-[11px] font-medium text-[#8E8E8E] tracking-[0.01em]">
                {settings.dateDivider}
              </span>
            </div>
          )}

          {/* Empty State Hint */}
          {messages.length === 0 && (
            <div className="my-12 text-center px-6">
              <p className="text-[13px] text-[#737373]">
                Диалог пуст. Добавьте реплики через панель конструктора ниже.
              </p>
            </div>
          )}

          {/* Messages List */}
          <div className="flex flex-col gap-1.5">
            {messages.map((msg, idx) => {
              const prevMsg = messages[idx - 1];
              const nextMsg = messages[idx + 1];
              const isSamePrev = prevMsg?.sender === msg.sender;
              const isSameNext = nextMsg?.sender === msg.sender;
              const isSelected = selectedMessageId === msg.id;

              if (msg.sender === 'system') {
                return (
                  <div
                    key={msg.id}
                    onClick={() => onSelectMessage(msg.id)}
                    className={`mx-auto my-1.5 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#1C1C1E] border transition-colors cursor-pointer ${
                      isSelected ? 'border-[#3797F0]' : 'border-transparent'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#FF453A] shrink-0">
                      {msg.callType === 'video' ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                          <rect x="2" y="5" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
                          <path d="M16 10L21 7V17L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M21 16.92v2.45a1.85 1.85 0 0 1-2.02 1.85 18.32 18.32 0 0 1-8-2.85 18.05 18.05 0 0 1-5.55-5.55 18.32 18.32 0 0 1-2.85-8.04A1.85 1.85 0 0 1 4.62 2.8h2.45a1.85 1.85 0 0 1 1.85 1.59c.12.89.34 1.76.65 2.6a1.85 1.85 0 0 1-.42 1.95L8.11 9.98a14.8 14.8 0 0 0 5.55 5.55l1.04-1.04a1.85 1.85 0 0 1 1.95-.42c.84.31 1.71.53 2.6.65A1.85 1.85 0 0 1 21 16.92Z"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-medium text-white leading-tight">{msg.text}</p>
                      <p className="text-[11px] text-[#8E8E8E] mt-0.5">Нажмите, чтобы перезвонить</p>
                    </div>
                  </div>
                );
              }

              const isMe = msg.sender === 'me';

              // Bubble corner radius matching iOS Instagram Direct grouping
              const incomingRadius = `${isSamePrev ? 'rounded-tl-[6px]' : 'rounded-tl-[20px]'} ${
                isSameNext ? 'rounded-bl-[6px]' : 'rounded-bl-[20px]'
              } rounded-tr-[20px] rounded-br-[20px]`;

              const outgoingRadius = `${isSamePrev ? 'rounded-tr-[6px]' : 'rounded-tr-[20px]'} ${
                isSameNext ? 'rounded-br-[6px]' : 'rounded-br-[20px]'
              } rounded-tl-[20px] rounded-bl-[20px]`;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${
                    msg.liked ? 'mb-3.5' : ''
                  }`}
                >
                  {msg.timestampLabel && (
                    <div className="w-full text-center my-2">
                      <span className="text-[11px] text-[#8E8E8E]">{msg.timestampLabel}</span>
                    </div>
                  )}

                  <div className={`flex items-end gap-2 max-w-[82%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Mini Avatar for Celebrity on the last consecutive incoming message */}
                    {!isMe && (
                      <div className="w-7 h-7 shrink-0">
                        {!isSameNext && (
                          <img
                            src={character.avatar || DEFAULT_CUSTOM_AVATAR}
                            alt={character.name}
                            crossOrigin="anonymous"
                            className="w-7 h-7 rounded-full object-cover object-top bg-[#262626]"
                          />
                        )}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      onClick={() => onSelectMessage(msg.id)}
                      onDoubleClick={() => onToggleLikeMessage(msg.id)}
                      title="Нажмите для редактирования, двойной клик — лайк"
                      style={isMe ? getOutgoingBubbleStyle(settings.bubbleTheme) : undefined}
                      className={`relative px-3.5 py-2.5 text-[15px] leading-[20px] tracking-[-0.01em] break-words cursor-pointer transition-transform active:scale-[0.99] ${
                        isMe
                          ? `bg-[#0095F6] text-white ${outgoingRadius}`
                          : `bg-[#262626] text-[#F5F5F5] ${incomingRadius}`
                      } ${isSelected ? 'ring-2 ring-white/70' : ''}`}
                    >
                      <span>{msg.text}</span>

                      {/* Instagram Direct Heart Reaction */}
                      {msg.liked && (
                        <span
                          className={`absolute -bottom-3 ${
                            isMe ? 'right-2.5' : 'left-2.5'
                          } flex items-center justify-center w-6 h-5 rounded-full bg-[#262626] border-[2px] border-black text-[11px] leading-none shadow-sm`}
                        >
                          ❤️
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* "Просмотрено" below last outgoing message */}
          {showSeenBelowLast && (
            <div className="text-right pr-1.5 mt-1">
              <span className="text-[11px] text-[#8E8E8E] font-normal">Просмотрено</span>
            </div>
          )}
        </div>

        {/* Semi-transparent Watermark Overlay when Free Mode */}
        {!isProUnlocked && (
          <div
            onClick={onOpenStarsModal}
            title="Нажмите, чтобы убрать водяной знак за 39 Stars"
            className="pointer-events-auto cursor-pointer absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden select-none"
          >
            <div className="-rotate-24 flex flex-col items-center gap-12 opacity-[0.22] pointer-events-none">
              <span className="text-[22px] font-bold tracking-[0.18em] text-white whitespace-nowrap">
                FAKE DIRECT · DEMO
              </span>
              <span className="text-[24px] font-bold tracking-[0.18em] text-white whitespace-nowrap">
                @DIRECTCRAFT_BOT
              </span>
              <span className="text-[22px] font-bold tracking-[0.18em] text-white whitespace-nowrap">
                FAKE DIRECT · DEMO
              </span>
            </div>
          </div>
        )}

        {/* Bottom Section: Authentic iOS Instagram Direct Input Bar + Home Indicator */}
        <div className="shrink-0 px-3 pt-2 pb-2 bg-black z-10">
          <div className="flex items-center justify-between h-[44px] px-1.5 rounded-full bg-[#262626]">
            {/* Blue Camera Circle */}
            <div className="w-[34px] h-[34px] rounded-full bg-[#0095F6] flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 7.5H17.4L15.9 5.5H8.1L6.6 7.5H4C2.9 7.5 2 8.4 2 9.5V18.5C2 19.6 2.9 20.5 4 20.5H20C21.1 20.5 22 19.6 22 18.5V9.5C22 8.4 21.1 7.5 20 7.5Z"
                  fill="white"
                />
                <circle cx="12" cy="14" r="3.2" fill="#0095F6" />
              </svg>
            </div>

            {/* Placeholder */}
            <span className="flex-1 pl-2.5 text-[15px] text-[#8E8E8E] truncate">
              Напишите сообщение...
            </span>

            {/* Right Input Icons: Mic, Gallery, Sticker */}
            <div className="flex items-center gap-3 pr-2.5 text-white shrink-0">
              {/* Microphone */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="2.5" width="6" height="11" rx="3" stroke="white" strokeWidth="1.8" />
                <path
                  d="M5.5 11C5.5 14.59 8.41 17.5 12 17.5C15.59 17.5 18.5 14.59 18.5 11"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path d="M12 17.5V21" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              </svg>

              {/* Gallery Image */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="4" stroke="white" strokeWidth="1.8" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="white" />
                <path
                  d="M3.5 17L8.5 12L13 16.5L16.5 13L20.5 17"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Sticker Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 3H9C5.69 3 3 5.69 3 9V15C3 18.31 5.69 21 9 21H14.5L21 14.5V9C21 5.69 18.31 3 15 3Z"
                  stroke="white"
                  strokeWidth="1.8"
                />
                <path
                  d="M14 20.8V16.5C14 15.12 15.12 14 16.5 14H20.8"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* System Bottom Navigation: iOS Home Indicator or Android Navigation Bar */}
          {settings.osType === 'android' ? (
            settings.androidNavStyle === 'buttons' ? (
              <div className="pt-2 pb-1.5 px-12 flex justify-between items-center text-white/70">
                {/* Back Triangle */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 19L5 12L19 5V19Z" />
                </svg>
                {/* Home Circle */}
                <div className="w-3.5 h-3.5 rounded-full border-[2px] border-white/70" />
                {/* Recent Square */}
                <div className="w-3.5 h-3.5 rounded-[2px] border-[2px] border-white/70" />
              </div>
            ) : (
              <div className="pt-3 pb-1 flex justify-center">
                <div className="w-[72px] h-[3.5px] rounded-full bg-white/70" />
              </div>
            )
          ) : (
            <div className="pt-4 pb-0.5 flex justify-center">
              <div className="w-[134px] h-[5px] rounded-full bg-white" />
            </div>
          )}
        </div>
      </div>
    );
  }
);

InstagramChatCanvas.displayName = 'InstagramChatCanvas';
