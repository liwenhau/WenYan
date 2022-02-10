import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/home/Home.vue'),
  },
  { path: '/', redirect: { name: 'Home' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router