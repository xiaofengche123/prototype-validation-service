// 框架级 UI 设置（演示框架只保留多页签开关）
export default {
  state: {
    multiTab: true
  },
  mutations: {
    TOGGLE_MULTI_TAB: (state, bool) => {
      state.multiTab = bool
    }
  },
  actions: {}
}
