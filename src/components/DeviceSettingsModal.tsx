import React from 'react';
import { DeviceSettings, Character } from '../types/chat';
import { X } from 'lucide-react';

interface DeviceSettingsModalProps {
  isOpen: boolean;
  settings: DeviceSettings;
  activeCharacter?: Character;
  onUpdateSettings: (patch: Partial<DeviceSettings>) => void;
  onUpdateCharacter?: (patch: Partial<Character>) => void;
  onClose: () => void;
}

export const DeviceSettingsModal: React.FC<DeviceSettingsModalProps> = ({
  isOpen,
  settings,
  activeCharacter,
  onUpdateSettings,
  onUpdateCharacter,
  onClose,
}) => {
  if (!isOpen) return null;

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
          <div>
            <h2 className="text-base font-bold text-white">Настройки экрана (iOS / Android)</h2>
            <p className="text-xs text-zinc-400">Детализация статус-бара, навигации и чата</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-zinc-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Area with touch-pan-y */}
        <div
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain touch-pan-y"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* OS Switcher: iOS vs Android */}
          <div>
            <span className="block text-xs font-medium text-zinc-300 mb-1.5">
              Интерфейс системы
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ osType: 'ios' })}
                className={`min-h-[44px] px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  (settings.osType ?? 'ios') === 'ios'
                    ? 'bg-[#0095F6]/15 border-[#0095F6] text-white shadow-xs'
                    : 'bg-[#1C1C22] border-white/10 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="text-base">🍏</span>
                <span>iOS (iPhone)</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ osType: 'android' })}
                className={`min-h-[44px] px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  settings.osType === 'android'
                    ? 'bg-[#0095F6]/15 border-[#0095F6] text-white shadow-xs'
                    : 'bg-[#1C1C22] border-white/10 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="text-base">🤖</span>
                <span>Android</span>
              </button>
            </div>
          </div>

          {/* Android Navigation Style */}
          {settings.osType === 'android' && (
            <div className="bg-[#1C1C22]/60 p-2.5 rounded-xl border border-white/10">
              <span className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                Навигация Android внизу экрана
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ androidNavStyle: 'gesture' })}
                  className={`min-h-[38px] px-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer ${
                    settings.androidNavStyle !== 'buttons'
                      ? 'bg-[#252530] border-[#0095F6] text-white'
                      : 'bg-black/30 border-white/10 text-zinc-400'
                  }`}
                >
                  <span>Жесты (полоса)</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ androidNavStyle: 'buttons' })}
                  className={`min-h-[38px] px-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer ${
                    settings.androidNavStyle === 'buttons'
                      ? 'bg-[#252530] border-[#0095F6] text-white'
                      : 'bg-black/30 border-white/10 text-zinc-400'
                  }`}
                >
                  <span>3 кнопки (◀ ● ■)</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                {settings.osType === 'android' ? 'Время (Android)' : 'Время (iOS)'}
              </label>
              <input
                type="text"
                value={settings.time}
                onChange={(e) => onUpdateSettings({ time: e.target.value })}
                placeholder="12:21"
                maxLength={8}
                className="w-full h-11 px-3.5 rounded-xl bg-[#1C1C22] border border-white/10 text-sm text-white tabular-nums focus:outline-none focus:border-[#3797F0]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Заряд батареи ({settings.batteryLevel}%)
              </label>
              <input
                type="range"
                min={5}
                max={100}
                value={settings.batteryLevel}
                onChange={(e) => onUpdateSettings({ batteryLevel: Number(e.target.value) })}
                className="w-full h-11 accent-[#0095F6] cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Дата над перепиской
            </label>
            <input
              type="text"
              value={settings.dateDivider}
              onChange={(e) => onUpdateSettings({ dateDivider: e.target.value })}
              placeholder="Сегодня, 9:38"
              maxLength={32}
              className="w-full h-11 px-3.5 rounded-xl bg-[#1C1C22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#0095F6]"
            />
          </div>

          {/* Custom profile stats (Followers & Publications) for active character */}
          {activeCharacter && onUpdateCharacter && (
            <div className="p-3 rounded-2xl bg-[#1C1C22] border border-white/10 space-y-2.5">
              <span className="block text-xs font-semibold text-white">
                Данные профиля Instagram ({activeCharacter.name})
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">
                    Подписчики
                  </label>
                  <input
                    type="text"
                    value={activeCharacter.followers || ''}
                    onChange={(e) => onUpdateCharacter({ followers: e.target.value })}
                    placeholder="1,7 млн"
                    className="w-full h-9 px-3 rounded-lg bg-[#141418] border border-white/10 text-xs text-white focus:outline-none focus:border-[#0095F6]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">
                    Публикации
                  </label>
                  <input
                    type="text"
                    value={activeCharacter.postsCount || ''}
                    onChange={(e) => onUpdateCharacter({ postsCount: e.target.value })}
                    placeholder="162"
                    className="w-full h-9 px-3 rounded-lg bg-[#141418] border border-white/10 text-xs text-white focus:outline-none focus:border-[#0095F6]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bubble Theme Switcher (Solid only) */}
          <div>
            <span className="block text-xs font-medium text-zinc-300 mb-1.5">
              Цвет исходящих сообщений (сплошной)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ bubbleTheme: 'solid_0095f6' })}
                className={`min-h-[42px] px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  settings.bubbleTheme === 'solid_0095f6' || settings.bubbleTheme === 'classic_blue' || settings.bubbleTheme === 'gradient' || settings.bubbleTheme === 'ig_gradient'
                    ? 'bg-[#252530] border-[#0095F6] text-white shadow-xs'
                    : 'bg-[#1C1C22] border-white/10 text-zinc-400'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-[#0095F6] shrink-0" />
                <span>Синий (#0095F6)</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ bubbleTheme: 'messenger_blue' })}
                className={`min-h-[42px] px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  settings.bubbleTheme === 'messenger_blue'
                    ? 'bg-[#252530] border-[#0084FE] text-white shadow-xs'
                    : 'bg-[#1C1C22] border-white/10 text-zinc-400'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-[#0084FE] shrink-0" />
                <span>Meta (#0084FE)</span>
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-1">
            {/* iOS Battery Percentage In Digits Toggle */}
            <button
              type="button"
              onClick={() => onUpdateSettings({ showBatteryPercentage: !settings.showBatteryPercentage })}
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#1C1C22] border border-white/10 flex items-center justify-between text-xs text-zinc-200 cursor-pointer"
            >
              <div className="flex flex-col text-left">
                <span>Заряд батареи цифрами на iPhone</span>
                <span className="text-[10px] text-zinc-400">Процент внутри значка аккумулятора (как в iOS)</span>
              </div>
              <span className={settings.showBatteryPercentage ? 'text-[#0095F6] font-semibold' : 'text-zinc-500'}>
                {settings.showBatteryPercentage ? 'Вкл (цифры)' : 'Выкл'}
              </span>
            </button>

            {/* Profile Intro Card Toggle */}
            <button
              type="button"
              onClick={() => onUpdateSettings({ showProfileIntro: !settings.showProfileIntro })}
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#1C1C22] border border-white/10 flex items-center justify-between text-xs text-zinc-200 cursor-pointer"
            >
              <div className="flex flex-col text-left">
                <span>Шапка профиля сверху чата</span>
                <span className="text-[10px] text-zinc-400">Подписчики, публикации, ссылка и кнопка</span>
              </div>
              <span className={settings.showProfileIntro ? 'text-[#0095F6] font-semibold' : 'text-zinc-500'}>
                {settings.showProfileIntro ? 'Вкл' : 'Выкл'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateSettings({ showOnlineDot: !settings.showOnlineDot })}
              className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#1C1C22] border border-white/10 flex items-center justify-between text-xs text-zinc-200 cursor-pointer"
            >
              <span>Зеленый индикатор онлайн на аватарке</span>
              <span className={settings.showOnlineDot ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}>
                {settings.showOnlineDot ? 'Вкл' : 'Выкл'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateSettings({ showSeenStatus: !settings.showSeenStatus })}
              className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#1C1C22] border border-white/10 flex items-center justify-between text-xs text-zinc-200 cursor-pointer"
            >
              <span>Подпись «Просмотрено» под моим сообщением</span>
              <span className={settings.showSeenStatus ? 'text-[#0095F6] font-semibold' : 'text-zinc-500'}>
                {settings.showSeenStatus ? 'Вкл' : 'Выкл'}
              </span>
            </button>
          </div>
        </div>

        {/* Footer - Fixed & Touch-None */}
        <div className="p-4 sm:p-5 border-t border-white/10 shrink-0 bg-[#141418] touch-none">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[46px] rounded-xl bg-[#0095F6] hover:bg-[#0081D6] text-sm font-bold text-white shadow-md transition-colors cursor-pointer"
          >
            Применить настройки
          </button>
        </div>
      </div>
    </div>
  );
};
