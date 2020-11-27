import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import LoadData from "../views/LoadData.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "",
    component: () => import("@/layouts/main/Main.vue"),
    children: [
      {
        path: "/",
        name: "Home",
        component: Home
      },
      {
        path: "/load",
        name: "Cargar información",
        component: LoadData
      }
    ]
  },
  {
    path: "",
    component: () => import("@/layouts/full-page/FullPage.vue"),
    children: [
      {
        path: "login",
        name: "Login",
        component: Login
      }
    ]
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
