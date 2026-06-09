// Отправка сообщения в Telegram. TELEGRAM_CHAT_ID может содержать
// несколько id через запятую — отправим каждому (например, тебе и Ане).
// Если переменные не заданы — тихо пропускаем, чтобы заявка сохранилась.
export async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatRaw = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatRaw) {
    console.warn("Telegram: переменные не заданы, уведомление пропущено");
    return;
  }

  const chatIds = chatRaw.split(",").map((s) => s.trim()).filter(Boolean);

  await Promise.all(
    chatIds.map(async (chatId) => {
      try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
        });
        if (!res.ok) {
          const body = await res.text();
          console.error("Telegram: ошибка отправки", chatId, res.status, body);
        }
      } catch (e) {
        console.error("Telegram: сбой запроса", chatId, e);
      }
    }),
  );
}

// Отправка PDF-документа всем chat_id
export async function sendTelegramDocument(
  filename: string,
  data: ArrayBuffer,
  caption?: string,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatRaw = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatRaw) {
    throw new Error("Telegram не настроен (нет токена или chat_id)");
  }
  const chatIds = chatRaw.split(",").map((s) => s.trim()).filter(Boolean);

  for (const chatId of chatIds) {
    const fd = new FormData();
    fd.append("chat_id", chatId);
    if (caption) fd.append("caption", caption);
    fd.append("document", new Blob([data], { type: "application/pdf" }), filename);
    const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("Telegram: ошибка документа", chatId, res.status, body);
      throw new Error("Telegram отклонил документ");
    }
  }
}
