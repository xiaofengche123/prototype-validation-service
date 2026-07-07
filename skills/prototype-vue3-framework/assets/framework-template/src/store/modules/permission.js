// 动态路由：由 backend 适配层取菜单（读 mock/data/menu.js），构建并挂载到 BasicLayout(name='index') 下。
import { constantRouterMap } from '@/config/router.config'
import backend from '@/api/backend'

export default {
  state: {
    routers: constantRouterMap,
    addRouters: []
  },
  mutations: {
    // childRoutes：要挂到 'index' 根下的分组/叶子路由（permission.js 用 router.addRoute('index', ...)）
    SET_ROUTERS: (state, childRoutes) => {
      state.addRouters = childRoutes
      // 供左侧菜单渲染：把动态子路由包进一个 '/' 根，拼到基础路由之后。
      // SideMenu/Dashboard 读 routers，遇到 path==='/' 且有 children 就展开其 children。
      const menuRoot = { path: '/', meta: { title: '主页' }, children: childRoutes }
      state.routers = constantRouterMap.concat([menuRoot])
    }
  },
  actions: {
    async GenerateRoutes({ commit }) {
      const { childRoutes } = await backend.getMenuAndButtons()

      // 与基础路由的 name 去重，避免重复挂载
      const routeNames = new Set()
      constantRouterMap.forEach(route => {
        if (route.name) routeNames.add(route.name)
        ;(route.children || []).forEach(child => { if (child.name) routeNames.add(child.name) })
      })

      const finalChildren = []
      ;(childRoutes || []).forEach(item => {
        if (item.name && routeNames.has(item.name)) return
        finalChildren.push(item)
        if (item.name) routeNames.add(item.name)
      })

      commit('SET_ROUTERS', finalChildren)
    }
  }
}
