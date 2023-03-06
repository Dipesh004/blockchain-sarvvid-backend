const bodyParser = require("body-parser");
const express = require("express");
const request = require("request");
const cors = require("cors");
const sizeof = require("object-sizeof");
const httpProxy = require("http-proxy");

const Blockchain = require("./blockchain/blockchain");
const PubSub = require("./publishsubscribe");

const app = express();
app.use(cors());

const blockchain1 = new Blockchain();
const blockchain2 = new Blockchain();
const pubsub = new PubSub({ blockchain1, blockchain2 });

const DEFAULT_PORT = 5000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;
setTimeout(() => pubsub.broadcastChain(), 1000);

app.use(bodyParser.json());
app.get("/api/blockchain1", (req, res) => {
  res.json(blockchain1.chain);
});
app.get("/api/blockchain2", (req, res) => {
  res.json(blockchain2.chain);
});

app.post("/api/mine1", (req, res) => {
  const { data } = req.body;

  blockchain1.addBlock({ data });
  pubsub.broadcastChain();
  res.redirect("/api/blockchain1");
});
app.post("/api/mine2", (req, res) => {
  const { data } = req.body;

  blockchain2.addBlock({ data });
  pubsub.broadcastChain();
  res.redirect("/api/blockchain2");
});

app.post("/api/mine20000", (req, res) => {
  const { data } = req.body;
  const initialTimestamp = new Date().toLocaleString();
  let totalSize = 0;
  for (let i = 0; i < 200; i++) {
    (data.name = `testname${i}`), (data.mobile = `testmobile${i}`);
    console.log("data", data);
    console.log("data", data.difficulty);
    // const sizeObj = sizeof(data);
    blockchain1.addBlock({ data });
    pubsub.broadcastChain();
    // totalSize += sizeObj;
    // console.log("Total size", totalSize);
  }
  const finalTimeStamp = new Date().toLocaleString();
  console.log("initialTimestamp", initialTimestamp);
  console.log("finalTimeStamp", finalTimeStamp);
  res.redirect("/api/blocks");
});

const synChains1 = () => {
  request(
    { url: `${ROOT_NODE_ADDRESS}/api/blockchain1` },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const rootChain = JSON.parse(body);
        console.log("Replace chain on sync with", rootChain);
        blockchain1.replaceChain(rootChain);
      }
    }
  );
};

const synChains2 = () => {
  request(
    { url: `${ROOT_NODE_ADDRESS}/api/blockchain2` },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const rootChain = JSON.parse(body);
        console.log("Replace chain on sync with", rootChain);
        blockchain2.replaceChain(rootChain);
      }
    }
  );
};

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === "true") {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}
const PORT = PEER_PORT || DEFAULT_PORT;
httpProxy
  .createProxyServer({ target: `http://localhost:${PORT}` })
  .listen(80, () => {
    console.log("connected to Server...");
  });

app.listen(PORT, () => {
  console.log(`listening to PORT:${PORT}`);
  synChains1();
  synChains2();
});
