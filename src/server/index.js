const { resolve } = require("path");
const express = require("express");
const APIConfig = require("./configure");
const app = express();
const history = require('connect-history-api-fallback')

const { PORT = 8080 } = process.env;

APIConfig(app);

const publicPath = resolve(__dirname, "../../dist");
const staticConf = { maxAge: "1y", etag: false };

app.use(express.static(publicPath, staticConf));
app.use("/", history());

app.listen(PORT, () => console.log(`App running on port ${PORT}.`));
