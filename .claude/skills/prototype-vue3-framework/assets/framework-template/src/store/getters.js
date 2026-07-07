export default {
  multiTab: state => state.app.multiTab,
  token: state => state.user.token,
  userInfo: state => state.user.info,
  nickname: state => (state.user.info && state.user.info.name) || '',
  roles: state => state.user.roles,
  addRouters: state => state.permission.addRouters,
  routers: state => state.permission.routers
}
