import React, { useEffect, useRef, useState, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { Character, ChatMessage, DeviceSettings, SavedChat } from './types/chat';
import { CELEBRITY_CHARACTERS, DEFAULT_CUSTOM_AVATAR } from './data/characters';
import { initTelegramMiniApp, triggerHaptic, updateTelegramBackButton } from './utils/telegram';
import { downloadImageFile } from './utils/download';
import { CharacterRoster } from './components/CharacterRoster';
import { InstagramChatCanvas } from './components/InstagramChatCanvas';
import { MessageConstructorPanel } from './components/MessageConstructorPanel';
import { SavedChatsCarousel } from './components/SavedChatsCarousel';
import { CustomCharacterModal } from './components/CustomCharacterModal';
import { StarsPaymentModal, TelegramStarIcon } from './components/StarsPaymentModal';
import { ScreenshotResultModal } from './components/ScreenshotResultModal';
import { DeviceSettingsModal } from './components/DeviceSettingsModal';
import { SlidersHorizontal, Users, Sparkles, MessageSquare, Smartphone, Download, ArrowLeft, ChevronUp, ChevronDown } from 'lucide-react';

const MAX_MESSAGES = 25;

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
        const res = await fetch(img.src, { mode: 'cors' });
        const blob = await res.blob();
        const reader = new FileReader();
        img.src = await new Promise<string>((resolve) => {
          reader.onloadend = () =>
            resolve(typeof reader.result === 'string' ? reader.result : img.src);
          reader.onerror = () => resolve(DEFAULT_CUSTOM_AVATAR);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn('Image inlining fallback to default avatar:', e);
        img.src = DEFAULT_CUSTOM_AVATAR;
      }
    })
  );
}

const STORAGE_KEY = 'directcraft_saved_chats_v1';
const FREE_SAVED_CHATS_LIMIT = 2;

const DEFAULT_SETTINGS: DeviceSettings = {
  osType: 'ios',
  androidNavStyle: 'gesture',
  time: '12:21',
  batteryLevel: 97,
  showOnlineDot: true,
  showSeenStatus: true,
  showProfileIntro: true,
  showBatteryPercentage: true,
  storyRing: 'unseen',
  aspectRatio: '9:16',
  dateDivider: 'Сегодня, 9:38',
  bubbleTheme: 'solid_0095f6',
};

function getInitialSavedChats(): { chats: SavedChat[]; activeId: string } {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { chats: parsed, activeId: parsed[0].id };
      }
    }
  } catch (e) {
    console.warn('Error reading saved chats from localStorage:', e);
  }

  const defaultChat: SavedChat = {
    id: `chat_init_${Date.now()}`,
    title: CELEBRITY_CHARACTERS[0].name,
    character: CELEBRITY_CHARACTERS[0],
    messages: CELEBRITY_CHARACTERS[0].starterMessages,
    settings: DEFAULT_SETTINGS,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return { chats: [defaultChat], activeId: defaultChat.id };
}

