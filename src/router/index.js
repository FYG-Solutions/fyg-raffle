import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import LoadData from "../views/LoadData.vue";
import firebase from "firebase";

Vue.use(VueRouter);

const routes = [
  { path: "*", redirect: "/login" },
  { path: "/", redirect: "/login" },
  {
    path: "",
    component: () => import("@/layouts/main/Main.vue"),
    children: [
      {
        path: "/home",
        name: "Home",
        component: Home,
        meta: { requiresAuth: true }
      },
      {
        path: "/load",
        name: "LoadData",
        component: LoadData,
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: "",
    component: () => import("@/layouts/full-page/FullPage.vue"),
    children: [
      {
        path: "/login",
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

router.beforeEach((to, from, next) => {
  const currentUser = firebase.auth().currentUser;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !currentUser) {
    next("login");
  } else if (!requiresAuth && currentUser) {
    next("home");
  } else {
    next();
  }
});

export default router;
