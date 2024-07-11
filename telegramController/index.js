require("dotenv").config();

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true,
});

bot.on("message", async (msg) => {
  vidguc(msg.text, msg.chat.id);
});

