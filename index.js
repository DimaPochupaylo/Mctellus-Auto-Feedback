const puppeteer = require("puppeteer");
const Bot = require("node-telegram-bot-api");

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true,
});

function delay(ms) {
  // Затримує на необхідний час
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function continueWindow(page) {
  try {
    await page.waitForSelector('div[id="im_policy_accept_button"]');
    await page.evaluate(() => {
      const div = document.querySelector('div[id="im_policy_accept_button"]');
      div.click();
    });
  } catch (e) {
    console.log("Продовжити не було");
  }
}

async function chooseLanguage(page) {
  await page.waitForSelector('div[ng-repeat="choice in dd.prompt.choices"]');
  await page.evaluate(() => {
    const div = document.querySelector(
      'div[ng-repeat="choice in dd.prompt.choices"]'
    );
    div.click();
  });
}

async function voucherEntry(vaucher, page) {
  await page.waitForSelector('input[id^="promptInput_"][role="text"]');
  await page.type('input[id^="promptInput_"][role="text"]', vaucher);

  // Натискання на div з позначкою "Continue"
  await page.waitForSelector("label.ui-checkbox");
  await page.evaluate(() => {
    const label = document.querySelector("label.ui-checkbox");
    label.click();
  });
}

async function chooseFive(page) {
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

  // Натискання кнопки "Наступний"
  await page.waitForSelector("button#nextPageLink");
  await page.click("button#nextPageLink");
}

async function vidguc(vaucher, id) {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 50,
      args: [
        "--disk-cache-dir=/dev/null", // Вимкнути використання кешу диска
        "--disable-application-cache", // Вимкнути кеш додатків
      ],
    }); //  slowMo: 20
    const page = await browser.newPage();

    // Відкриваємо сайт
    await page.goto("https://www.mctellus.com");

    //Якщо є модальне вікно "продовжити"
    await continueWindow(page);

    // Натискання на div з вибором мови
    await chooseLanguage(page);

    // Очікуємо завантаження нової сторінки
    await page.waitForNavigation();

    // Знаходимо поле для введення ваучера і вводимо значення
    await voucherEntry(vaucher, page);

    // Натискання на div з числом 5 в кожному блоці
    await chooseFive(page)
    // Очікуємо завантаження нової сторінки
    await page.waitForNavigation();

    // Натискання на div з числом 5 в кожному блоці (повторюємо декілька разів)
    try {
      for (let i = 0; i < 2; i++) {
        console.log(i);
        await page.waitForSelector("div.options.unused.noAnswer");
        await page.evaluate(() => {
          const blocks = document.querySelectorAll(
            "div.options.unused.noAnswer"
          );
          blocks.forEach((block) => {
            const divs = Array.from(
              block.querySelectorAll("div.ng-binding")
            ).filter((div) => div.innerText.trim() === "5");
            if (divs.length > 0) divs[0].click();
          });
        });
      }
    } catch (error) {
      console.error(error);
    }

    console.log("ne");

    await page.waitForSelector("#option_710763_324290");
    // Клікаємо на елемент
    await page.click("#option_710763_324290");
    // Натискання кнопки "Наступний"
    await page.waitForSelector("button#nextPageLink");
    await page.click("button#nextPageLink");

    //id="option_1081926_469747"
    await page.waitForSelector("#option_1081926_469747");
    await page.click("#option_1081926_469747");
    // Натискання кнопки "Наступний"
    await page.waitForSelector("button#nextPageLink");
    await page.click("button#nextPageLink");

    //option_710766_324292
    await page.waitForSelector("#option_710766_324292");
    await page.click("#option_710766_324292");
    // Натискання кнопки "Наступний"
    await page.waitForSelector("button#nextPageLink");
    await page.click("button#nextPageLink");

    await page.waitForSelector('div[ng-bind-html="choice.ordinal | unsafe"]');
    await page.evaluate(() => {
      const divs = document.querySelectorAll(
        'div[ng-bind-html="choice.ordinal | unsafe"]'
      );
      divs.forEach((div) => {
        if (div.innerText.trim() === "10") {
          div.click();
        }
      });
    });

    await page.waitForSelector("button#nextPageLink");
    await page.click("button#nextPageLink");

    //id="option_710773_324303"
    await page.waitForSelector("#option_710773_324303");
    await page.click("#option_710773_324303");
    // Натискання кнопки "Наступний"

    //option_710780_324304
    await page.waitForSelector("#option_710780_324304");
    await page.click("#option_710780_324304");
    // Натискання кнопки "Наступний"

    //option_710784_324305
    await page.waitForSelector("#option_710784_324305");
    await page.click("#option_710784_324305");
    // Натискання кнопки "Наступний"

    //id="option_710787_324307"
    await page.waitForSelector("#option_710787_324307");
    await page.click("#option_710787_324307");
    // Натискання кнопки "Наступний"
    await page.waitForSelector("button#nextPageLink");
    await page.click("button#nextPageLink");

    await page.waitForNavigation();
    // Натискання кнопки "Наступний"
    await page.waitForSelector("button#nextPageLink");
    await page.click("button#nextPageLink");

    await delay(3000);

    console.log(`Відгук ${vaucher} залишено`);
    
    // Закриваємо браузер
    await browser.close();
  } catch (e) {
    console.log(e);
    bot.sendMessage(id, "Щось пішло не так");
  }
}
