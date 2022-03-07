const express = require("express");
const app = express();
fetch = require("node-fetch");
app.get("/searchtext/:searchtext", async (req, res) => {
  console.log(req);
  await fetch(
    "https://serpapi.com/search.json?q=" +
      req.params.searchtext +
      "&tbm=shop&location=canada&hl=en&gl=us&api_key=ee76ddd85e21147739fb43b9b38bd19957de81277e8a9495dfd2b002dc7f6ae6",
    {
      method: "GET",
    }
  ).then((response) => {
    response.json().then((response1) => {
      res.status(200).json({
        message: response1,
      });
    });
  });
});
module.exports = app;
