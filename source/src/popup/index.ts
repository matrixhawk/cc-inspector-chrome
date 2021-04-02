import Vue from "vue";
import App from "./index.vue";
import ElementUI from "element-ui";

Vue.config.productionTip = false;
Vue.use(ElementUI, {size: "mini"});
new Vue({
  render: (h) => h(App),
}).$mount("#app");
