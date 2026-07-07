import 'core-js/stable'

import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

import App from './App.vue'
import router, { resetRouter } from './router'
import store from './store'
import AIcon from '@/components/AIcon'
import './permission' // 路由守卫 / mock 鉴权
import '@/assets/styles/global.scss'

async function bootstrapDynamicRoutes() {
  const hasToken = store.getters.token
  const hasDynamicRoutes = store.getters.addRouters && store.getters.addRouters.length > 0
  if (!hasToken || hasDynamicRoutes) return

  await store.dispatch('GenerateRoutes')
  resetRouter()
  store.getters.addRouters.forEach(route => router.addRoute('index', route))
}

async function bootstrap() {
  await bootstrapDynamicRoutes()

  const app = createApp(App)

  app.use(Antd)
  // 兼容层：保留 <a-icon type="xxx" /> 的字符串用法（Ant Design Vue 4 已移除内置 a-icon）。
  // 注册在 app.use(Antd) 之后，确保不被覆盖。
  app.component('AIcon', AIcon)

  app.use(store)
  app.use(router)

  await router.isReady()
  app.mount('#app')
}

bootstrap()
