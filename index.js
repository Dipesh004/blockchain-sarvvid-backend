const bodyParser = require("body-parser");
const express = require("express");
const request = require("request");
const Blockchain = require("./blockchain");
const cors = require("cors");
const sizeof = require("object-sizeof");

const app = express();
app.use(cors());
const blockchain = new Blockchain();

app.use(bodyParser.json());
app.get("/api/blocks", (req, res) => {
  res.json(blockchain.chain);
});

app.post("/api/mine", (req, res) => {
  const { data } = req.body;
  blockchain.addBlock({ data });
  res.redirect("/api/blocks");
});

app.post("/api/mine20000", (req, res) => {
  const { data } = req.body;
  const initialTimestamp = new Date().toLocaleString();
  let totalSize = 0;
  for (let i = 0; i < 20000; i++) {
    (data.name = `testname${i}`), (data.mobile = `testmobile${i}`);
    console.log("data", data);
    const sizeObj = sizeof(data);
    blockchain.addBlock({ data });
    totalSize += sizeObj;
    console.log("Total size", totalSize);
  }
  const finalTimeStamp = new Date().toLocaleString();
  console.log("initialTimestamp", initialTimestamp);
  console.log("finalTimeStamp", finalTimeStamp);
  res.redirect("/api/blocks");
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`listening to PORT:${PORT}`);
});
