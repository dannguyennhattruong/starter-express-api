const axios = require("axios");
const FormData = require("form-data");
const GameObject = {};
let start = 0;

const setKeyValueToGameObject = (queueName, key, value) => {
  GameObject[`${queueName}`][`${key}`] = value;
};

const getValueByKey = (queueName, key) => {
  return GameObject[`${queueName}`][`${key}`];
};

const init = async (input) => {
  console.log(input);

  GameObject[`${input?.queueName}`] = {};
  setKeyValueToGameObject(input.queueName, "currentBalance", 0);
  setKeyValueToGameObject(input.queueName, "interval", 0);
  setKeyValueToGameObject(input.queueName, "start", 1);
  setKeyValueToGameObject(input.queueName, "queueName", input.queueName);
  setKeyValueToGameObject(input.queueName, "task", {});

  setKeyValueToGameObject(input.queueName, "total", Number(input?.total) || 0);

  if (input?.heso) {
    setKeyValueToGameObject(input.queueName, "heso", input?.heso);
    setKeyValueToGameObject(input.queueName, "hesoMacDinh", input?.heso);
  }
  if (input?.chat_id) {
    setKeyValueToGameObject(input.queueName, "chat_id", input?.chat_id);
  }
  if (input?.bot_token) {
    setKeyValueToGameObject(input.queueName, "bot_token", input?.bot_token);
  }
  if (input?.timeout) {
    setKeyValueToGameObject(input.queueName, "timeout", input?.timeout);
  }
  if (input?.uid) {
    setKeyValueToGameObject(input.queueName, "uid", input?.uid);
  }
  if (input?.sign) {
    setKeyValueToGameObject(input.queueName, "sign", input?.sign);
  }
  issuenumberEntry = await getGameIssuse(input);

  setKeyValueToGameObject(
    input.queueName,
    "currentIssuseNumber",
    issuenumberEntry
  );
  await sendToTelegram({
    bot_token: input?.bot_token,
    chat_id: input?.chat_id,
    message: `Xin chào ${input?.queueName}. Bot của bạn đã thiết lập thành công`,
  });

  console.log(`We have some queues : ${Object.keys(GameObject).join(`, `)}`);

  await runCommand(GameObject[`${input.queueName}`]);
  await setupTelebotCommand(GameObject[`${input.queueName}`]);
  console.log(GameObject[`${input.queueName}`]);
};

const stopBot = async (queueName) => {
  GameObject[`${input?.queueName}`].task.stop();
  GameObject[`${input?.queueName}`].task.isTop = true;
  await sendToTelegram({
    bot_token: GameObject[`${queueName}`]?.bot_token,
    chat_id: GameObject[`${queueName}`]?.chat_id,
    message: `Bạn đã tắt bot :D`,
  });
};

module.exports = {
  init,
  stopBot,
};

function generateOTP() {
  // Declare a digits variable
  // which stores all digits
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 5; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  console.log(`OTP : ${OTP}`);
  return OTP.at(-1);
}

const predict = () => {
  const random = Number(generateOTP());
  // // console.log(random);
  if (random > 4) {
    return "big";
  }
  return "small";
};

