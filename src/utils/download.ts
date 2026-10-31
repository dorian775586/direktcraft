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

export function downloadImageFile(dataUrl: string, filename: string): boolean {
  try {
    const blob = dataUrlToBlob(dataUrl);
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.setAttribute('download', filename);
    link.target = '_self';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    }, 1000);
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
  try {
    const blob = dataUrlToBlob(dataUrl);
    const file = new File([blob], filename, { type: blob.type || 'image/png' });

    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Instagram Direct',
      });
      return true;
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return true;
    }
    console.warn('Share not completed, trying fallback download:', err);
  }

  // Fallback to file download
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
