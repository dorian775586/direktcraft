import React from 'react';

interface IosStatusBarProps {
  time: string;
  batteryLevel: number;
}

export const IosStatusBar: React.FC<IosStatusBarProps> = ({ time, batteryLevel }) => {
  const clampedBattery = Math.max(5, Math.min(100, batteryLevel));
  // Inner battery width max is 18px inside a 22px body
  const fillWidth = Math.round((clampedBattery / 100) * 18);

  return (
    <div className="ios-font flex items-center justify-between px-6 pt-3.5 pb-2 bg-black text-white select-none shrink-0">
      {/* Left: Time (e.g., 9:41) */}
      <div className="w-16 text-[15px] font-semibold tracking-[-0.02em] leading-none tabular-nums">
        {time || '9:41'}
      </div>

      {/* Right: Cellular, Wi-Fi, Battery */}
      <div className="flex items-center gap-[6px]">
        {/* iOS Cellular Signal Bars */}
        <svg
          width="18"
          height="12"
          viewBox="0 0 18 12"
          fill="none"
          aria-label="Уровень сигнала"
          className="shrink-0"
        >
          <rect x="1" y="8" width="3" height="3.5" rx="1" fill="white" />
          <rect x="5.5" y="6" width="3" height="5.5" rx="1" fill="white" />
          <rect x="10" y="3.5" width="3" height="8" rx="1" fill="white" />
          <rect x="14.5" y="1" width="3" height="10.5" rx="1" fill="white" />
        </svg>

        {/* iOS Wi-Fi Icon */}
        <svg
          width="16"
          height="12"
          viewBox="0 0 16 12"
          fill="none"
          aria-label="Wi-Fi"
          className="shrink-0"
        >
          <path
            d="M8 9.6C8.77 9.6 9.4 10.23 9.4 11C9.4 11.77 8.77 12.4 8 12.4C7.23 12.4 6.6 11.77 6.6 11C6.6 10.23 7.23 9.6 8 9.6Z"
            fill="white"
          />
          <path
            d="M4.65 7.75C5.55 6.85 6.72 6.35 8 6.35C9.28 6.35 10.45 6.85 11.35 7.75"
            stroke="white"
            strokeWidth="1.65"
            strokeLinecap="round"
          />
          <path
            d="M2.15 5.2C3.72 3.63 5.79 2.75 8 2.75C10.21 2.75 12.28 3.63 13.85 5.2"
            stroke="white"
            strokeWidth="1.65"
            strokeLinecap="round"
          />
        </svg>

        {/* iOS Battery Icon */}
        <svg
          width="27"
          height="13"
          viewBox="0 0 27 13"
          fill="none"
          aria-label={`Заряд батареи ${clampedBattery}%`}
          className="shrink-0"
        >
          <rect
            x="0.75"
            y="1"
            width="22"
            height="11"
            rx="3.5"
            stroke="white"
            strokeOpacity="0.4"
            strokeWidth="1.15"
          />
          <rect
            x="2.5"
            y="2.75"
            width={fillWidth}
            height="7.5"
            rx="1.8"
            fill={clampedBattery <= 20 ? '#FF453A' : 'white'}
          />
          <path
            d="M24.2 4.5C25.05 4.82 25.55 5.55 25.55 6.5C25.55 7.45 25.05 8.18 24.2 8.5V4.5Z"
            fill="white"
            fillOpacity="0.45"
          />
        </svg>
      </div>
    </div>
  );
};
