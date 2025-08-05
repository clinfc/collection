import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [],
})

const modules = import.meta.glob('../views/**/routes.ts', { eager: true, import: 'default' })

;(Object.values(modules) as RouteRecordRaw[][]).forEach((routes) => {
  routes.forEach((route) => {
    router.addRoute(route)
  })
})

export default router
