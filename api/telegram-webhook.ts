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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST for webhooks.' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.warn('TELEGRAM_BOT_TOKEN is not configured on server.');
    return res.status(200).json({ ok: false, error: 'TELEGRAM_BOT_TOKEN missing' });
  }

  try {
    let update = req.body;
    if (typeof update === 'string') {
      try {
        update = JSON.parse(update);
      } catch {
        update = {};
      }
    }

    // 1. Handle pre_checkout_query (REQUIRED for Telegram Stars checkout to succeed)
    // Telegram expects the bot to approve or reject the pre-checkout query within 10 seconds.
    if (update?.pre_checkout_query) {
      const preCheckoutQuery = update.pre_checkout_query;
      console.log('Received pre_checkout_query:', {
        id: preCheckoutQuery.id,
        from: preCheckoutQuery.from,
        currency: preCheckoutQuery.currency,
        total_amount: preCheckoutQuery.total_amount,
        payload: preCheckoutQuery.invoice_payload,
      });

      // Confirm the transaction by sending answerPreCheckoutQuery with ok: true
      const answerRes = await fetch(`https://api.telegram.org/bot${botToken}/answerPreCheckoutQuery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pre_checkout_query_id: preCheckoutQuery.id,
          ok: true,
        }),
      });

      const answerData = await answerRes.json();
      console.log('answerPreCheckoutQuery response:', answerData);

      return res.status(200).json({ ok: true, step: 'pre_checkout_approved' });
    }

    // 2. Handle successful_payment (Sent after Stars are charged)
    if (update?.message?.successful_payment) {
      const payment = update.message.successful_payment;
      const chatId = update.message.chat.id;
      const user = update.message.from;

      console.log('⭐️ Successful Telegram Stars Payment:', {
        chatId,
        user,
        currency: payment.currency,
        totalAmount: payment.total_amount,
        chargeId: payment.telegram_payment_charge_id,
        payload: payment.invoice_payload,
      });

      // Optional: Send a confirmation message to the user in chat
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: `⭐️ Оплата ${payment.total_amount} Stars успешно принята!\n\nPRO-режим активирован: водяные знаки отключены, доступен экспорт Retina HD.`,
          }),
        });
      } catch (msgErr) {
        console.warn('Could not send confirmation message to user:', msgErr);
      }

      return res.status(200).json({ ok: true, step: 'payment_processed' });
    }

    // Default response for other updates (/start, etc.)
    return res.status(200).json({ ok: true, message: 'Update received' });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    // Return 200 so Telegram does not aggressively retry failed webhooks
    return res.status(200).json({ ok: false, error: error?.message || 'Processing error' });
  }
}
