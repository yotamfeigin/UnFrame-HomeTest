import { createRouter, createWebHistory } from "vue-router";
import LandingView from "../views/LandingView.vue";
import DashboardView from "../views/DashboardView.vue";

const routes = [
  { path: "/", component: LandingView }, // ✅ Default to landing page
  { path: "/dashboard", component: DashboardView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
