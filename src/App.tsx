import React, { useEffect, useRef, useState, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { Character, ChatMessage, DeviceSettings } from './types/chat';
import { CELEBRITY_CHARACTERS } from './data/characters';
import { initTelegramMiniApp, triggerHaptic } from './utils/telegram';
import { downloadImageFile } from './utils/download';
import { CharacterRoster } from './components/CharacterRoster';
import { InstagramChatCanvas } from './components/InstagramChatCanvas';
import { MessageConstructorPanel } from './components/MessageConstructorPanel';
import { CustomCharacterModal } from './components/CustomCharacterModal';
import { StarsPaymentModal, TelegramStarIcon } from './components/StarsPaymentModal';
import { ScreenshotResultModal } from './components/ScreenshotResultModal';
import { DeviceSettingsModal } from './components/DeviceSettingsModal';
import { SlidersHorizontal, Users, Sparkles, MessageSquare, Smartphone, Download } from 'lucide-react';

const MAX_MESSAGES = 8;

async function preloadImageAsDataUrl(src: string): Promise<string> {
  if (!src || src.startsWith('data:')) return src;
  try {
    const response = await fetch(src);
    const blob = await response.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : src);
      reader.onerror = () => resolve(src);
      reader.readAsDataURL(blob);
    });
  } catch {
    return src;
  }
}

