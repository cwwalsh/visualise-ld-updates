import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import axios from "axios";

Vue.config.productionTip = false;

Vue.use({
  install(Vue) {
    Vue.prototype.$api = axios.create({
      baseURL: "http://localhost:8080/api/"
    });
  }
});

new Vue({
  vuetify,
  render: h => h(App)
}).$mount("#app");
