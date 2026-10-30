export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  isExpanded?: boolean;
  platform?: string;
  version?: string;
  colorScheme?: 'light' | 'dark';
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  openInvoice?: (url: string, callback?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void) => void;
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  initDataUnsafe?: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function getTelegramWebApp(): TelegramWebApp | undefined {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return undefined;
}

export function initTelegramMiniApp(): { isTelegram: boolean; username?: string } {
  const tg = getTelegramWebApp();
  if (!tg) {
    return { isTelegram: false };
  }

  try {
    tg.ready();
    tg.expand();
    tg.setHeaderColor?.('#09090B');
    tg.setBackgroundColor?.('#09090B');
  } catch {
    // Ignore version-specific unsupported method errors in older clients
  }

  const hasInitData = Boolean(tg.initDataUnsafe?.user || (tg.platform && tg.platform !== 'unknown'));
  return {
    isTelegram: hasInitData,
    username: tg.initDataUnsafe?.user?.first_name,
  };
}

export function triggerHaptic(type: 'light' | 'medium' | 'selection' | 'success' | 'warning' = 'light') {
  const haptic = getTelegramWebApp()?.HapticFeedback;
  if (!haptic) return;
  try {
    if (type === 'selection') {
      haptic.selectionChanged();
    } else if (type === 'success' || type === 'warning') {
      haptic.notificationOccurred(type);
    } else {
      haptic.impactOccurred(type);
    }
  } catch {
    // Safe fallback outside TMA environment
  }
}

/**
 * Initiates a Telegram Stars (XTR) payment via WebApp.openInvoice if a real invoice link is configured,
 * or simulates the native Telegram Stars invoice callback in demo/preview mode.
 */
export function purchaseRemoveWatermarkWithStars(
  invoiceUrl: string | undefined,
  onComplete: (status: 'paid' | 'cancelled' | 'failed') => void
) {
  const tg = getTelegramWebApp();

  if (invoiceUrl && tg?.openInvoice) {
    try {
      tg.openInvoice(invoiceUrl, (status) => {
        if (status === 'paid') {
          triggerHaptic('success');
          onComplete('paid');
        } else if (status === 'cancelled') {
          onComplete('cancelled');
        } else {
          onComplete('failed');
        }
      });
      return;
    } catch {
      // Fallback to simulated Stars checkout below if invoice URL is test-only
    }
  }

  setTimeout(() => {
    triggerHaptic('success');
    onComplete('paid');
  }, 950);
}
