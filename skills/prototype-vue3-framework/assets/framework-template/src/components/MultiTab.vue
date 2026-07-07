<template>
  <a-tabs
    v-if="enabled"
    class="multi-tab"
    type="editable-card"
    hide-add
    :active-key="$route.fullPath"
    :items="tabItems"
    @change="navigate"
    @edit="close" />
</template>

<script>
// 多页签（Vue3 + Ant Design Vue 4）：用 a-tabs 的 items 协议渲染（AntD4 推荐写法，取代旧的 a-tab-pane/slot）。
import { h } from 'vue'
import AIcon from './AIcon'

const HOME_TAB = {
  fullPath: '/dashboard',
  title: '功能导航',
  fixed: true
}

export default {
  name: 'MultiTab',
  data() {
    return {
      tabs: [{ ...HOME_TAB }]
    }
  },
  computed: {
    enabled() {
      return this.$store.getters.multiTab
    },
    tabItems() {
      return this.tabs.map(tab => ({
        key: tab.fullPath,
        closable: !tab.fixed,
        label: () => h('span', { class: 'tab-label' }, [
          tab.fixed ? h(AIcon, { type: 'home' }) : null,
          h('span', tab.title)
        ])
      }))
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(route) {
        if (!route.name || route.name === 'login' || route.meta.hidden) return

        const fullPath = route.path === HOME_TAB.fullPath ? HOME_TAB.fullPath : route.fullPath
        const existing = this.tabs.find(tab => tab.fullPath === fullPath)
        if (existing) {
          existing.title = route.path === HOME_TAB.fullPath
            ? HOME_TAB.title
            : (route.meta.title || route.name)
          return
        }

        this.tabs.push({
          fullPath,
          title: route.meta.title || route.name,
          fixed: false
        })
      }
    }
  },
  methods: {
    navigate(fullPath) {
      if (fullPath !== this.$route.fullPath) this.$router.push(fullPath)
    },
    close(fullPath, action) {
      if (action !== 'remove') return
      const index = this.tabs.findIndex(tab => tab.fullPath === fullPath)
      if (index === -1 || this.tabs[index].fixed) return

      this.tabs.splice(index, 1)
      if (fullPath === this.$route.fullPath) {
        const next = this.tabs[index] || this.tabs[index - 1]
        this.$router.push(next ? next.fullPath : HOME_TAB.fullPath)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// 与 app.css 的 .page-tabs 对齐：贴边平铺、底部一根分隔线，不做浮起卡片
.multi-tab {
  min-height: 40px;
  margin: 0;
  padding: 0 8px;
  background: $component-bg;
  border-bottom: 1px solid $border-color;

  :deep(.ant-tabs-nav) {
    margin: 0;
  }

  :deep(.ant-tabs-nav::before) {
    border-bottom: 0;
  }

  :deep(.ant-tabs-nav .ant-tabs-tab) {
    height: 40px;
    margin: 0 !important;
    padding: 0 18px;
    color: $text-color-secondary;
    line-height: 40px;
    background: transparent;
    border: 0;
    border-bottom: 2px solid transparent;
    border-radius: 0;
  }

  :deep(.ant-tabs-tab .ant-tabs-tab-remove) {
    margin-left: 8px;
    color: $text-color-muted;
    font-size: 11px;
  }

  :deep(.ant-tabs-tab .ant-tabs-tab-remove:hover) {
    color: $error-color;
  }

  :deep(.ant-tabs-tab-active) {
    border-bottom-color: $primary-color;
  }

  :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
    color: $primary-color;
    font-weight: 600;
  }

  .tab-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
}
</style>
