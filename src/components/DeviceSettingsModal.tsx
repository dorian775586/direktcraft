import React from 'react';
import { DeviceSettings } from '../types/chat';
import { X } from 'lucide-react';

interface DeviceSettingsModalProps {
  isOpen: boolean;
  settings: DeviceSettings;
  onUpdateSettings: (patch: Partial<DeviceSettings>) => void;
  onClose: () => void;
}

export const DeviceSettingsModal: React.FC<DeviceSettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#141418] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Настройки экрана (iOS / Android)</h2>
            <p className="text-xs text-zinc-400">Детализация статус-бара, навигации и параметров чата</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-zinc-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
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
                placeholder="9:41"
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

            <button
              type="button"
              onClick={() => onUpdateSettings({ showProfileIntro: !settings.showProfileIntro })}
              className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#1C1C22] border border-white/10 flex items-center justify-between text-xs text-zinc-200 cursor-pointer"
            >
              <span>Карточка профиля персонажа вверху чата</span>
              <span className={settings.showProfileIntro ? 'text-[#0095F6] font-semibold' : 'text-zinc-500'}>
                {settings.showProfileIntro ? 'Вкл' : 'Выкл'}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[46px] mt-2 rounded-xl bg-[#0095F6] hover:bg-[#0081D6] text-sm font-semibold text-white transition-colors cursor-pointer"
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
};
