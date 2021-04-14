const { resolve } = require("path");
const express = require("express");
const APIConfig = require("./configure");
const app = express();
const history = require("connect-history-api-fallback");

require("dotenv").config();
const PORT = process.env.UE_APP_APPLICATION_PORT || 8080;

APIConfig(app);

const publicPath = resolve(__dirname, "../../dist");
const staticConf = { maxAge: "1y", etag: false };

app.use(express.static(publicPath, staticConf));
app.use("/", history());

app.listen(PORT, () => console.log(`App running on port ${PORT}.`));