export default function App() {
  const captureRef = useRef<HTMLDivElement | null>(null);

  // Saved chats state (Free limit: up to 2 saved chats)
  const [initialData] = useState(getInitialSavedChats);
  const [savedChats, setSavedChats] = useState<SavedChat[]>(initialData.chats);
  const [activeChatId, setActiveChatId] = useState<string>(initialData.activeId);

  // Mobile view state ('roster' = start screen with characters, 'chat' = unified constructor + preview on same page)
  const [mobileScreen, setMobileScreen] = useState<'roster' | 'chat'>('roster');
  // Desktop left-column workspace tab
  const [desktopTab, setDesktopTab] = useState<'roster' | 'constructor'>('roster');

  const initialChat = initialData.chats[0];
  const [characters, setCharacters] = useState<Character[]>(CELEBRITY_CHARACTERS);
  const [customCharacter, setCustomCharacter] = useState<Character | null>(null);
  const [activeCharacter, setActiveCharacter] = useState<Character>(initialChat.character || CELEBRITY_CHARACTERS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>(initialChat.messages || CELEBRITY_CHARACTERS[0].starterMessages);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const [settings, setSettings] = useState<DeviceSettings>(initialChat.settings || DEFAULT_SETTINGS);

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

  // 3. Keep native Telegram WebApp BackButton in sync with active screen & modals
  useEffect(() => {
    if (isCustomModalOpen) {
      updateTelegramBackButton(true, () => {
        triggerHaptic('light');
        setIsCustomModalOpen(false);
      });
    } else if (isSettingsModalOpen) {
      updateTelegramBackButton(true, () => {
        triggerHaptic('light');
        setIsSettingsModalOpen(false);
      });
    } else if (isStarsModalOpen) {
      updateTelegramBackButton(true, () => {
        triggerHaptic('light');
        setIsStarsModalOpen(false);
      });
    } else if (capturedPngUrl) {
      updateTelegramBackButton(true, () => {
        triggerHaptic('light');
        setCapturedPngUrl(null);
      });
    } else if (mobileScreen === 'chat') {
      updateTelegramBackButton(true, () => {
        triggerHaptic('selection');
        setMobileScreen('roster');
        setDesktopTab('roster');
      });
    } else {
      updateTelegramBackButton(false);
    }
  }, [
    isCustomModalOpen,
    isSettingsModalOpen,
    isStarsModalOpen,
    capturedPngUrl,
    mobileScreen,
  ]);

  // 4. Automatically persist active chat updates to savedChats and localStorage
  useEffect(() => {
    setSavedChats((prev) => {
      const idx = prev.findIndex((c) => c.id === activeChatId);
      if (idx === -1) return prev;
      const current = prev[idx];
      const updated: SavedChat = {
        ...current,
        title: activeCharacter.name,
        character: activeCharacter,
        messages,
        settings,
        updatedAt: Date.now(),
      };
      const nextList = [...prev];
      nextList[idx] = updated;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
      } catch (err) {
        console.warn('LocalStorage save failed:', err);
      }
      return nextList;
    });
  }, [activeCharacter, messages, settings, activeChatId]);

  const handleSelectSavedChat = (chatId: string) => {
    const target = savedChats.find((c) => c.id === chatId);
    if (!target) return;
    triggerHaptic('selection');
    setActiveChatId(target.id);
    setActiveCharacter(target.character);
    setMessages(target.messages);
    setSettings(target.settings);
    setSelectedMessageId(null);
    showToast(`Открыт: ${target.character.name}`);
  };

  const handleCreateNewSavedChat = () => {
    if (!isProUnlocked && savedChats.length >= FREE_SAVED_CHATS_LIMIT) {
      setMessages([]);
      setSelectedMessageId(null);
      showToast('Диалог очищен для новых сообщений');
      return;
    }

    const usedCharIds = new Set(savedChats.map((c) => c.character.id));
    const nextChar =
      CELEBRITY_CHARACTERS.find((c) => !usedCharIds.has(c.id)) ||
      CELEBRITY_CHARACTERS[savedChats.length % CELEBRITY_CHARACTERS.length];

    const newChat: SavedChat = {
      id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: nextChar.name,
      character: nextChar,
      messages: nextChar.starterMessages,
      settings: { ...settings },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const nextList = [...savedChats, newChat];
    setSavedChats(nextList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
    } catch {}

    setActiveChatId(newChat.id);
    setActiveCharacter(newChat.character);
    setMessages(newChat.messages);
    setSettings(newChat.settings);
    setSelectedMessageId(null);
    showToast(`Создан слот ${nextList.length}/${isProUnlocked ? '∞' : FREE_SAVED_CHATS_LIMIT}: «${newChat.character.name}»`);
  };

  const handleDuplicateSavedChat = (chatId: string) => {
    if (!isProUnlocked && savedChats.length >= FREE_SAVED_CHATS_LIMIT) {
      triggerHaptic('warning');
      setIsStarsModalOpen(true);
      showToast(`Бесплатный лимит: ${FREE_SAVED_CHATS_LIMIT} диалога. Оплатите PRO для безлимита`);
      return;
    }
    const target = savedChats.find((c) => c.id === chatId);
    if (!target) return;

    const copyChat: SavedChat = {
      ...target,
      id: `chat_copy_${Date.now()}`,
      title: `${target.title} (Копия)`,
      messages: target.messages.map((m) => ({ ...m, id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 5)}` })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const nextList = [...savedChats, copyChat];
    setSavedChats(nextList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
    } catch {}
    setActiveChatId(copyChat.id);
    showToast(`Создана копия диалога «${target.character.name}»`);
  };

  const handleDeleteSavedChat = (chatId: string) => {
    if (savedChats.length <= 1) {
      showToast('Должен остаться хотя бы один диалог');
      return;
    }
    const nextList = savedChats.filter((c) => c.id !== chatId);
    setSavedChats(nextList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
    } catch {}

    if (activeChatId === chatId) {
      const nextActive = nextList[0];
      setActiveChatId(nextActive.id);
      setActiveCharacter(nextActive.character);
      setMessages(nextActive.messages);
      setSettings(nextActive.settings);
      setSelectedMessageId(null);
    }
    showToast('Диалог удален');
  };

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
      showToast(`Лимит сообщений в диалоге (${MAX_MESSAGES}) достигнут`);
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

  const handleScrollChatFeed = (direction: 'top' | 'bottom') => {
    triggerHaptic('light');
    const feed = captureRef.current?.querySelector<HTMLDivElement>('[data-chat-feed="true"]');
    if (feed) {
      feed.scrollTo({
        top: direction === 'top' ? 0 : feed.scrollHeight,
        behavior: 'smooth',
      });
    }
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

    const feedContainer = captureRef.current.querySelector(
      '[data-chat-feed="true"]'
    ) as HTMLElement | null;
    const feedInner =
      (feedContainer?.querySelector('[data-chat-feed-inner="true"]') as HTMLElement | null) ||
      (feedContainer?.firstElementChild as HTMLElement | null);

    let savedScrollTop = 0;
    let appliedTransform = false;

    try {
      // 1. Ensure all images (header avatar, DM incoming avatars) are inlined as base64 data URIs
      await ensureAllImagesInlinedAsDataUris(captureRef.current);

      // 2. SVG foreignObject in html-to-image always renders with scrollTop=0.
      // Compensate by translating feedInner upward by the current/effective scroll offset:
      if (feedContainer && feedInner) {
        savedScrollTop = feedContainer.scrollTop;
        const maxScroll = Math.max(0, feedContainer.scrollHeight - feedContainer.clientHeight);

        // If user is at the bottom or dialogue overflows, ensure messages are visible in the snapshot
        const targetScroll = savedScrollTop > 0 ? savedScrollTop : maxScroll;

        if (targetScroll > 0) {
          feedInner.style.transform = `translateY(-${targetScroll}px)`;
          feedContainer.scrollTop = 0;
          appliedTransform = true;
        }
      }

      // 3. Wait two frames so any selection highlight disappears and transform paints before DOM capture
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      );

      const filename = `instagram-direct-${activeCharacter.username}${
        isProUnlocked ? '' : '-demo'
      }.png`;

      // 4. Explicit pixel dimensions prevent SVG foreignObject flex layout collapse
      const nodeWidth = captureRef.current.offsetWidth || 393;
      const nodeHeight = captureRef.current.offsetHeight || Math.round((nodeWidth * 16) / 9);

      // pixelRatio 2 gives crisp Retina resolution
      // skipFonts true prevents failed fetches on external Google Fonts
      // cacheBust false prevents query param appending to data URIs
      const dataUrl = await toPng(captureRef.current, {
        width: nodeWidth,
        height: nodeHeight,
        canvasWidth: nodeWidth * 2,
        canvasHeight: nodeHeight * 2,
        pixelRatio: 2,
        skipFonts: true,
        cacheBust: false,
        backgroundColor: '#000000',
        style: {
          width: `${nodeWidth}px`,
          height: `${nodeHeight}px`,
          maxHeight: `${nodeHeight}px`,
          aspectRatio: 'unset',
        },
      });

      setCapturedPngUrl(dataUrl);

      // 5. Trigger automatic reliable Blob download
      downloadImageFile(dataUrl, filename);

      triggerHaptic('success');
      showToast('Скриншот готов!');
    } catch (err) {
      console.warn('Primary PNG export failed, trying fallback:', err);
      try {
        if (captureRef.current) {
          await ensureAllImagesInlinedAsDataUris(captureRef.current);
          const nodeWidth = captureRef.current.offsetWidth || 393;
          const nodeHeight = captureRef.current.offsetHeight || Math.round((nodeWidth * 16) / 9);
          const fallbackDataUrl = await toPng(captureRef.current, {
            width: nodeWidth,
            height: nodeHeight,
            canvasWidth: nodeWidth,
            canvasHeight: nodeHeight,
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
          showToast('Скриншот готов!');
          return;
        }
      } catch (fallbackErr) {
        console.error('All screenshot export methods failed:', fallbackErr);
      }
      showToast('Не удалось сформировать PNG. Попробуйте еще раз.');
    } finally {
      // 6. ALWAYS restore feed container scroll position and remove transform
      if (appliedTransform && feedInner && feedContainer) {
        feedInner.style.transform = '';
        feedContainer.scrollTop = savedScrollTop;
      }
      setIsExporting(false);
    }
  };

  const exportFilename = `instagram-direct-${activeCharacter.username}${
    isProUnlocked ? '' : '-demo'
  }.png`;

  return (
    <div className="min-h-dvh bg-[#09090B] text-zinc-100 flex flex-col w-full max-w-full overflow-x-hidden">
      {/* Desktop Top Bar (3-zone contract, hidden on narrow mobile TMA chat view for max screen space) */}
      <header
        className={`${
          mobileScreen === 'chat' ? 'hidden lg:flex' : 'flex'
        } items-center justify-between gap-4 px-4 sm:px-6 py-3.5 border-b border-white/[0.07] bg-[#09090B]/90 backdrop-blur-md sticky top-0 z-30 w-full max-w-full overflow-x-hidden`}
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

        {/* Zone 3: Header Actions (watermark & OS switcher moved into chat view) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsCustomModalOpen(true)}
            className="md:hidden min-h-[36px] px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Свой профиль
          </button>
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            title="Настройки экрана"
            className="min-h-[36px] w-[36px] rounded-xl bg-[#18181F] hover:bg-[#22222B] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Sticky Bar when in Chat Mode - Perfectly fits 320px+ without any horizontal scrolling */}
      {mobileScreen === 'chat' && (
        <div className="lg:hidden flex items-center justify-between gap-1.5 px-2.5 py-2 bg-[#09090B]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-30 w-full max-w-full overflow-x-hidden">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setMobileScreen('roster');
              setDesktopTab('roster');
            }}
            className="min-h-[36px] px-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-xs font-semibold text-white inline-flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
            title="Вернуться к списку персонажей"
          >
            <ArrowLeft className="w-4 h-4 text-[#0095F6]" />
            <span className="hidden xs:inline sm:inline">Назад</span>
          </button>

          {/* Quick OS Switcher on mobile (iOS vs Android) */}
          <div className="inline-flex items-center rounded-xl bg-[#141418] border border-white/15 p-0.5 shadow-xs shrink-0">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setSettings((s) => ({ ...s, osType: 'ios' }));
              }}
              className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
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
              className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                settings.osType === 'android'
                  ? 'bg-[#0095F6] text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🤖 Android
            </button>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              disabled={isExporting}
              onClick={handleExportScreenshot}
              title="Скачать скриншот"
              className="min-h-[36px] px-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? '...' : 'Скачать'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                setIsStarsModalOpen(true);
              }}
              title={isProUnlocked ? 'Водяные знаки убраны' : 'Убрать водяные знаки'}
              className={`min-h-[36px] px-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1 ${
                isProUnlocked
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                  : 'bg-white hover:bg-zinc-200 text-zinc-950'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isProUnlocked ? 'PRO' : 'Знаки'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Responsive Workspace */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-0 sm:px-6 py-0 sm:py-6 lg:py-8 overflow-x-hidden">
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
                Выберите селебрити или создайте своего персонажа, настройте диалог и скачайте реалистичный скриншот. Чат можно листать вверх и вниз!
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
              {/* Mobile Saved Chats Carousel at top of roster */}
              <div className="lg:hidden mb-4">
                <SavedChatsCarousel
                  savedChats={savedChats}
                  activeChatId={activeChatId}
                  isProUnlocked={isProUnlocked}
                  maxFreeChats={FREE_SAVED_CHATS_LIMIT}
                  onSelectChat={(id) => {
                    handleSelectSavedChat(id);
                    setMobileScreen('chat');
                    setDesktopTab('constructor');
                  }}
                  onCreateNewChat={handleCreateNewSavedChat}
                  onDeleteChat={handleDeleteSavedChat}
                  onDuplicateChat={handleDuplicateSavedChat}
                  onOpenStarsModal={() => setIsStarsModalOpen(true)}
                />
              </div>
              <CharacterRoster
                characters={characters}
                customCharacter={customCharacter}
                activeCharacterId={activeCharacter.id}
                activeCharacterName={activeCharacter.name}
                osType={settings.osType}
                onSelectCharacter={handleSelectCharacter}
                onOpenCustomModal={() => setIsCustomModalOpen(true)}
                onOpenChat={() => {
                  triggerHaptic('selection');
                  setMobileScreen('chat');
                  setDesktopTab('constructor');
                }}
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
                onBackToRoster={() => {
                  triggerHaptic('selection');
                  setDesktopTab('roster');
                  setMobileScreen('roster');
                }}
              />
            </div>
          </section>

          {/* RIGHT COLUMN (Instagram Direct Screen + Mobile Constructor Dock) */}
          <section
            className={`lg:col-span-5 flex flex-col items-center ${
              mobileScreen === 'chat' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Saved Chats Carousel (browse, flip, duplicate & save up to 2 chats for free) */}
            <div className="w-full max-w-[393px] mb-3 px-1">
              <SavedChatsCarousel
                savedChats={savedChats}
                activeChatId={activeChatId}
                isProUnlocked={isProUnlocked}
                maxFreeChats={FREE_SAVED_CHATS_LIMIT}
                onSelectChat={handleSelectSavedChat}
                onCreateNewChat={handleCreateNewSavedChat}
                onDeleteChat={handleDeleteSavedChat}
                onDuplicateChat={handleDuplicateSavedChat}
                onOpenStarsModal={() => setIsStarsModalOpen(true)}
              />
            </div>

            {/* Prominent OS Switcher Banner & Chat Scroll Helper directly above the phone frame */}
            <div className="w-full max-w-[393px] mb-2 px-1 flex flex-col gap-1.5">
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

              {/* Chat Scroll Quick Controls */}
              <div className="flex items-center justify-between px-2.5 py-1 bg-[#141418]/70 border border-white/[0.07] rounded-xl text-xs text-zinc-400">
                <span className="text-[11px] text-zinc-400 select-none flex items-center gap-1">
                  <span className="text-zinc-500">↕</span> Прокрутка диалога
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleScrollChatFeed('top')}
                    title="Листать вверх (к шапке профиля)"
                    className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronUp className="w-3 h-3 text-[#0095F6]" />
                    <span>Вверх</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScrollChatFeed('bottom')}
                    title="Листать вниз (к последним сообщениям)"
                    className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronDown className="w-3 h-3 text-[#0095F6]" />
                    <span>Вниз</span>
                  </button>
                </div>
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
                    isExporting={isExporting}
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
                    onToggleStoryRing={() => {
                      triggerHaptic('selection');
                      setSettings((prev) => ({
                        ...prev,
                        storyRing:
                          prev.storyRing === 'none'
                            ? 'unseen'
                            : prev.storyRing === 'unseen'
                            ? 'seen'
                            : 'none',
                      }));
                    }}
                  />
                </div>
              </div>

              {/* Mobile Quick Action Buttons directly beneath phone */}
              <div className="w-full mt-3 flex flex-col gap-2 px-1 lg:hidden">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={handleExportScreenshot}
                    className="min-h-[48px] px-3.5 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>{isExporting ? 'Рендеринг...' : 'Скачать скриншот'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('medium');
                      setIsStarsModalOpen(true);
                    }}
                    className={`min-h-[48px] px-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md ${
                      isProUnlocked
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                        : 'bg-white hover:bg-zinc-200 text-zinc-950'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>{isProUnlocked ? 'Знаки убраны' : 'Убрать водяные знаки'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setMobileScreen('roster');
                      setDesktopTab('roster');
                    }}
                    className="min-h-[42px] px-3 rounded-xl bg-[#181822] hover:bg-[#20202C] border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#0095F6]" />
                    <span>Назад к персонажам</span>
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
                  onBackToRoster={() => {
                    triggerHaptic('selection');
                    setMobileScreen('roster');
                    setDesktopTab('roster');
                  }}
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
