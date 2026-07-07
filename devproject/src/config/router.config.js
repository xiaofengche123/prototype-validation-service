import { markRaw, defineAsyncComponent } from 'vue'

// 🔴 markRaw：路由记录会被存进 Vuex(响应式) state（permission.js 的 routers/addRouters），
// 组件若被 reactive() 包成 Proxy，RouterView/keep-alive 用「组件类型」做身份比较会错位，
// 触发「Vue received a Component that was made a reactive object」并导致切页后页面不渲染。
const lazy = loader => markRaw(defineAsyncComponent(loader))

const BasicLayout = lazy(() => import(/* webpackChunkName: "layout" */ '@/layouts/BasicLayout.vue'))
const UserLayout = lazy(() => import(/* webpackChunkName: "layout" */ '@/layouts/UserLayout.vue'))

/**
 * 动态路由根（BasicLayout）：登录后由 store/modules/permission.js 的 GenerateRoutes
 * 生成菜单(menu.js)对应的页面路由，permission.js 用 router.addRoute('index', ...) 把它们
 * 挂到下面 constantRouterMap 里 name 为 'index' 的 BasicLayout 根之下。
 */
export const asyncRouterMap = [
  {
    path: '/',
    component: BasicLayout,
    meta: { title: '主页' },
    redirect: '/dashboard',
    children: []
  }
]

/**
 * 基础路由（无需登录态即可命中）
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: lazy(() => import(/* webpackChunkName: "user" */ '@/views/user/Login.vue'))
      }
    ]
  },
  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: '主页' },
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'dashboard',
        component: lazy(() => import('@/views/dashboard/Dashboard.vue')),
        meta: { title: '工作台', keepAlive: true, icon: 'home' }
      }
    ]
  },
  { path: '/403', name: 'exception-403', component: lazy(() => import('@/views/exception/403.vue')) },
  { path: '/404', name: 'exception-404', component: lazy(() => import('@/views/exception/404.vue')) },
  { path: '/:pathMatch(.*)*', name: 'not-found', redirect: '/404', hidden: true }
]
