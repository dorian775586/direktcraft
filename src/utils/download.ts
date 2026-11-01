/**
 * Utility for robust image downloading, clipboard copying, and mobile sharing.
 * Works reliably inside iframes (Chrome/Safari) and Telegram Mini App webviews.
 */

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64Data] = dataUrl.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export function createBlobUrlFromDataUrl(dataUrl: string): string {
  const blob = dataUrlToBlob(dataUrl);
  return URL.createObjectURL(blob);
}

export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isMobileUA = /iPhone|iPad|iPod|Android|Mobile/i.test(ua);
  const isTouchScreen =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0));
  return isMobileUA || (Boolean(isTouchScreen) && typeof window !== 'undefined' && window.innerWidth < 1024);
}

export function downloadImageFile(dataUrl: string, filename: string): boolean {
  try {
    const blob = dataUrlToBlob(dataUrl);
    const blobUrl = URL.createObjectURL(blob);

    // Standard DOM anchor download (Works great on desktop Chrome, Firefox, Edge, and Android Chrome)
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.setAttribute('download', filename);
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
    }, 1200);
    return true;
  } catch (err) {
    console.warn('Blob URL download failed, trying data-uri fallback:', err);
    try {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      link.setAttribute('download', filename);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 1000);
      return true;
    } catch (e2) {
      console.error('All download mechanisms failed:', e2);
      return false;
    }
  }
}

export async function shareOrSaveImage(dataUrl: string, filename: string): Promise<boolean> {
  const isMobile = isMobileDevice();
  const blob = dataUrlToBlob(dataUrl);

  // 1. Try Web Share API with File payload (the only native API that triggers "Сохранить изображение" on iOS / Android)
  try {
    const file = new File([blob], filename, { type: blob.type || 'image/png' });

    if (
      typeof navigator !== 'undefined' &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({
        files: [file],
        title: 'Instagram Direct',
      });
      return true;
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      // User closed the native share dialog intentionally
      return true;
    }
    console.warn('Share with file payload not completed, trying fallback:', err);
  }

  // 2. On mobile, if Web Share is unavailable (e.g. restrictive iframe or older browser),
  // open the image in a new tab/window so the user can easily tap or hold to save to Photos
  if (isMobile) {
    try {
      const blobUrl = URL.createObjectURL(blob);
      const newWin = window.open(blobUrl, '_blank');
      if (newWin) {
        setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
        return true;
      }
    } catch {
      // window.open blocked, continue to standard download
    }
  }

  // 3. Fallback to standard anchor download
  return downloadImageFile(dataUrl, filename);
}

export async function copyImageToClipboard(dataUrl: string): Promise<boolean> {
  try {
    const blob = dataUrlToBlob(dataUrl);
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard copy failed:', err);
  }
  return false;
}
