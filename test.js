const axios = require("axios");
const FormData = require("form-data");
let heso = 5;
let currentBalance = 0;
let currentOTP = 0;
let betAmount = 0;
let interval = 0;
let flag = true;
function generateOTP() {
  // Declare a digits variable
  // which stores all digits
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 5; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  console.log(`OTP : ${OTP}`);
  currentOTP = OTP;
  return OTP[OTP.length - 1];
}

const predict = () => {
  const random = Number(generateOTP());
  // // console.log(random);
  if (random > 4) {
    return "big";
  }
  return "small";
};

const getBalance = async () => {
  try {
    var formData = new FormData();
    formData.append("uid", 1005280);
    formData.append(
      "sign",
      "42BBBB760E868AFACF71C158B55438B8529C196E23BAA768CF0A4AB5A16BB812"
    );
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
  } catch (error) {
    return await getBalance();
  }
};

let issuenumberEntry = 20230521130539;
const main = async (issueNum, num) => {
  const iss = await getGameIssuse();
  console.log(` Phiên ${iss} ===========X============`);
  try {
    var formData = new FormData();
    formData.append("uid", 1005280);
    formData.append(
      "sign",
      "42BBBB760E868AFACF71C158B55438B8529C196E23BAA768CF0A4AB5A16BB812"
    );
    formData.append("amount", `1000`);
    formData.append("betcount", `${heso}`);
    formData.append("gametype", "2");
    formData.append("selecttype", num || "small");
    formData.append("issuenumber", iss);
    formData.append("language", "vi");
    formData.append("typeid", 13);
    console.log(` Số tiền đặt cược là ${1000 * heso} `);
    betAmount = 1000 * heso;

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
      `${Date.now()} - Typeid ${1} - ${issueNum} - Đăt số ${num || "small"}`
    );
    console.log(
      `=====================================================================`
    );
  } catch (error) {
    console.log(error);
  }
};

const start = () => {
  getBalance().then((r) => {
    currentBalance = r;
    let list = [];
    interval = setInterval(() => {
      issuenumberEntry = issuenumberEntry + 1;
      console.log(issuenumberEntry.toString().slice());
      console.log("go - " + issuenumberEntry);
      getBalance().then((b) => {
        console.log(
          `CurrentBalance : ${currentBalance} ~ ${Number(
            currentBalance / 23500
          ).toFixed(2)}$`
        );
        console.log(`BalanceAfter : ${b} ~ ${Number(b / 23500).toFixed(2)}$`);
        let txt = "win";
        if (b < currentBalance) {
          txt = "lose";
          heso *= 2;
        } else {
          heso = 5;
        }
        sendMsg(`💎 92Lot`).then((_) => {
          sendMsg(`🍀 Vốn : ${convertUsdtoVND(1000000)}`).then((__) => {
            sendMsg(
              `🔥 Số dư hiện tại  ${convertUsdtoVND(currentBalance)}`
            ).then((___) => {
              sendMsg(
                `🚀 Biến động : ${
                  currentBalance > 1000000 ? "+" : "-"
                } ${Number(
                  (Math.abs(1000000 - currentBalance) / 1000000) * 100
                ).toFixed(2)} %`
              ).then((____) => {
                sendMsg(`<==============================>`);
              });
            });
          });
        });

        if (b) {
          currentBalance = b;

          if (currentBalance >= 1500000) {
            process.exit(1);
          }
          // sendToTelegram2(currentBalance, issuenumberEntry, txt);
          const OTP = predict();
          main(issuenumberEntry, OTP);
        }
      });
    }, 1000 * 60);
  });
};

