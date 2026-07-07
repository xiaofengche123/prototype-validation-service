// 后端适配（mock）：无服务端，直接读 src/mock/data/menu.js 构建路由与登录态。
// 约定与 psm-ui 一致：menuRows 的 formLoadPath → import('@/views/' + path)，formEname → 路由名/路径。
import { h, markRaw, defineAsyncComponent } from 'vue'
import { RouterView } from 'vue-router'
import { menuRows, buttonRows } from '@/mock/data/menu'

// 动态加载视图：'/views/BM/SP/BMSP01' → import('@/views/BM/SP/BMSP01.vue')
// 🔴 必须 markRaw：路由记录会被存进 Vuex(响应式) state，组件若被 reactive() 包成 Proxy，
// RouterView/keep-alive 用「组件类型」做身份比较时会错位，触发
// 「Vue received a Component that was made a reactive object」告警，并导致点菜单切页后页面不渲染。
function loadView(formLoadPath) {
  const componentPath = formLoadPath.split('/').slice(2).join('/')
  return markRaw(defineAsyncComponent(() => import(`@/views/${componentPath}.vue`)))
}

// 分组占位路由（只渲染 router-view，让叶子页面挂在它下面）。同样 markRaw。
const RouteView = markRaw({ name: 'MockRouteView', render: () => h(RouterView) })

// 登录：mock 模式任意账号通过
export async function login({ username }) {
  return {
    token: 'mock-' + Date.now(),
    userInfo: { username, name: username || '演示用户' }
  }
}

// 菜单 → 动态路由（按 groupEname 分组、sort 排序）
export async function getMenuAndButtons() {
  const groupMap = {}
  menuRows
    .slice()
    .sort((a, b) =>
      Number(a.sort || 0) - Number(b.sort || 0) ||
      String(a.formEname).localeCompare(String(b.formEname))
    )
    .forEach(item => {
      if (!item.formEname || !item.formLoadPath) return
      const leaf = {
        path: `/${item.formEname}`,
        name: item.formEname,
        component: loadView(item.formLoadPath),
        meta: {
          title: item.formCname,
          keepAlive: true,
          url: item.formLoadPath,
          fullTitle: item.fullTitle,
          icon: item.icon
        }
      }
      if (!item.groupEname) {
        groupMap[item.formEname] = leaf
        return
      }
      const group = groupMap[item.groupEname] || (groupMap[item.groupEname] = {
        path: `/mock/${item.groupEname}`,
        name: `mock_${item.groupEname}`,
        component: RouteView,
        meta: { title: item.groupCname || item.groupEname },
        children: []
      })
      group.children.push(leaf)
    })

  const childRoutes = Object.values(groupMap).filter(route => !route.children || route.children.length)
  const buttonRulesMap = {}
  ;(buttonRows || []).forEach(b => {
    (buttonRulesMap[b.formEname] = buttonRulesMap[b.formEname] || []).push(b.buttonEname)
  })
  return { childRoutes, buttonRulesMap }
}

export default { login, getMenuAndButtons }
