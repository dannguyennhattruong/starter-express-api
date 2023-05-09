const express = require("express");

const app = express();
const RabbitMQService = require("./rabbitmq");
const chanels = {};

const PORT = 9999;
app.listen(PORT, () => {
  console.log(`Server is running...`);
});

app.get("/", (req, res) => {
  res.send(`Hello from my server 🚀`);
});

app.get("/list-channels", (req, res) => {
  res.send(Object.keys(chanels));
});

app.get("/createChanel/:queueName", async (req, res) => {
  let chanel = await RabbitMQService.connectRabbitMQ(req.params.queueName);
  chanels[`chanel_${req.params.queueName}`] = chanel;
  return res.send(`${req.params.queueName} created!`);
});

app.get("/:queueName/:msg", async (req, res) => {
  const keys = Object.keys(chanels);

  if (!keys?.includes(`chanel_${req.params.queueName}`)) {
    return res.send(`404 Not Found Chanel ${req.params.queueName}`);
  }
  let chanel = chanels[`chanel_${req.params.queueName}`];
  await chanel.sendToQueue(
    req.params.queueName,
    Buffer.from(JSON.stringify(req.params.msg))
  );
  return res.send("Sent!");
});

app.get(
  "/createTeleBot/:queueName/:bot_token/:chat_id/:uid/:sign/:heso/:timeout/:total",
  async (req, res) => {
    const keys = Object.keys(chanels);

    if (keys?.includes(`chanel_${req.params.queueName}`)) {
      return res.send(
        `${req.params.queueName} đã được sử dụng, xin chọn tên khác`
      );
    }
    chanels[`chanel_${req.params.queueName}`] = req.params.queueName;
    const handleMsg = require("./handleMsg");
    handleMsg.init(req.params);
    return res.send("Sent!");
  }
);

app.get("/stop-bot/:queueName", async (req, res) => {
  const handleMsg = require("./handleMsg");
  handleMsg.stopBot(req.params.queueName);
  return res.send("Sent!");
});

