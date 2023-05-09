const amqp = require("amqplib");

var connection;

//  Connect RabbitMQ
async function connectRabbitMQ(queue) {
  try {
    connection = await amqp.connect(
      "amqps://tdajepzq:qYgyMSp-mgDigeIztw9mSZ3Ayoe5zetW@gerbil.rmq.cloudamqp.com/tdajepzq"
    );
    console.info("connect to RabbitMQ success");

    const channel = await connection.createChannel();
    await channel.assertQueue(queue);

    await channel.consume(queue, async function (message) {
      handleMsg(message);
      channel.ack(message);
    });

    connection.on("error", function (err) {
      console.log(err);
      setTimeout(connectRabbitMQ, 10000);
    });

    connection.on("close", function () {
      console.error("connection to RabbitQM closed!");
      setTimeout(connectRabbitMQ, 10000);
    });
    return channel;
  } catch (err) {
    console.error(err);
    setTimeout(connectRabbitMQ, 10000);
  }
}

const handleMsg = async (msg) => {
  console.log(msg.content.toString());
};

module.exports = {
  connectRabbitMQ,
};
