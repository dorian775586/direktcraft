import React from 'react';
import { OsType } from '../types/chat';

interface DeviceStatusBarProps {
  time: string;
  batteryLevel: number;
  osType?: OsType;
  showBatteryPercentage?: boolean;
}

export const DeviceStatusBar: React.FC<DeviceStatusBarProps> = ({
  time,
  batteryLevel,
  osType = 'ios',
  showBatteryPercentage = true,
}) => {
  const clampedBattery = Math.max(5, Math.min(100, batteryLevel));

  if (osType === 'android') {
    return (
      <div className="flex items-center justify-between px-5 pt-2.5 pb-1.5 bg-black text-white select-none shrink-0 font-sans tracking-normal">
        {/* Android Left: Clock in Roboto style */}
        <div className="flex items-center gap-2">
          <span className="text-[13.5px] font-medium leading-none tabular-nums text-zinc-100">
            {time || '12:30'}
          </span>
        </div>

        {/* Android Right: Wi-Fi, Cellular Triangle, Battery */}
        <div className="flex items-center gap-2 text-white">
          {/* Android Wi-Fi Wedge Icon */}
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            aria-label="Wi-Fi Android"
            className="shrink-0"
          >
            <path
              d="M12 18.5C12.83 18.5 13.5 19.17 13.5 20C13.5 20.83 12.83 21.5 12 21.5C11.17 21.5 10.5 20.83 10.5 20C10.5 19.17 11.17 18.5 12 18.5Z"
              fill="white"
            />
            <path
              d="M4.93 12.93C8.83 9.03 15.17 9.03 19.07 12.93"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M1.4 9.4C7.26 3.54 16.74 3.54 22.6 9.4"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>

          {/* Android Solid Triangle Cellular Signal */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-label="Сеть Android"
            className="shrink-0"
          >
            <path
              d="M2 22H22V2L2 22Z"
              fill="white"
            />
          </svg>

          {/* Android Vertical/Modern Battery with % */}
          <div className="flex items-center gap-1 shrink-0">
            {showBatteryPercentage && (
              <span className="text-[11px] font-medium leading-none tabular-nums text-zinc-300">
                {clampedBattery}%
              </span>
            )}
            <svg
              width="11"
              height="16"
              viewBox="0 0 12 20"
              fill="none"
              aria-label={`Батарея ${clampedBattery}%`}
              className="shrink-0"
            >
              <rect x="4" y="0.5" width="4" height="2" rx="0.5" fill="white" fillOpacity="0.8" />
              <rect
                x="0.75"
                y="2.5"
                width="10.5"
                height="16.5"
                rx="2"
                stroke="white"
                strokeWidth="1.2"
              />
              {/* Gray background for missing charge */}
              <rect
                x="2"
                y="4"
                width="8"
                height="13.5"
                rx="1"
                fill="rgba(255, 255, 255, 0.25)"
              />
              {/* Active charge level (fills from bottom to top) */}
              <rect
                x="2"
                y={17.5 - Math.round((clampedBattery / 100) * 13.5)}
                width="8"
                height={Math.round((clampedBattery / 100) * 13.5)}
                rx="1"
                fill={clampedBattery <= 20 ? '#EF4444' : 'white'}
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // iOS (iPhone) Status Bar
  // Total fill width inside pill is 24.5px, height is 12px, rx is 3.8px
  const activeFillWidth = Math.max(1.5, Math.min(24.5, (clampedBattery / 100) * 24.5));
  const isLowBattery = clampedBattery <= 20;
  const fillColor = isLowBattery ? '#FF453A' : '#FFFFFF';

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

        {/* iOS Wi-Fi Icon (Authentic Apple iOS SF Symbols) */}
        <svg
          width="16"
          height="12"
          viewBox="0 0 16 12"
          fill="none"
          aria-label="Wi-Fi"
          className="shrink-0"
        >
          <circle cx="8" cy="10.2" r="1.3" fill="white" />
          <path
            d="M4.9 7.1C5.75 6.25 6.85 5.8 8 5.8C9.15 5.8 10.25 6.25 11.1 7.1"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M2.3 4.5C3.85 2.95 5.85 2.1 8 2.1C10.15 2.1 12.15 2.95 13.7 4.5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>

        {/* iOS Battery Icon (Scales with batteryLevel, gray missing charge, centered always-black digits) */}
        <div
          className="relative flex items-center justify-center shrink-0 w-[27px] h-[13px]"
          aria-label={`Заряд батареи ${clampedBattery}%`}
        >
          <svg
            width="27"
            height="13"
            viewBox="0 0 27 13"
            fill="none"
            className="shrink-0 block"
          >
            <defs>
              <clipPath id="iosBatteryPillClip">
                <rect x="0" y="0.5" width="24.5" height="12" rx="3.8" />
              </clipPath>
            </defs>

            {/* Battery interior clipped to rounded pill */}
            <g clipPath="url(#iosBatteryPillClip)">
              {/* Gray background on the entire pill for the missing charge */}
              <rect
                x="0"
                y="0.5"
                width="24.5"
                height="12"
                fill="rgba(255, 255, 255, 0.28)"
              />
              {/* Active charge level filling from left to right */}
              <rect
                x="0"
                y="0.5"
                width={activeFillWidth}
                height="12"
                fill={fillColor}
              />
            </g>

            {/* Outer border for subtle authentic iOS definition */}
            <rect
              x="0.5"
              y="1"
              width="23.5"
              height="11"
              rx="3.3"
              stroke="white"
              strokeOpacity="0.25"
              strokeWidth="0.8"
            />

            {/* Cathode bump on right */}
            <path
              d="M25.5 4.3C26.15 4.55 26.55 5.15 26.55 6.5C26.55 7.85 26.15 8.45 25.5 8.7V4.3Z"
              fill="white"
              fillOpacity="0.4"
            />

            {/* Battery digits: ALWAYS BLACK (#000000), perfectly centered in the pill */}
            {showBatteryPercentage && (
              <text
                x="12.25"
                y="6.7"
                textAnchor="middle"
                dominantBaseline="central"
                fill="#000000"
                style={{
                  fontFamily:
                    '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
                  fontWeight: 600,
                  fontSize: clampedBattery === 100 ? '9px' : '10.5px',
                  letterSpacing: clampedBattery === 100 ? '-0.5px' : '-0.3px',
                }}
              >
                {clampedBattery}
              </text>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
};

export const IosStatusBar = DeviceStatusBar;
