require('dotenv').config()
const puppeteer = require("puppeteer");
const Bot = require("node-telegram-bot-api");

// Створюємо екземпляр бота
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Обробник повідомлень
bot.on("message", async (msg) => {
  console.log(msg.text);
  await handleFeedback(msg.text, msg.chat.id);
});

// Функція для обробки відгуків
async function handleFeedback(feedback, chatId) {
  try {
    const browser = await puppeteer.launch({ headless: false, slowMo: 200 });
    const page = await browser.newPage();

    await navigateToWebsite(page);
    await acceptPolicy(page);
    await selectLanguage(page);
    await enterVoucher(page, feedback);
    await fillFeedbackForm(page);

    console.log(`Відгук ${feedback} залишено`);
    await bot.sendMessage(chatId, `Відгук ${feedback} залишено`);
    await browser.close();
  } catch (error) {
    console.error(error);
    await bot.sendMessage(chatId, "Щось пішло не так");
  }
}

// Функція для переходу на сайт
async function navigateToWebsite(page) {
  await page.goto("https://www.mctellus.com");
}

// Функція для прийняття політики
async function acceptPolicy(page) {
  try {
    await page.waitForSelector('div[id="im_policy_accept_button"]');
    await page.click('div[id="im_policy_accept_button"]');
  } catch {
    console.log("Кнопка 'Продовжити' не знайдена");
  }
}

// Функція для вибору мови
async function selectLanguage(page) {
  await page.waitForSelector('div[ng-repeat="choice in dd.prompt.choices"]');
  await page.click('div[ng-repeat="choice in dd.prompt.choices"]');
  await page.waitForNavigation();
  await acceptPolicy(page);
}

// Функція для введення ваучера
async function enterVoucher(page, voucher) {
  await page.waitForSelector('input[id^="promptInput_"][role="text"]');
  await page.type('input[id^="promptInput_"][role="text"]', voucher);

  await page.waitForSelector("label.ui-checkbox");
  await page.click("label.ui-checkbox");
  await page.waitForNavigation();
}

// Функція для заповнення форми зворотного зв'язку
async function fillFeedbackForm(page) {
  for (let i = 0; i < 3; i++) {
    await page.waitForSelector("div.options.unused.noAnswer");
    await page.evaluate(() => {
      const blocks = document.querySelectorAll("div.options.unused.noAnswer");
      blocks.forEach((block) => {
        const divs = Array.from(block.querySelectorAll("div.ng-binding")).filter(
          (div) => div.innerText.trim() === "5"
        );
        if (divs.length > 0) divs[0].click();
      });
    });
  }

  const optionsToSelect = [
    "#option_710763_324290",
    "#option_1081926_469747",
    "#option_710766_324292",
    "#option_710773_324303",
    "#option_710780_324304",
    "#option_710784_324305",
    "#option_710787_324307",
  ];

  for (const option of optionsToSelect) {
    await page.waitForSelector(option);
    await page.click(option);
    await page.waitForSelector("button#nextPageLink");
    await page.click("button#nextPageLink");
  }

  await page.waitForSelector('div[ng-bind-html="choice.ordinal | unsafe"]');
  await page.evaluate(() => {
    const divs = document.querySelectorAll('div[ng-bind-html="choice.ordinal | unsafe"]');
    divs.forEach((div) => {
      if (div.innerText.trim() === "10") {
        div.click();
      }
    });
  });

  await page.waitForSelector("button#nextPageLink");
  await page.click("button#nextPageLink");
}
