import React, { useRef, useState } from 'react';
import { Character } from '../types/chat';
import { DEFAULT_CUSTOM_AVATAR } from '../data/characters';
import { Upload, X, ArrowLeft } from 'lucide-react';
import { VerifiedBadge } from './InstagramHeader';

interface CustomCharacterModalProps {
  isOpen: boolean;
  initialCharacter: Character | null;
  onClose: () => void;
  onSave: (character: Character) => void;
}

export const CustomCharacterModal: React.FC<CustomCharacterModalProps> = ({
  isOpen,
  initialCharacter,
  onClose,
  onSave,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState(initialCharacter?.name || '');
  const [username, setUsername] = useState(initialCharacter?.username || '');
  const [statusText, setStatusText] = useState(initialCharacter?.statusText || 'В сети');
  const [followers, setFollowers] = useState(initialCharacter?.followers || '1,7 млн');
  const [postsCount, setPostsCount] = useState(initialCharacter?.postsCount || '162');
  const [verified, setVerified] = useState(initialCharacter?.verified ?? true);
  const [isOnline, setIsOnline] = useState(initialCharacter?.isOnline ?? true);
  const [avatar, setAvatar] = useState(initialCharacter?.avatar || DEFAULT_CUSTOM_AVATAR);

  React.useEffect(() => {
    if (isOpen) {
      setName(initialCharacter?.name || '');
      setUsername(initialCharacter?.username || '');
      setStatusText(initialCharacter?.statusText || 'В сети');
      setFollowers(initialCharacter?.followers || '1,7 млн');
      setPostsCount(initialCharacter?.postsCount || '162');
      setVerified(initialCharacter?.verified ?? true);
      setIsOnline(initialCharacter?.isOnline ?? true);
      setAvatar(initialCharacter?.avatar || DEFAULT_CUSTOM_AVATAR);
    }
  }, [isOpen, initialCharacter]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim() || 'Тайный контакт';
    const cleanUsername = username.trim().replace(/^@/, '') || 'custom_user';

    const customChar: Character = {
      id: 'custom_character',
      name: cleanName,
      username: cleanUsername,
      category: 'Свой',
      followers: followers.trim() || '1,7 млн',
      postsCount: postsCount.trim() || '162',
      avatar: avatar || DEFAULT_CUSTOM_AVATAR,
      verified,
      isOnline,
      statusText: statusText.trim() || 'В сети',
      isCustom: true,
      starterMessages: initialCharacter?.starterMessages || [
        { id: 'c1', sender: 'them', text: 'Привет! Давно хотел написать тебе лично.' },
        { id: 'c2', sender: 'me', text: 'Ого, неожиданно увидеть сообщение в директе!' },
      ],
    };

    onSave(customChar);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4 touch-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md bg-[#141418] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[88dvh] sm:max-h-[85vh] flex flex-col my-auto overflow-hidden animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed & Touch-None */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 shrink-0 bg-[#141418] touch-none">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[38px] px-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer transition-colors shrink-0"
              title="Назад"
            >
              <ArrowLeft className="w-4 h-4 text-[#0095F6]" />
              <span>Назад</span>
            </button>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white truncate">Свой персонаж ✨</h2>
              <p className="text-xs text-zinc-400 mt-0.5 truncate">
                Загрузите фото и настройте профиль
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-zinc-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Scrollable Form Body with touch-pan-y and isolated scrolling */}
          <div
            className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain touch-pan-y"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
          {/* Avatar Uploader via <input type="file"> */}
          <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#1C1C22] border border-white/[0.06]">
            <div className="relative shrink-0">
              <img
                src={avatar || DEFAULT_CUSTOM_AVATAR}
                alt="Предпросмотр аватарки"
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover bg-zinc-800 border border-white/10"
              />
              {isOnline && (
                <span className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-[#1CD14F] border-2 border-[#1C1C22]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#0095F6] hover:bg-[#0081D6] text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Upload className="w-4 h-4" />
                Загрузить аватарку
              </button>
              <p className="text-[11px] text-zinc-400 mt-1.5">
                JPG, PNG или WEBP с телефона или ПК
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Имя в шапке чата
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Криштиану Роналду"
                maxLength={32}
                required
                className="w-full h-11 px-3.5 rounded-xl bg-[#1C1C22] border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#0095F6]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Никнейм (без @)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="cristiano"
                maxLength={30}
                required
                className="w-full h-11 px-3.5 rounded-xl bg-[#1C1C22] border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#0095F6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Подписчики (в шапке)
              </label>
              <input
                type="text"
                value={followers}
                onChange={(e) => setFollowers(e.target.value)}
                placeholder="1,7 млн"
                maxLength={28}
                className="w-full h-11 px-3.5 rounded-xl bg-[#1C1C22] border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#0095F6]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Публикации (в шапке)
              </label>
              <input
                type="text"
                value={postsCount}
                onChange={(e) => setPostsCount(e.target.value)}
                placeholder="162"
                maxLength={28}
                className="w-full h-11 px-3.5 rounded-xl bg-[#1C1C22] border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#0095F6]"
              />
            </div>
          </div>

          {/* Toggles: Verified & Online */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setVerified((v) => !v)}
              className={`min-h-[42px] flex-1 px-3.5 py-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                verified
                  ? 'bg-[#0095F6]/15 border-[#0095F6]/60 text-white'
                  : 'bg-[#1C1C22] border-white/10 text-zinc-400'
              }`}
            >
              <VerifiedBadge className="w-4 h-4" />
              Синяя галочка: {verified ? 'Вкл' : 'Выкл'}
            </button>

            <button
              type="button"
              onClick={() => setIsOnline((o) => !o)}
              className={`min-h-[42px] flex-1 px-3.5 py-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                isOnline
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                  : 'bg-[#1C1C22] border-white/10 text-zinc-400'
              }`}
            >
              Зеленая точка: {isOnline ? 'Вкл' : 'Выкл'}
            </button>
          </div>
        </div>

        {/* Footer - Fixed & Touch-None */}
        <div className="p-4 sm:p-5 border-t border-white/10 shrink-0 bg-[#141418] flex items-center gap-2.5 touch-none">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[46px] px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-sm font-semibold text-zinc-300 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад</span>
          </button>
          <button
            type="submit"
            className="min-h-[46px] flex-1 px-5 rounded-xl bg-[#0095F6] hover:bg-[#0081D6] text-sm font-bold text-white shadow-md transition-colors cursor-pointer"
          >
            Открыть чат с персонажем
          </button>
        </div>
      </form>
    </div>
  </div>
);
};
