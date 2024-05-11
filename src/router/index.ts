import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      redirect: '/heat',
      component: HomeView
    },
    {
      path: '/home',
      name: 'Home',
      component: HomeView
    },
    {
      path: '/heat',
      name: 'Heat',
      component: () => import('../views/heat.vue')
    },
    {
      path: '/grid',
      name: 'GridHeat',
      component: () => import('../views/GridHeat.vue')
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/HeatmapGLmap.vue')
    }
  ]
})

export default router
