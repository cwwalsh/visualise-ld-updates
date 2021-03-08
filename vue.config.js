const configureServer = require("./src/server/configure");

module.exports = {
  devServer: {
    before: configureServer
  },

  transpileDependencies: ["vuetify"]
};
