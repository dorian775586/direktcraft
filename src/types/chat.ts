export type CharacterCategory = 'IT' | 'Рэперы' | 'Блогеры' | 'Свой';

export interface Character {
  id: string;
  name: string;
  username: string;
  category: CharacterCategory;
  followers: string;
  postsCount?: string;
  avatar: string;
  verified: boolean;
  isOnline: boolean;
  statusText: string;
  isCustom?: boolean;
  starterMessages: ChatMessage[];
}

export type MessageSender = 'them' | 'me' | 'system';

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  liked?: boolean;
  timestampLabel?: string;
  callType?: 'audio' | 'video';
}

export type BubbleTheme =
  | 'ig_gradient'
  | 'ig_purple_blue'
  | 'ig_sunset'
  | 'messenger_blue'
  | 'solid_0095f6'
  | 'gradient'
  | 'classic_blue';

export type OsType = 'ios' | 'android';
export type AndroidNavStyle = 'gesture' | 'buttons';

export type StoryRingStatus = 'none' | 'unseen' | 'seen';

export interface DeviceSettings {
  time: string;
  batteryLevel: number;
  osType: OsType;
  androidNavStyle: AndroidNavStyle;
  showOnlineDot: boolean;
  showSeenStatus: boolean;
  showProfileIntro: boolean;
  showBatteryPercentage: boolean;
  storyRing: StoryRingStatus;
  aspectRatio: '9:16' | 'auto';
  dateDivider: string;
  bubbleTheme: BubbleTheme;
}

export interface SavedChat {
  id: string;
  title: string;
  character: Character;
  messages: ChatMessage[];
  settings: DeviceSettings;
  createdAt: number;
  updatedAt: number;
}


