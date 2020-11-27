import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import VueFeather from "vue-feather";
import { firestorePlugin } from "vuefire";

import "tailwindcss/tailwind.css";

// Firebase
Vue.use(firestorePlugin);

// Feather
Vue.use(VueFeather);

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
