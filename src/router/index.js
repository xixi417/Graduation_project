import { createRouter, createWebHistory } from 'vue-router'
// 导入自动生成的路由（由 vite-plugin-pages 生成）
import routes from '~pages'

// 集成布局（如不需要布局，直接用 routes 即可）
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

export default router