async function ensureAllImagesInlinedAsDataUris(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll('img'));
  await Promise.all(
    images.map(async (img) => {
      if (!img.src || img.src.startsWith('data:')) return;
      try {
        const res = await fetch(img.src);
        const blob = await res.blob();
        const reader = new FileReader();
        img.src = await new Promise<string>((resolve) => {
          reader.onloadend = () =>
            resolve(typeof reader.result === 'string' ? reader.result : img.src);
          reader.onerror = () => resolve(img.src);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn('Image inlining skipped:', e);
      }
    })
  );
}

export default function App() {
  const captureRef = useRef<HTMLDivElement | null>(null);

  // Mobile view state ('roster' = start screen with characters, 'chat' = unified constructor + preview on same page)
  const [mobileScreen, setMobileScreen] = useState<'roster' | 'chat'>('roster');
  // Desktop left-column workspace tab
  const [desktopTab, setDesktopTab] = useState<'roster' | 'constructor'>('roster');

  const [characters, setCharacters] = useState<Character[]>(CELEBRITY_CHARACTERS);
  const [customCharacter, setCustomCharacter] = useState<Character | null>(null);
  const [activeCharacter, setActiveCharacter] = useState<Character>(CELEBRITY_CHARACTERS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>(CELEBRITY_CHARACTERS[0].starterMessages);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const [settings, setSettings] = useState<DeviceSettings>({
    osType: 'ios',
    androidNavStyle: 'gesture',
    time: '12:21',
    batteryLevel: 97,
    showOnlineDot: true,
    showSeenStatus: true,
    showProfileIntro: true,
    showBatteryPercentage: true,
    dateDivider: 'Сегодня, 9:38',
    bubbleTheme: 'solid_0095f6',
  });

  // Monetization & Modals
  const [isProUnlocked, setIsProUnlocked] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isStarsModalOpen, setIsStarsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [capturedPngUrl, setCapturedPngUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((text: string) => {
    setToastMessage(text);
    setTimeout(() => {
      setToastMessage((prev) => (prev === text ? null : prev));
    }, 2800);
  }, []);

  // 1. Initialize Telegram WebApp API
  useEffect(() => {
    initTelegramMiniApp();
  }, []);

  // 2. Lock background body scroll whenever any modal dialog is open (stops background scrolling on mobile)
  useEffect(() => {
    const isAnyModalOpen =
      isCustomModalOpen || isSettingsModalOpen || isStarsModalOpen || !!capturedPngUrl;

    if (!isAnyModalOpen) return;

    const scrollY = window.scrollY || window.pageYOffset || 0;
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyWidth = document.body.style.width;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.width = originalBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isCustomModalOpen, isSettingsModalOpen, isStarsModalOpen, capturedPngUrl]);

  const handleSelectCharacter = (character: Character) => {
    triggerHaptic('selection');
    setActiveCharacter(character);
    setMessages(character.starterMessages);
    setSelectedMessageId(null);
    setMobileScreen('chat');
    setDesktopTab('constructor');
  };

  const handleSaveCustomCharacter = (customChar: Character) => {
    triggerHaptic('success');
    setCustomCharacter(customChar);
    setActiveCharacter(customChar);
    setMessages(customChar.starterMessages);
    setSelectedMessageId(null);
    setIsCustomModalOpen(false);
    setMobileScreen('chat');
    setDesktopTab('constructor');
    showToast(`Профиль «${customChar.name}» создан`);
  };

  const handleAddMessage = (sender: 'them' | 'me', text: string) => {
    if (messages.length >= MAX_MESSAGES) {
      triggerHaptic('warning');
      showToast(`Максимум ${MAX_MESSAGES} сообщений для одного экрана iPhone`);
      return;
    }
    triggerHaptic('light');
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      sender,
      text,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleAddSystemCall = (callType: 'audio' | 'video') => {
    if (messages.length >= MAX_MESSAGES) {
      triggerHaptic('warning');
      showToast(`Лимит ${MAX_MESSAGES} элементов в чате достигнут`);
      return;
    }
    triggerHaptic('medium');
    const label =
      callType === 'video' ? 'Пропущенный видеозвонок' : 'Пропущенный аудиозвонок';
    setMessages((prev) => [
      ...prev,
      {
        id: `call_${Date.now()}`,
        sender: 'system',
        text: label,
        callType,
      },
    ]);
    showToast(`Добавлен «${label}»`);
  };

  const handleUpdateMessageText = (id: string, text: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text } : m)));
  };

  const handleToggleLike = (id: string) => {
    triggerHaptic('light');
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, liked: !m.liked } : m))
    );
  };

  const handleSwapSender = (id: string) => {
    triggerHaptic('selection');
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id && m.sender !== 'system'
          ? { ...m, sender: m.sender === 'me' ? 'them' : 'me' }
          : m
      )
    );
  };

  const handleDeleteMessage = (id: string) => {
    triggerHaptic('light');
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selectedMessageId === id) {
      setSelectedMessageId(null);
    }
  };

  // Ensure activeCharacter avatar is always converted to base64 data URI
  useEffect(() => {
    if (activeCharacter.avatar && !activeCharacter.avatar.startsWith('data:')) {
      preloadImageAsDataUrl(activeCharacter.avatar).then((dataUri) => {
        if (dataUri && dataUri !== activeCharacter.avatar) {
          setActiveCharacter((prev) => ({ ...prev, avatar: dataUri }));
        }
      });
    }
  }, [activeCharacter.avatar]);

  const handleExportScreenshot = async () => {
    if (!captureRef.current || isExporting) return;

    setIsExporting(true);
    setSelectedMessageId(null);
    triggerHaptic('medium');

    try {
      // 1. Ensure all images (header avatar, DM incoming avatars) are inlined as base64 data URIs
      await ensureAllImagesInlinedAsDataUris(captureRef.current);

      // 2. Wait two frames so any selection highlight disappears and inlined images paint before DOM capture
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      );

      const filename = `instagram-direct-${activeCharacter.username}${
        isProUnlocked ? '' : '-demo'
      }.png`;

      // 3. pixelRatio 2 gives crisp Retina resolution without crashing mobile canvas memory
      // skipFonts true prevents failed fetches on external Google Fonts
      // cacheBust false prevents query param appending to data URIs
      const dataUrl = await toPng(captureRef.current, {
        pixelRatio: 2,
        skipFonts: true,
        cacheBust: false,
        backgroundColor: '#000000',
      });

      setCapturedPngUrl(dataUrl);

      // 4. Trigger automatic reliable Blob download
      downloadImageFile(dataUrl, filename);

      triggerHaptic('success');
      showToast('Скриншот сформирован');
    } catch (err) {
      console.warn('Primary PNG export failed, trying fallback:', err);
      try {
        if (captureRef.current) {
          await ensureAllImagesInlinedAsDataUris(captureRef.current);
          const fallbackDataUrl = await toPng(captureRef.current, {
            pixelRatio: 1.5,
            skipFonts: true,
            cacheBust: false,
            backgroundColor: '#000000',
          });
          setCapturedPngUrl(fallbackDataUrl);
          const filename = `instagram-direct-${activeCharacter.username}${
            isProUnlocked ? '' : '-demo'
          }.png`;
          downloadImageFile(fallbackDataUrl, filename);
          triggerHaptic('success');
          showToast('Скриншот сформирован');
          return;
        }
      } catch (fallbackErr) {
        console.error('All screenshot export methods failed:', fallbackErr);
      }
      showToast('Не удалось сформировать PNG. Попробуйте еще раз.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportFilename = `instagram-direct-${activeCharacter.username}${
    isProUnlocked ? '' : '-demo'
  }.png`;

  return (
    <div className="min-h-dvh bg-[#09090B] text-zinc-100 flex flex-col">
      {/* Desktop Top Bar (3-zone contract, hidden on narrow mobile TMA chat view for max screen space) */}
      <header
        className={`${
          mobileScreen === 'chat' ? 'hidden lg:flex' : 'flex'
        } items-center justify-between gap-8 px-4 sm:px-6 py-3.5 border-b border-white/[0.07] bg-[#09090B]/90 backdrop-blur-md sticky top-0 z-30`}
      >
        {/* Zone 1: Brand Title */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setMobileScreen('roster');
            setDesktopTab('roster');
          }}
          className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          DirectCraft
        </a>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          <button
            type="button"
            onClick={() => setDesktopTab('roster')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              desktopTab === 'roster' ? 'text-white underline underline-offset-8 decoration-[#0095F6]' : ''
            }`}
          >
            Персонажи
          </button>
          <button
            type="button"
            onClick={() => setDesktopTab('constructor')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              desktopTab === 'constructor'
                ? 'text-white underline underline-offset-8 decoration-[#0095F6]'
                : ''
            }`}
          >
            Конструктор чата
          </button>
          <button
            type="button"
            onClick={() => setIsCustomModalOpen(true)}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Свой профиль
          </button>
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {settings.osType === 'android' ? 'Экран Android' : 'Экран iOS'}
          </button>
        </nav>

        {/* Zone 3: OS Switcher + Single Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex items-center rounded-xl bg-[#141418] border border-white/10 p-0.5">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setSettings((s) => ({ ...s, osType: 'ios' }));
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                (settings.osType ?? 'ios') === 'ios'
                  ? 'bg-[#0095F6] text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🍏 iOS
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setSettings((s) => ({ ...s, osType: 'android' }));
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                settings.osType === 'android'
                  ? 'bg-[#0095F6] text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🤖 Android
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsStarsModalOpen(true)}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#18181F] hover:bg-[#22222B] border border-white/10 text-xs font-semibold text-white inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <TelegramStarIcon className="w-4 h-4" />
            <span>{isProUnlocked ? 'PRO активен' : 'Убрать водяной знак · 39 ★'}</span>
          </button>
        </div>
      </header>

      {/* Mobile Sticky Bar when in Chat Mode */}
      {mobileScreen === 'chat' && (
        <div className="lg:hidden flex items-center justify-between gap-1.5 px-3 py-2 bg-[#09090B]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setMobileScreen('roster');
            }}
            className="min-h-[38px] px-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Персонажи</span>
          </button>

          {/* Quick OS Switcher on mobile */}
          <div className="inline-flex items-center rounded-xl bg-[#141418] border border-white/15 p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setSettings((s) => ({ ...s, osType: 'ios' }));
              }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                (settings.osType ?? 'ios') === 'ios'
                  ? 'bg-[#0095F6] text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🍏 iOS
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setSettings((s) => ({ ...s, osType: 'android' }));
              }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                settings.osType === 'android'
                  ? 'bg-[#0095F6] text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🤖 Android
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            title="Настройки экрана"
            className="min-h-[38px] w-[38px] rounded-xl bg-[#18181F] hover:bg-[#22222B] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportScreenshot}
            className="min-h-[38px] px-3.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? '...' : 'Скачать'}</span>
          </button>
        </div>
      )}

      {/* Main Responsive Workspace */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-0 sm:px-6 py-0 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN (Desktop Studio Controls + Mobile Roster Screen) */}
          <section
            className={`lg:col-span-7 px-4 py-5 sm:px-0 sm:py-0 ${
              mobileScreen === 'chat' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* Intro Heading */}
            <div className="mb-5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white [text-wrap:balance]">
                Фейковый Instagram Direct (iOS / Android)
              </h1>
              <p className="text-sm text-zinc-400 mt-1.5 max-w-xl leading-relaxed">
                Выберите селебрити из списка или создайте своего персонажа, соберите диалог до 8
                реплик и скачайте реалистичный скриншот в стиле iOS или Android.
              </p>
            </div>

            {/* Desktop Workspace Switcher */}
            <div className="hidden lg:flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-1 p-1 bg-[#141418] border border-white/[0.07] rounded-xl">
                <button
                  type="button"
                  onClick={() => setDesktopTab('roster')}
                  className={`min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    desktopTab === 'roster'
                      ? 'bg-[#27272A] text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  1. Выбор персонажа (10+1)
                </button>
                <button
                  type="button"
                  onClick={() => setDesktopTab('constructor')}
                  className={`min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    desktopTab === 'constructor'
                      ? 'bg-[#27272A] text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  2. Конструктор сообщений ({messages.length}/{MAX_MESSAGES})
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className="min-h-[38px] px-3.5 rounded-xl bg-[#141418] hover:bg-[#1C1C22] border border-white/[0.07] text-xs font-medium text-zinc-300 inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {settings.osType === 'android' ? 'Экран Android' : 'Экран iOS'} ({settings.time})
              </button>
            </div>

            {/* Mobile always shows Roster here; Desktop switches between Roster & Constructor */}
            <div className={desktopTab === 'roster' ? 'block' : 'block lg:hidden'}>
              <CharacterRoster
                characters={characters}
                customCharacter={customCharacter}
                activeCharacterId={activeCharacter.id}
                osType={settings.osType}
                onToggleOsType={(os) => {
                  triggerHaptic('selection');
                  setSettings((prev) => ({ ...prev, osType: os }));
                }}
                onSelectCharacter={handleSelectCharacter}
                onOpenCustomModal={() => setIsCustomModalOpen(true)}
              />
            </div>

            <div className={desktopTab === 'constructor' ? 'hidden lg:block' : 'hidden'}>
              <MessageConstructorPanel
                character={activeCharacter}
                messages={messages}
                maxMessages={MAX_MESSAGES}
                selectedMessageId={selectedMessageId}
                bubbleTheme={settings.bubbleTheme}
                isProUnlocked={isProUnlocked}
                isExporting={isExporting}
                osType={settings.osType}
                onToggleOsType={(os) => {
                  triggerHaptic('selection');
                  setSettings((prev) => ({ ...prev, osType: os }));
                }}
                onAddMessage={handleAddMessage}
                onUpdateMessageText={handleUpdateMessageText}
                onToggleLike={handleToggleLike}
                onSwapSender={handleSwapSender}
                onDeleteMessage={handleDeleteMessage}
                onSelectMessage={setSelectedMessageId}
                onSelectBubbleTheme={(theme) =>
                  setSettings((prev) => ({ ...prev, bubbleTheme: theme }))
                }
                onResetStarter={() => {
                  setMessages(activeCharacter.starterMessages);
                  setSelectedMessageId(null);
                }}
                onClearAll={() => {
                  setMessages([]);
                  setSelectedMessageId(null);
                }}
                onExportScreenshot={handleExportScreenshot}
                onOpenStarsModal={() => setIsStarsModalOpen(true)}
                onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
              />
            </div>
          </section>

          {/* RIGHT COLUMN (Instagram Direct Screen + Mobile Constructor Dock) */}
          <section
            className={`lg:col-span-5 flex flex-col items-center ${
              mobileScreen === 'chat' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Prominent OS Switcher Banner directly above the phone frame */}
            <div className="w-full max-w-[393px] mb-2 px-1 flex items-center justify-between gap-2">
              <div className="inline-flex items-center rounded-2xl bg-[#141418] border border-white/15 p-1 shadow-lg w-full justify-between">
                <span className="text-xs font-semibold text-zinc-300 pl-2 select-none flex items-center gap-1.5">
                  <span>Экран:</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 text-white font-mono font-bold">
                    {settings.osType === 'android' ? 'Android' : 'iOS'}
                  </span>
                </span>
                <div className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setSettings((s) => ({ ...s, osType: 'ios' }));
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      (settings.osType ?? 'ios') === 'ios'
                        ? 'bg-[#0095F6] text-white shadow-sm ring-1 ring-white/20'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>🍏</span>
                    <span>iOS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setSettings((s) => ({ ...s, osType: 'android' }));
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      settings.osType === 'android'
                        ? 'bg-[#0095F6] text-white shadow-sm ring-1 ring-white/20'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>🤖</span>
                    <span>Android</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(true)}
                  title="Настройки часов, батареи и навигации"
                  className="p-2 rounded-xl hover:bg-white/10 text-zinc-300 transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Phone Canvas Preview + Unified Message Constructor on the Same Page */}
            <div className="w-full max-w-[393px] flex flex-col items-center">
              {/* Device Outer Frame on Desktop / Full-Width Clean Mobile Screen on Phone */}
              <div className="w-full sm:rounded-[42px] sm:p-[10px] sm:bg-[#18181C] sm:border sm:border-white/[0.12] sm:shadow-2xl">
                <div className="w-full overflow-hidden sm:rounded-[33px] bg-black">
                  {/* ONLY THIS INNER NODE IS CAPTURED BY html-to-image (No Telegram / Studio UI!) */}
                  <InstagramChatCanvas
                    ref={captureRef}
                    character={activeCharacter}
                    messages={messages}
                    settings={settings}
                    isProUnlocked={isProUnlocked}
                    selectedMessageId={selectedMessageId}
                    onSelectMessage={(id) =>
                      setSelectedMessageId((prev) => (prev === id ? null : id))
                    }
                    onToggleLikeMessage={handleToggleLike}
                    onBack={() => {
                      triggerHaptic('selection');
                      setMobileScreen('roster');
                      setDesktopTab('roster');
                    }}
                    onTriggerAudioCall={() => handleAddSystemCall('audio')}
                    onTriggerVideoCall={() => handleAddSystemCall('video')}
                    onOpenSettings={() => setIsSettingsModalOpen(true)}
                    onOpenStarsModal={() => setIsStarsModalOpen(true)}
                  />
                </div>
              </div>

              {/* Mobile Quick Action Buttons directly beneath phone */}
              <div className="w-full mt-3 flex flex-col gap-2 px-1 lg:hidden">
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleExportScreenshot}
                  className="w-full min-h-[48px] px-5 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>{isExporting ? 'Рендеринг PNG...' : 'Скачать скриншот (PNG)'}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setMobileScreen('roster');
                    }}
                    className="min-h-[42px] px-3 rounded-xl bg-[#181822] hover:bg-[#20202C] border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Выбрать персонажа</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="min-h-[42px] px-3 rounded-xl bg-[#181822] hover:bg-[#20202C] border border-white/10 text-xs font-semibold text-zinc-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Настройки экрана</span>
                  </button>
                </div>
              </div>

              {/* On mobile: MessageConstructorPanel rendered directly on the SAME page right below the preview */}
              <div className="w-full max-w-[393px] mt-4 px-1 pb-10 lg:hidden">
                <div className="mb-2.5 flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Реплики диалога
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    {messages.length}/{MAX_MESSAGES} сообщений
                  </span>
                </div>

                <MessageConstructorPanel
                  character={activeCharacter}
                  messages={messages}
                  maxMessages={MAX_MESSAGES}
                  selectedMessageId={selectedMessageId}
                  bubbleTheme={settings.bubbleTheme}
                  isProUnlocked={isProUnlocked}
                  isExporting={isExporting}
                  osType={settings.osType}
                  onToggleOsType={(os) => {
                    triggerHaptic('selection');
                    setSettings((prev) => ({ ...prev, osType: os }));
                  }}
                  onAddMessage={handleAddMessage}
                  onUpdateMessageText={handleUpdateMessageText}
                  onToggleLike={handleToggleLike}
                  onSwapSender={handleSwapSender}
                  onDeleteMessage={handleDeleteMessage}
                  onSelectMessage={setSelectedMessageId}
                  onSelectBubbleTheme={(theme) =>
                    setSettings((prev) => ({ ...prev, bubbleTheme: theme }))
                  }
                  onResetStarter={() => {
                    setMessages(activeCharacter.starterMessages);
                    setSelectedMessageId(null);
                  }}
                  onClearAll={() => {
                    setMessages([]);
                    setSelectedMessageId(null);
                  }}
                  onExportScreenshot={handleExportScreenshot}
                  onOpenStarsModal={() => setIsStarsModalOpen(true)}
                  onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
                  onBackToRosterMobile={() => setMobileScreen('roster')}
                />
              </div>
            </div>

            {/* Quick Desktop Export Action under Preview when browsing Roster tab */}
            {desktopTab === 'roster' && (
              <div className="hidden lg:flex w-full max-w-[393px] mt-4 gap-2.5">
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleExportScreenshot}
                  className="min-h-[46px] flex-1 px-4 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isExporting ? 'Рендеринг PNG...' : 'Скачать скриншот'}
                </button>
                <button
                  type="button"
                  onClick={() => setDesktopTab('constructor')}
                  className="min-h-[46px] px-4 rounded-2xl bg-[#18181F] hover:bg-[#23232C] border border-white/10 text-xs font-semibold text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  Изменить диалог
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Toast Notification (No window.alert) */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-zinc-900/95 border border-white/15 text-xs font-medium text-white shadow-xl backdrop-blur-md whitespace-nowrap">
          {toastMessage}
        </div>
      )}

      {/* Custom Character Modal («Свой персонаж ✨») */}
      <CustomCharacterModal
        isOpen={isCustomModalOpen}
        initialCharacter={customCharacter}
        onClose={() => setIsCustomModalOpen(false)}
        onSave={handleSaveCustomCharacter}
      />

      {/* Telegram Stars Payment Modal («Убрать водяной знак за 39 звезд») */}
      <StarsPaymentModal
        isOpen={isStarsModalOpen}
        isProUnlocked={isProUnlocked}
        onClose={() => setIsStarsModalOpen(false)}
        onUnlockSuccess={() => {
          setIsProUnlocked(true);
          setIsStarsModalOpen(false);
          showToast('Оплачено 39 ★ — водяной знак отключен!');
        }}
        onResetToFree={() => {
          setIsProUnlocked(false);
          setIsStarsModalOpen(false);
          showToast('Включен тестовый режим с водяным знаком');
        }}
      />

      {/* iOS Status Bar & Chat Settings Modal */}
      <DeviceSettingsModal
        isOpen={isSettingsModalOpen}
        settings={settings}
        activeCharacter={activeCharacter}
        onUpdateSettings={(patch) => setSettings((prev) => ({ ...prev, ...patch }))}
        onUpdateCharacter={(patch) => {
          setActiveCharacter((prev) => ({ ...prev, ...patch }));
          setCharacters((prev) =>
            prev.map((c) => (c.id === activeCharacter.id ? { ...c, ...patch } : c))
          );
        }}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Exported PNG Preview & Download Modal */}
      <ScreenshotResultModal
        imageDataUrl={capturedPngUrl}
        filename={exportFilename}
        isProUnlocked={isProUnlocked}
        onClose={() => setCapturedPngUrl(null)}
        onOpenStarsModal={() => setIsStarsModalOpen(true)}
      />
    </div>
  );
}
