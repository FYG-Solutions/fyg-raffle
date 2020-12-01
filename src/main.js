import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import VueFeather from "vue-feather";
import { firestorePlugin } from "vuefire";
import "@/scss/main.scss";
import "tailwindcss/tailwind.css";
import VueSweetalert2 from "vue-sweetalert2";

// Firebase
Vue.use(firestorePlugin);

// Feather
Vue.use(VueFeather);

// sweetalert2
Vue.use(VueSweetalert2);

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
