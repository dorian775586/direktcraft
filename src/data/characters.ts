import { Character } from '../types/chat';
import {
  AVATAR_DUROV,
  AVATAR_TRAVIS,
  AVATAR_IVLEEVA,
  AVATAR_BUSTER,
  AVATAR_ALTMAN,
  AVATAR_ELON,
  AVATAR_VITALIK,
  AVATAR_SCRIP,
  AVATAR_KREED,
  AVATAR_VLAD_A4,
} from './avatars';

function createPortraitSvgDataUri(config: {
  bgFrom: string;
  bgTo: string;
  skin: string;
  hair: string;
  shirt: string;
  accent: string;
  glasses?: boolean;
  beanie?: boolean;
  beard?: boolean;
}): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="160" y2="160" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="${config.bgFrom}"/>
        <stop offset="100%" stop-color="${config.bgTo}"/>
      </linearGradient>
    </defs>
    <rect width="160" height="160" fill="url(#bg)"/>
    <circle cx="128" cy="30" r="44" fill="${config.accent}" fill-opacity="0.18"/>
    <path d="M26 160C28 124 50 110 80 110C110 110 132 124 134 160H26Z" fill="${config.shirt}"/>
    <rect x="68" y="92" width="24" height="24" rx="10" fill="${config.skin}"/>
    <ellipse cx="80" cy="70" rx="28" ry="33" fill="${config.skin}"/>
    ${
      config.beanie
        ? `<path d="M50 64C50 42 63 31 80 31C97 31 110 42 110 64H50Z" fill="${config.hair}"/>
           <rect x="48" y="57" width="64" height="10" rx="5" fill="${config.accent}"/>`
        : `<path d="M51 68C50 44 63 32 81 32C99 32 111 45 109 68C105 55 96 49 80 49C64 49 55 56 51 68Z" fill="${config.hair}"/>`
    }
    ${
      config.glasses
        ? `<rect x="58" y="62" width="18" height="12" rx="4" fill="#111827" stroke="#E5E7EB" stroke-width="1.5"/>
           <rect x="84" y="62" width="18" height="12" rx="4" fill="#111827" stroke="#E5E7EB" stroke-width="1.5"/>
           <line x1="76" y1="67" x2="84" y2="67" stroke="#E5E7EB" stroke-width="1.5"/>`
        : `<circle cx="69" cy="68" r="2.8" fill="#18181B"/>
           <circle cx="91" cy="68" r="2.8" fill="#18181B"/>`
    }
    ${
      config.beard
        ? `<path d="M56 79C58 96 68 104 80 104C92 104 102 96 104 79C97 86 89 89 80 89C71 89 63 86 56 79Z" fill="${config.hair}" fill-opacity="0.88"/>`
        : ''
    }
    <path d="M72 84C75 88 85 88 88 84" stroke="#7C2D12" stroke-opacity="0.55" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`;
  try {
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
      const base64 = btoa(unescape(encodeURIComponent(svg)));
      return `data:image/svg+xml;base64,${base64}`;
    }
  } catch {
    // fallback
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEFAULT_CUSTOM_AVATAR = createPortraitSvgDataUri({
  bgFrom: '#1E293B',
  bgTo: '#0F172A',
  skin: '#F1C27D',
  hair: '#18181B',
  shirt: '#0095F6',
  accent: '#60A5FA',
});

export const CELEBRITY_CHARACTERS: Character[] = [
  {
    id: 'durov',
    name: 'Pavel Durov',
    username: 'durov',
    category: 'IT',
    followers: '1.6M подписчиков',
    avatar: AVATAR_DUROV,
    verified: true,
    isOnline: true,
    statusText: 'В сети',
    starterMessages: [
      { id: 'd1', sender: 'them', text: 'Привет. Видел твой новый мини-апп в Telegram.' },
      { id: 'd2', sender: 'me', text: 'Павел?! Серьезно? Как тебе интерфейс?' },
      { id: 'd3', sender: 'them', text: 'Чисто сделано. Готов обсудить грант в TON сегодня вечером?', liked: true },
    ],
  },
  {
    id: 'travis',
    name: 'flame',
    username: 'travisscott',
    category: 'Рэперы',
    followers: '58.4M подписчиков',
    avatar: AVATAR_TRAVIS,
    verified: true,
    isOnline: true,
    statusText: 'В сети',
    starterMessages: [
      { id: 't1', sender: 'them', text: 'yo send me that beat pack rn' },
      { id: 't2', sender: 'me', text: 'Already sent to your studio mail, check track #3' },
      { id: 't3', sender: 'them', text: 'straight fire. flying you out to LA next week', liked: true },
    ],
  },
  {
    id: 'ivleeva',
    name: 'НАСТЯ ИВЛЕЕВА',
    username: '_agentgirl_',
    category: 'Блогеры',
    followers: '17.9M подписчиков',
    avatar: AVATAR_IVLEEVA,
    verified: true,
    isOnline: true,
    statusText: 'В сети',
    starterMessages: [
      { id: 'i1', sender: 'them', text: 'Слушай, у нас освободилось место на закрытом показе в пятницу' },
      { id: 'i2', sender: 'me', text: 'Ого, во сколько сбор? Буду 100%' },
      { id: 'i3', sender: 'them', text: 'В 20:30, внесла тебя в главный список на входе', liked: true },
    ],
  },
  {
    id: 'buster',
    name: 'Слава Бустер',
    username: 'busterzy',
    category: 'Блогеры',
    followers: '4.2M подписчиков',
    avatar: AVATAR_BUSTER,
    verified: true,
    isOnline: true,
    statusText: 'В сети',
    starterMessages: [
      { id: 'b1', sender: 'them', text: 'Братан, залетаешь сегодня к нам на стрим в 21:00?' },
      { id: 'b2', sender: 'me', text: 'Да, уже настроил микрофон, буду через 15 минут' },
      { id: 'b3', sender: 'them', text: 'Идеально, сейчас скину ссылку в дискорд', liked: true },
    ],
  },
  {
    id: 'altman',
    name: 'Sam Altman',
    username: 'sama',
    category: 'IT',
    followers: '2.1M подписчиков',
    avatar: AVATAR_ALTMAN,
    verified: true,
    isOnline: false,
    statusText: 'Был(а) 12 мин. назад',
    starterMessages: [
      { id: 's1', sender: 'them', text: 'Hey, saw your product demo on X this morning.' },
      { id: 's2', sender: 'me', text: 'Thanks Sam! Built the whole MVP over the weekend.' },
      { id: 's3', sender: 'them', text: 'Are you in SF this month? Let’s grab coffee.', liked: true },
    ],
  },
  {
    id: 'elon',
    name: 'Elon Musk',
    username: 'elonmusk',
    category: 'IT',
    followers: '14.8M подписчиков',
    avatar: AVATAR_ELON,
    verified: true,
    isOnline: true,
    statusText: 'В сети',
    starterMessages: [
      { id: 'e1', sender: 'them', text: 'Interesting engineering approach. How fast does it scale?' },
      { id: 'e2', sender: 'me', text: 'Sub-50ms latency globally on edge nodes.' },
      { id: 'e3', sender: 'them', text: 'Impressive. DM me your contact, let’s talk.', liked: true },
    ],
  },
  {
    id: 'vitalik',
    name: 'Vitalik Buterin',
    username: 'vitalik.eth',
    category: 'IT',
    followers: '1.9M подписчиков',
    avatar: AVATAR_VITALIK,
    verified: true,
    isOnline: true,
    statusText: 'В сети',
    starterMessages: [
      { id: 'v1', sender: 'them', text: 'Привет! Прочитал твою заметку по zk-proofs.' },
      { id: 'v2', sender: 'me', text: 'Виталик, рад слышать! Планируем выложить код на GitHub завтра.' },
      { id: 'v3', sender: 'them', text: 'Скинь репо как выложишь, сделаю ревью.', liked: true },
    ],
  },
  {
    id: 'scrip',
    name: 'Скриптонит',
    username: 'real_scrip',
    category: 'Рэперы',
    followers: '3.4M подписчиков',
    avatar: AVATAR_SCRIP,
    verified: true,
    isOnline: false,
    statusText: 'Был(а) 5 мин. назад',
    starterMessages: [
      { id: 'sc1', sender: 'them', text: 'Салам, скинь дорожки баса из вчерашнего демо в WAV' },
      { id: 'sc2', sender: 'me', text: 'Салам! Уже залил архивом в облако, лови ссылку' },
      { id: 'sc3', sender: 'them', text: 'От души, ночью на студии сведем в финал', liked: true },
    ],
  },
  {
    id: 'kreed',
    name: 'Егор Крид',
    username: 'egorkreed',
    category: 'Рэперы',
    followers: '14.6M подписчиков',
    avatar: AVATAR_KREED,
    verified: true,
    isOnline: true,
    statusText: 'В сети',
    starterMessages: [
      { id: 'k1', sender: 'them', text: 'Йо, идея для клипа пушка. Когда сможешь приехать на площадку?' },
      { id: 'k2', sender: 'me', text: 'Могу завтра к обеду подъехать со всей командой' },
      { id: 'k3', sender: 'them', text: 'Договорились, локацию сейчас отправлю', liked: true },
    ],
  },
  {
    id: 'vlad_a4',
    name: 'Влад А4',
    username: 'a4omg',
    category: 'Блогеры',
    followers: '7.8M подписчиков',
    avatar: AVATAR_VLAD_A4,
    verified: true,
    isOnline: true,
    statusText: 'В сети',
    starterMessages: [
      { id: 'a1', sender: 'them', text: 'Привет! Готов сниматься в новом ролике на выходных?' },
      { id: 'a2', sender: 'me', text: 'Конечно! Какой челлендж на этот раз?' },
      { id: 'a3', sender: 'them', text: 'Секрет до съемок, но бюджет рекордный, жди билеты!', liked: true },
    ],
  },
];

export const QUICK_TEMPLATES: { label: string; sender: 'them' | 'me'; text: string }[] = [
  { label: '«Ты где пропал?»', sender: 'them', text: 'Ты где пропал? Все уже ждут только тебя' },
  { label: '«Скинь карту»', sender: 'them', text: 'Скинь номер карты, переведу за проект сейчас' },
  { label: '«Го коллаб»', sender: 'them', text: 'Видел твой последний ролик, давай сделаем совместку?' },
  { label: '«Буду через 10 мин»', sender: 'me', text: 'Уже выезжаю, буду на месте через 10 минут' },
];
