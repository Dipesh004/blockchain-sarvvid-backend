const redis = require("redis");

const CHANNELS = {
  TEST: "TEST",
  BLOCKCHAIN1: "BLOCKCHAIN1",
  BLOCKCHAIN2: "BLOCKCHAIN2",
};
class PubSub {
  constructor({ blockchain1, blockchain2 }) {
    this.blockchain1 = blockchain1;
    this.blockchain2 = blockchain2;

    this.publisher = redis.createClient();
    this.subscriber = redis.createClient();

    this.subscriber.subscribe(CHANNELS.TEST);
    this.subscriber.subscribe(CHANNELS.BLOCKCHAIN1);
    this.subscriber.subscribe(CHANNELS.BLOCKCHAIN2);

    this.subscriber.on("message", (channel, message) =>
      this.handleMessage(channel, message)
    );
  }
  handleMessage(channel, message) {
    console.log(`Message recieved.Channel: ${channel} Message:${message}`);
    const parseMessage = JSON.parse(message);

    if (channel === CHANNELS.BLOCKCHAIN1) {
      this.blockchain1.replaceChain(parseMessage);
    } else if (channel === CHANNELS.BLOCKCHAIN2) {
      this.blockchain2.replaceChain(parseMessage);
    }
  }
  publish({ channel, message }) {
    this.publisher.publish(channel, message);
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN1,
      message: JSON.stringify(this.blockchain1.chain),
    });
    this.publish({
      channel: CHANNELS.BLOCKCHAIN2,
      message: JSON.stringify(this.blockchain2.chain),
    });
  }
}

// const checkPubSub = new PubSub();
// setTimeout(
//   () => checkPubSub.publisher.publish(CHANNELS.TEST, "Hellloooo"),
//   1000
// );
module.exports = PubSub;
