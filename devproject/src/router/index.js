import { createRouter, createWebHashHistory } from 'vue-router'
import { constantRouterMap } from '@/config/router.config'

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRouterMap
})

router.onError(error => {
  if (error.name === 'ChunkLoadError') location.reload()
})

// 收集基础路由里保留的 name（这些不可被动态重置清除）
function constantRouteNames() {
  const names = new Set()
  constantRouterMap.forEach(route => {
    if (route.name) names.add(route.name)
    ;(route.children || []).forEach(child => {
      if (child.name) names.add(child.name)
    })
  })
  return names
}

// 退出登录 / 重新生成路由时调用：移除所有动态挂载的路由（Vue Router 4 无 matcher，按 name 逐个 removeRoute）
export function resetRouter() {
  const reserved = constantRouteNames()
  router.getRoutes().forEach(route => {
    if (route.name && !reserved.has(route.name)) {
      router.removeRoute(route.name)
    }
  })
}

export default router
