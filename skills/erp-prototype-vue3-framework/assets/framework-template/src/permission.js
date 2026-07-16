import router, { resetRouter } from './router'
import store from './store'

const allowList = new Set(['login'])
const loginRoutePath = '/user/login'
const defaultRoutePath = '/dashboard'

router.beforeEach(async (to, from, next) => {
  const token = store.getters.token
  if (!token) {
    if (allowList.has(to.name)) {
      next()
    } else {
      next({ path: loginRoutePath, query: { redirect: to.fullPath } })
    }
    return
  }

  if (to.path === loginRoutePath) {
    next({ path: defaultRoutePath })
    return
  }

  // 已生成动态路由 → 放行
  if (store.getters.addRouters && store.getters.addRouters.length > 0) {
    next()
    return
  }

  try {
    await store.dispatch('GenerateRoutes')
    resetRouter()
    // Vue Router 4：把动态子路由挂到 name 为 'index' 的 BasicLayout 根之下
    store.getters.addRouters.forEach(route => router.addRoute('index', route))
    next({ ...to, replace: true })
  } catch (error) {
    console.error('动态路由生成失败：', error)
    next()
  }
})
