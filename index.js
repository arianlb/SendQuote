const express = require("express");
// const nodemailer = require("nodemailer");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/", (req, res) => {
  const name = req.body.name || "World";
  res.send(`Hello ${name}!`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
