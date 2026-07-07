// 用户态（mock）：任意账号即可登录，token/用户信息存 localStorage，刷新保持登录。
import backend from '@/api/backend'

const TOKEN_KEY = 'demo_token'
const INFO_KEY = 'demo_user'

function readInfo() {
  try { return JSON.parse(localStorage.getItem(INFO_KEY) || 'null') } catch (e) { return null }
}

export default {
  state: {
    token: localStorage.getItem(TOKEN_KEY) || '',
    info: readInfo(),
    roles: {}
  },
  mutations: {
    SET_TOKEN: (state, token) => { state.token = token },
    SET_INFO: (state, info) => { state.info = info }
  },
  actions: {
    // 登录：mock 模式任意账号通过
    async Login({ commit }, { username, password }) {
      const { token, userInfo } = await backend.login({ username, password })
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(INFO_KEY, JSON.stringify(userInfo))
      commit('SET_TOKEN', token)
      commit('SET_INFO', userInfo)
      return { token }
    },
    async Logout({ commit }) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(INFO_KEY)
      commit('SET_TOKEN', '')
      commit('SET_INFO', null)
    }
  }
}