const sendMsg = async (msg) => {
  var token = "5684927288:AAHqkWbD7dCxG6ChFZYC4p8ZP8AL5no_H9M";
  var chat_id = -861626613;
  var url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=${msg}`; //&parse_mode=html

  try {
    const res = await axios.get(url);
  } catch (e) {}
};

const convertUsdtoVND = (number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    number
  );

function generateRandom(min = 0, max = 9) {
  // find diff
  let difference = max - min;

  // generate random number
  let rand = Math.random();

  // multiply with difference
  rand = Math.floor(rand * difference);

  // add with min value
  rand = rand + min;

  return rand;
}

const get3Num = () => {
  let d = [];
  const n1 = generateRandom();
  d.push(n1);

  let getOtherNum = () => {
    var r = generateRandom();
    if (d.includes(r)) {
      return getOtherNum();
    }
    return r;
  };
  const n2 = getOtherNum();
  d.push(n2);

  const n3 = getOtherNum();
  d.push(n3);
  console.log(d);
  return d.map((m) => `${m}`);
};

const sendToTelegram = async (balance, phien, OTP) => {
  var message = ` <h1>Phiên : </h1>${phien} <br>
                    Số dư hiện tại ${balance} <br>
                    Chọn : ${OTP} <br>
                    Đã cược : ${betAmount} <br>
    `;

  var token = "5684927288:AAHqkWbD7dCxG6ChFZYC4p8ZP8AL5no_H9M";
  var chat_id = -1001886912905;
  var url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=${message}&parse_mode=html`; //&parse_mode=html

  const res = await axios.get(url);
};

const sendToTelegram2 = async (balance, phien, txt) => {
  var message = `
                    🍀 Vốn : 500.000  \n

                    🔥 Số dư hiện tại ${balance} \n

                    🚀 Biến động : ${balance > 500000 ? "+" : "-"} ${Number(
    (Math.abs(500000 - balance) / 500000) * 100
  ).toFixed(2)} %

    `;

  var token = "5684927288:AAHqkWbD7dCxG6ChFZYC4p8ZP8AL5no_H9M";
  var chat_id = -861626613;
  var url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=${message}`; //&parse_mode=html

  try {
    const res = await axios.get(url);
  } catch (e) {}
  // if (balance >= 500000 + 100000) {
  //   process.exit(0);
  // }

  // if (balance < 450000) {
  //   process.exit(0);
  // }
};

const setupTelebotCommand = async () => {
  const { Telegraf } = require("telegraf");
  const exec = require("child_process").exec;

  const bot = new Telegraf("5684927288:AAHqkWbD7dCxG6ChFZYC4p8ZP8AL5no_H9M");
  bot.hears("hi", (ctx) => ctx.reply("Hey there"));
  bot.command("stop", (ctx) => {
    clearInterval(interval);
    console.log("Bạn đã dừng lệnh. Số tiền hiện tại là : " + currentBalance);
    ctx.reply("Bạn đã dừng lệnh. Số tiền hiện tại là : " + currentBalance);
    const msg = "Bạn đã dừng lệnh. Số tiền hiện tại là : " + currentBalance;
    var token = "5684927288:AAHqkWbD7dCxG6ChFZYC4p8ZP8AL5no_H9M";
    var chat_id = -861626613;
    var url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=${msg}`; //&parse_mode=html

    axios.get(url).then((r) => {
      process.exit(0);
    });
  });

  bot.command("start", (ctx) => {
    start();
  });
  bot.launch();
};

setupTelebotCommand();

const getGameIssuse = async () => {
  try {
    const formData = new FormData();
    formData.append("language", "vi");
    formData.append("typeid", "13");
    const gameIssuse = await axios.post(
      `https://92lotteryapi.com/api/webapi/GetTRXGameIssue`,
      formData
    );

    console.log(gameIssuse);

    return gameIssuse.data?.data?.IssueNumber;
  } catch (error) {
    return await getGameIssuse();
  }
};

//khanh
//https://cerise-tadpole-tutu.cyclic.app/createTeleBot/test/5684927288:AAHqkWbD7dCxG6ChFZYC4p8ZP8AL5no_H9M/-861626613/1005280/42BBBB760E868AFACF71C158B55438B8529C196E23BAA768CF0A4AB5A16BB812/3/120

//Minh
//https://cerise-tadpole-tutu.cyclic.app/createTeleBot/test2/6173439504:AAGO2UC3DI_wxvt6CGDJqV_pIEqiFLdGpOs/-1001886912905/638248/21EE754BC66501934222C68FE0105806C3E71E04403B19DAB37E015C28BC2CD9/3/120
