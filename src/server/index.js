const { resolve } = require("path");
const express = require("express");
const APIConfig = require("./configure");
const app = express();
const history = require("connect-history-api-fallback");

require("dotenv").config();

APIConfig(app);

const publicPath = resolve(__dirname, "../../dist");
const staticConf = { maxAge: "1y", etag: false };

app.use(express.static(publicPath, staticConf));
app.use("/", history());

app.listen(process.env.VUE_APP_APPLICATION_PORT, () =>
  console.log(`App running on port ${process.env.VUE_APP_APPLICATION_PORT}.`)
);
