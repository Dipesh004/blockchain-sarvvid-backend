const bodyParser = require("body-parser");
const express = require("express");
const request = require("request");
const cors = require("cors");
const sizeof = require("object-sizeof");

const Blockchain = require("./blockchain");
const PubSub = require("./publishsubscribe");

const app = express();
app.use(cors());

const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });

const DEFAULT_PORT = 4000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;
setTimeout(() => pubsub.broadcastChain(), 1000);

app.use(bodyParser.json());
app.get("/api/blocks", (req, res) => {
  res.json(blockchain.chain);
});

app.post("/api/mine", (req, res) => {
  const { data } = req.body;

  blockchain.addBlock({ data });
  pubsub.broadcastChain();
  res.redirect("/api/blocks");
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
    blockchain.addBlock({ data });
    // totalSize += sizeObj;
    // console.log("Total size", totalSize);
  }
  const finalTimeStamp = new Date().toLocaleString();
  console.log("initialTimestamp", initialTimestamp);
  console.log("finalTimeStamp", finalTimeStamp);
  res.redirect("/api/blocks");
});

const synChains = () => {
  request(
    { url: `${ROOT_NODE_ADDRESS}/api/blocks` },
    (error, reposnse, body) => {
      if (!error && reposnse.statusCode === 200) {
        const rootChain = JSON.parse(body);
        console.log("Replace chain on sync with", rootChain);
        blockchain.replaceChain(rootChain);
      }
    }
  );
};

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === "true") {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}
const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
  console.log(`listening to PORT:${PORT}`);
  synChains();
});
