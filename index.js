require("dotenv").config();

const { Bot, InlineKeyboard, webhookCallback } = require("grammy");
const express = require("express");

const { TELEGRAM_TOKEN, TELEGRAM_WEBHOOK_URL, WEBAPP_URL } = process.env;

const bot = new Bot(TELEGRAM_TOKEN);

bot.command("start", async (ctx) => {
    await ctx.reply(
        "Привет! Нажми кнопку ниже, чтобы начать игру:",
        {
            reply_markup: new InlineKeyboard()
                .webApp("🎮 Играть", WEBAPP_URL)
        }
    );
});

async function setupWebhook() {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${TELEGRAM_WEBHOOK_URL}`
    );
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await res.json();
    console.log("Telegram webhook", data);
  } catch (err) {
    console.error("An error occured while setting telegram webhook", err);
  }
}

// Start the server
if (process.env.NODE_ENV === "production") {
  // Use Webhooks for the production server
  const app = express();
  app.use(express.json());
  app.use(webhookCallback(bot, "express"));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });

  setupWebhook();
} else {
  // Use Long Polling for development
  bot.start();
}
