const bodyParser = require("body-parser");
const express = require("express");
const request = require("request");
const Blockchain = require("./blockchain");
const cors = require("cors");

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

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`listening to PORT:${PORT}`);
});
