// index.js
const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const FormData = require("form-data");
const cors = require("cors");

const app = express();
const PORT = 4000;

var allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://client.opofinance.com",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);
app.listen(PORT, () => {
  console.log(`API listening on PORT ${PORT} `);
});

app.get("/", (req, res) => {
  res.send("Hey this is my API running 🥳");
});

app.get("/hello", (req, res) => {
  res.send("Hello OPOFINANCE!");
});

app.get("/about", (req, res) => {
  res.send("This is my about route..... ");
});

app.get("/create/:id", (req, res) => {
  const SUMSUB_APP_TOKEN =
    "prd:Pn7tJ8ctgeUHvgQDfZJSkeH7.NwT3NARGu31LMG8wcRUGhhtEGKwX9ESq";
  const SUMSUB_SECRET_KEY = "EtCuQTXlL3IboXvdzljm0LsQWS3c9d8K";
  const SUMSUB_BASE_URL = "https://api.sumsub.com";

  var config = {};
  config.baseURL = SUMSUB_BASE_URL;

  axios.interceptors.request.use(createSignature, function (error) {
    return Promise.reject(error);
  });

  function createSignature(config) {
    var ts = Math.floor(Date.now() / 1000);
    const signature = crypto.createHmac("sha256", SUMSUB_SECRET_KEY);
    signature.update(ts + config.method.toUpperCase() + config.url);

    if (config.data instanceof FormData) {
      signature.update(config.data.getBuffer());
    } else if (config.data) {
      signature.update(config.data);
    }

    config.headers["X-App-Access-Ts"] = ts;
    config.headers["X-App-Access-Sig"] = signature.digest("hex");

    return config;
  }

  function createAccessToken(
    externalUserId,
    levelName = "level1",
    ttlInSecs = 600
  ) {
    var method = "post";
    var url = `/resources/accessTokens?userId=${externalUserId}&ttlInSecs=${ttlInSecs}&levelName=${levelName}`;

    var headers = {
      Accept: "application/json",
      "X-App-Token": SUMSUB_APP_TOKEN,
    };

    config.method = method;
    config.url = url;
    config.headers = headers;
    config.data = null;

    return config;
  }

  async function main() {
    console.log("hello main");
    externalUserId = req.params.id;
    levelName = "level1";
    response = await axios(createAccessToken(externalUserId, levelName, 1200))
      .then(function (response) {
        return res.json(response.data);
      })
      .catch(function (error) {
        console.log("errir", error);
        console.log("Error:\n", error.response.data);
      });
  }

  main();
});

// Export the Express API
module.exports = app;
