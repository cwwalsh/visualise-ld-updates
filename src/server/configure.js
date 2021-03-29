const api = require("./api");
const cors = require("cors");

module.exports = app => {
  app.use(cors());
  app.use("/api", api);
};
