import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import VueFeather from "vue-feather";
import "@/scss/main.scss";
import "tailwindcss/tailwind.css";
import VueSweetalert2 from "vue-sweetalert2";
import "firebase/firestore";
import firebase from "firebase/app";

Vue.config.productionTip = false;

// Feather
Vue.use(VueFeather);

// sweetalert2
Vue.use(VueSweetalert2);

// Get a Firestore instance

// Initialize Firebase
var config = {
  apiKey: "AIzaSyDBEyB19plQMrvYb-Ao0on3-fRYJv-KT7E",
  authDomain: "fyg-raffle.firebaseapp.com",
  databaseURL: "https://fyg-raffle.firebaseio.com",
  projectId: "fyg-raffle",
  storageBucket: "fyg-raffle.appspot.com",
  messagingSenderId: "1092871946943",
  appId: "1:1092871946943:web:2b80182574b7cc4f29bc0a"
};

firebase.initializeApp(config);

firebase.auth().onAuthStateChanged(() => {
  new Vue({
    router,
    render: h => h(App)
  }).$mount("#app");
});
