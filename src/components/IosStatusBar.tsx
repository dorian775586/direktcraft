import React from 'react';
import { DeviceStatusBar } from './DeviceStatusBar';

export interface IosStatusBarProps {
  time: string;
  batteryLevel: number;
  showBatteryPercentage?: boolean;
}

export const IosStatusBar: React.FC<IosStatusBarProps> = ({
  time,
  batteryLevel,
  showBatteryPercentage = true,
}) => {
  return (
    <DeviceStatusBar
      time={time}
      batteryLevel={batteryLevel}
      osType="ios"
      showBatteryPercentage={showBatteryPercentage}
    />
  );
};