const getBalance = async (input) => {
  console.log(`Balance`, input);
  var formData = new FormData();
  formData.append("uid", input?.uid);
  formData.append("sign", input?.sign);
  formData.append("language", "vi");
  const result = await axios.post(
    `https://92lotteryapi.com/api/webapi/GetWinsUserAmount`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  console.log(
    "Số tiền hiện tại : " +
      result.data?.data?.Amount +
      " " +
      `~ ${Number(result.data?.data?.Amount / 23500).toFixed(2)}$`
  );
  return result.data?.data?.Amount;
};

const main = async (input) => {
  try {
    var formData = new FormData();
    formData.append("uid", input?.uid);
    formData.append("sign", input?.sign);
    formData.append("amount", `1000`);
    formData.append("betcount", `${input?.heso}`);
    formData.append("gametype", "2");
    formData.append("selecttype", input?.OTP);
    formData.append("issuenumber", input?.currentIssuseNumber);
    formData.append("language", "vi");
    formData.append("typeid", 13);
    console.log(` Số tiền đặt cược là ${1000 * input?.heso} `);

    const result = await axios.post(
      "https://92lotteryapi.com/api/webapi/GameTRXBetting",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log(result.data?.msg);

    console.log(
      `${Date.now()} - Typeid ${1} - ${input?.currentIssuseNumber} - Đăt số ${
        input?.OTP || "small"
      }`
    );
    console.log(
      `=====================================================================`
    );
  } catch (error) {
    console.log(error);
  }
};

const setCronJob = (callback, count) => {
  console.log(`set cron with ${count}min`);
  const cron = require("node-cron");
  const task = cron.schedule(`*/${count} * * * *`, () => {
    if (!GameObject[`${input?.queueName}`].task.isTop) {
      callback();
    }
  });
  return task;
};

const runCommand = async (input) => {
  let task;
  let match_count = 1;
  let flag = true;
  getBalance(input).then((r) => {
    setKeyValueToGameObject(input?.queueName, "currentBalance", r);
    GameObject[`${input?.queueName}`].interval = () => {
      console.log(`${input?.uid} - phiên ${match_count}`);
      console.log(`QueueName : ${input?.queueName}`);
      getGameIssuse(input).then((i) => {
        console.log("go - " + i);
        getBalance(input).then((b) => {
          console.log(
            `CurrentBalance : ${
              GameObject[`${input?.queueName}`].currentBalance
            } ~ ${Number(
              GameObject[`${input?.queueName}`].currentBalance / 23500
            ).toFixed(2)}$`
          );
          console.log(`BalanceAfter : ${b} ~ ${Number(b / 23500).toFixed(2)}$`);
          let txt = "win";
          if (b < GameObject[`${input?.queueName}`].currentBalance) {
            txt = "lose";
            GameObject[`${input?.queueName}`].heso *= 2;
          } else {
            GameObject[`${input?.queueName}`].heso =
              GameObject[`${input?.queueName}`].hesoMacDinh;
          }
          GameObject[`${input?.queueName}`].currentBalance = b;
          sendToTelegram2(GameObject[`${input?.queueName}`]);
          const OTP = predict();

          main({ ...input, OTP }).then((_) => {
            match_count++;
          });
        });
      });
    };

    task = setCronJob(GameObject[`${input?.queueName}`].interval, 2);
    GameObject[`${input?.queueName}`].task = task;
  });
};

const sendToTelegram = async (input) => {
  var token = input?.bot_token;
  var url = `https://api.telegram.org/bot${input?.bot_token}/sendMessage?chat_id=${input?.chat_id}&text=${input?.message}`; //&parse_mode=html

  const res = await axios.get(url);
};

const sendToTelegram2 = async (input) => {
  var message = `
                  🍀 Vốn : ${input?.total} ========== \n

                  🔥 Số dư hiện tại ${input?.currentBalance} ========== \n

                  🚀 Biến động : ${
                    input?.currentBalance > input?.total ? "+" : "-"
                  } ${Number(
    (Math.abs(input?.total - input?.currentBalance) / input?.total) * 100
  ).toFixed(2)} %

  `;

  var token = input?.bot_token;
  var url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${input?.chat_id}&text=${message}`; //&parse_mode=html

  const res = await axios.get(url);
};
const setupTelebotCommand = async (input) => {
  const { Telegraf } = require("telegraf");

  const bot = new Telegraf(input?.bot_token);
  bot.hears("hi", (ctx) => ctx.reply("Hey there"));
  bot.command("stop", (ctx) => {
    start = 0;
    clearInterval(GameObject[`${input?.queueName}`].interval);
    ctx.reply(
      "Bạn đã dừng lệnh. Số tiền hiện tại là : " + input?.currentBalance
    );
    const msg =
      "Bạn đã dừng lệnh. Số tiền hiện tại là : " + input?.currentBalance;
    var token = input?.BotToken;
    var url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${input?.chat_id}&text=${msg}`; //&parse_mode=html

    axios.get(url).then((r) => {});
  });

  bot.command("start", (ctx) => {
    if (start !== 0) {
      ctx.reply(`Mày start rồi mà th khứa này 🙂 `);
    } else {
      start = 1;
      GameObject[`${input?.queueName}`].task.stop();
      runCommand().then((_) => {
        ctx.reply(`Okay, Bạn đã start bot`);
      });
    }
  });
  bot.launch();
};

const getGameIssuse = async (input) => {
  try {
    const formData = new FormData();
    formData.append("language", "vi");
    formData.append("typeid", "13");
    const gameIssuse = await axios.post(
      `https://92lotteryapi.com/api/webapi/GetTRXGameIssue`,
      formData
    );

    console.log(gameIssuse);
    setKeyValueToGameObject(
      input.queueName,
      "currentIssuseNumber",
      gameIssuse.data?.data?.IssueNumber
    );
    return gameIssuse.data?.data?.IssueNumber;
  } catch (error) {
    return await getGameIssuse(input);
  }
};
