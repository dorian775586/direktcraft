import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  body: any;
  query: Record<string, string | string[]>;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (body: any) => VercelResponse;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow CORS for local dev / TMA previews
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    // If bot token is not configured yet, return a helpful response for developers
    return res.status(200).json({
      ok: false,
      isDemo: true,
      error: 'TELEGRAM_BOT_TOKEN is not set in environment variables.',
      message: 'Для боевых платежей в Telegram Stars добавьте TELEGRAM_BOT_TOKEN в Vercel / .env.',
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const userId = body?.userId || 'guest';
    const username = body?.username || 'user';
    const starsAmount = 39; // 39 Telegram Stars (XTR)

    const payload = JSON.stringify({
      userId,
      username,
      product: 'directcraft_no_watermark',
      createdAt: Date.now(),
    });

    // Telegram Bot API: createInvoiceLink (specifically for Stars XTR)
    // Note: for Telegram Stars, currency must be "XTR" and provider_token must be empty string "".
    const tgResponse = await fetch(`https://api.telegram.org/bot${botToken}/createInvoiceLink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'PRO: Без водяных знаков',
        description: 'Отключение водяных знаков DirectCraft и экспорт скриншотов в Retina HD качестве',
        payload,
        provider_token: '', // Required empty string for Telegram Stars
        currency: 'XTR',
        prices: [
          {
            label: 'PRO доступ (без водяных знаков)',
            amount: starsAmount,
          },
        ],
      }),
    });

    const data = await tgResponse.json();

    if (!data.ok) {
      console.error('Telegram createInvoiceLink error:', data);
      return res.status(400).json({
        ok: false,
        error: data.description || 'Failed to create Telegram Stars invoice link',
      });
    }

    return res.status(200).json({
      ok: true,
      invoiceLink: data.result,
    });
  } catch (error: any) {
    console.error('Server error creating invoice link:', error);
    return res.status(500).json({
      ok: false,
      error: error?.message || 'Internal server error',
    });
  }
}
