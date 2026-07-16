<template>
  <a-layout id="basic-layout">
    <a-layout-header class="header">
      <div class="logo">
        <div class="brand">
          <strong>XinPlat ERP</strong>
          <small>ENTERPRISE PLATFORM</small>
        </div>
        <span class="divider"></span>
        <div class="system-name">
          <strong>管理控制台</strong>
          <small>MANAGEMENT CONSOLE</small>
        </div>
      </div>
      <div class="header-search">
        <a-icon type="search" />
        <input type="text" placeholder="请输入页面名称或功能关键字" aria-label="页面搜索">
      </div>
      <div class="right">
        <span class="company-info">总部租户 | 系统管理员</span>
        <span class="user-badge">
          <span class="avatar">{{ username.slice(0, 1) }}</span>
          <span class="username">{{ username }}</span>
        </span>
        <a-button class="logout" type="link" size="small" @click="logout">退出</a-button>
      </div>
    </a-layout-header>

    <a-layout class="body-layout">
      <a-layout-sider
        v-model:collapsed="collapsed"
        class="sidebar"
        collapsible
        theme="light"
        :width="220"
        :collapsed-width="64">
        <side-menu
          :routes="menuRoutes"
          :selected-keys="selectedKeys"
          :collapsed="collapsed"
          @select="onMenuClick" />
      </a-layout-sider>

      <a-layout class="main-layout">
        <multi-tab />
        <a-layout-content class="content">
          <!-- 单一 keep-alive 包裹（Vue3 标准写法）。
               切勿用「keep-alive 内一个 <component> + 外面再一个 <component> 靠 v-if 切换」的双分支写法：
               从非缓存页切到缓存页时 keep-alive 会对同一 vnode 的 activate/deactivate 识别错位，
               抛 `parentComponent.ctx.deactivate is not a function` 并打断整页渲染。 -->
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" :key="$route.fullPath" />
            </keep-alive>
          </router-view>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<script>
import SideMenu from '@/components/SideMenu.vue'
import MultiTab from '@/components/MultiTab.vue'

export default {
  name: 'BasicLayout',
  components: {
    SideMenu,
    MultiTab
  },
  data() {
    return {
      collapsed: false
    }
  },
  computed: {
    selectedKeys() {
      return [this.$route.path]
    },
    username() {
      const info = this.$store.getters.userInfo || {}
      return info.name || this.$store.getters.nickname || '已登录用户'
    },
    menuRoutes() {
      return this.$store.state.permission.routers || []
    }
  },
  methods: {
    onMenuClick(payload) {
      // 防御性兜底：正常情况下 SideMenu 已声明 emits 并只 emit 字符串 key。
      // 这里仍做类型判断，避免未来任何监听器透传/误绑定把 a-menu 原生事件对象塞进 router.push。
      const key = typeof payload === 'string' ? payload : payload && payload.key
      if (typeof key === 'string' && key !== this.$route.path) {
        this.$router.push(key)
      }
    },
    logout() {
      this.$store.dispatch('Logout').finally(() => {
        window.location.hash = '#/user/login'
        window.location.reload()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
#basic-layout {
  height: 100vh;
  overflow: hidden;
  background: $layout-body-bg;
}

.header {
  z-index: 10;
  display: flex;
  align-items: center;
  height: $header-height;
  padding: 0 24px;
  color: $text-color;
  line-height: normal;
  background: #fff;
  border-bottom: 1px solid $border-color;
  box-shadow: $box-shadow-header;

  .logo {
    display: flex;
    align-items: center;
    min-width: 410px;
  }

  .brand,
  .system-name {
    display: flex;
    flex-direction: column;
    gap: 2px;

    small {
      color: $text-color-muted;
      font-size: 9px;
      letter-spacing: 0.6px;
    }
  }

  .brand strong {
    color: $primary-color;
    font-size: 17px;
    letter-spacing: 1px;
  }

  .system-name strong {
    color: $text-color;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 1px;
  }

  .divider {
    width: 1px;
    height: 28px;
    margin: 0 14px;
    background: $border-color;
  }

  .header-search {
    position: relative;
    flex: 1;
    max-width: 360px;
    margin: 0 auto;

    .anticon {
      position: absolute;
      top: 9px;
      right: 13px;
      z-index: 1;
      color: $text-color-muted;
    }

    input {
      width: 100%;
      height: 32px;
      padding: 0 38px 0 15px;
      color: $text-color;
      font-size: 13px;
      background: #f3f4f6;
      border: 1px solid $border-color;
      border-radius: $border-radius-base;
      outline: 0;

      &::placeholder {
        color: $text-color-muted;
      }

      &:focus {
        background: #fff;
        border-color: $primary-color;
      }
    }
  }

  .right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 360px;
    gap: 14px;
  }

  .company-info {
    color: $text-color-secondary;
    font-size: 12px;
  }

  .user-badge {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .avatar {
    @include flex-center;

    width: 32px;
    height: 32px;
    color: #fff;
    font-weight: 600;
    background: $primary-color;
    border-radius: 50%;
  }

  .username {
    max-width: 90px;
    color: $text-color-secondary;
    font-size: 12px;
    @include text-ellipsis;
  }

  .logout {
    padding: 0;
    color: $primary-color;
  }
}

.body-layout {
  min-height: 0;
}

.sidebar {
  overflow: auto;
  background: #fff;
  border-right: 1px solid $border-color;

  :deep(.ant-layout-sider-children) {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  :deep(.ant-layout-sider-children > .ant-menu) {
    flex: 1;
    min-height: 0;
    padding-bottom: 48px;
    overflow-x: hidden;
    overflow-y: auto;
    border-right: 0;
  }

  :deep(.ant-menu-inline) {
    width: 100%;
  }

  :deep(.ant-menu-sub) {
    width: 100%;
    padding-bottom: 0;
    overflow: hidden;
  }

  :deep(.ant-menu-item),
  :deep(.ant-menu-submenu-title) {
    height: 40px;
    color: $text-color-secondary;
    font-size: 14px;
    line-height: 40px;
    border-radius: $border-radius-base;
  }

  :deep(.ant-menu-item-selected) {
    color: $primary-color;
    font-weight: 500;
    background: $primary-light;
  }

  // 隐藏 AntD inline 菜单默认的右侧选中指示条（原型用圆角色块选中态）
  :deep(.ant-menu-inline .ant-menu-item::after) {
    display: none;
  }

  :deep(.ant-layout-sider-trigger) {
    color: $text-color-secondary;
    background: #fafafa;
    border-top: 1px solid $border-color;
  }
}

.main-layout {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.content {
  min-height: 0;
  margin: 12px 16px 16px;
  overflow: auto;
}

@media (max-width: 1100px) {
  .header {
    .logo {
      min-width: 330px;
    }

    .company-info,
    .system-name small {
      display: none;
    }

    .right {
      min-width: 150px;
    }
  }
}
</style>
