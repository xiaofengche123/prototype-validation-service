<template>
  <a-menu
    theme="light"
    mode="inline"
    :inline-collapsed="collapsed"
    :selected-keys="selectedKeys"
    :open-keys="openKeys"
    :items="items"
    @click="onClick"
    @openChange="keys => (openKeys = keys)" />
</template>

<script>
// 左侧菜单（Vue3 + Ant Design Vue 4）：用 a-menu 的 items 协议渲染（AntD4 推荐写法，取代旧的 a-sub-menu/slot）。
// 图标沿用「按字符串名取图标」：menu.js 显式 icon 优先，否则按中文/英文关键字推断，再退化到稳定哈希分配。
import { h } from 'vue'
import AIcon from './AIcon'

function joinPath(parentPath, childPath) {
  if (!childPath) return parentPath || '/'
  if (childPath.startsWith('/')) return childPath
  return `${parentPath || ''}/${childPath}`.replace(/\/+/g, '/')
}

function visibleRoutes(routes) {
  return (routes || []).filter(route => !route.hidden && route.meta && route.meta.title)
}

const ICON_RULES = [
  { keywords: ['首页', '主页', '工作台', '导航', 'home', 'dashboard'], icon: 'home' },
  { keywords: ['异常', '错误', '报错', '故障', 'bug', 'error'], icon: 'bug' },
  { keywords: ['审批', '审核', '审计', '流程', 'audit', 'approve'], icon: 'audit' },
  { keywords: ['用户', '人员', '员工', '组织', '角色', '权限', 'user', 'role'], icon: 'team' },
  { keywords: ['计划', '日程', '任务', '排程', 'schedule', 'task'], icon: 'schedule' },
  { keywords: ['合同', '协议', '文档', '档案', '文件', 'contract', 'document'], icon: 'file-text' },
  { keywords: ['采购', '供应', '供应商', '订单', '物料', 'purchase', 'supplier'], icon: 'shopping-cart' },
  { keywords: ['库存', '仓库', '入库', '出库', 'inventory', 'warehouse'], icon: 'inbox' },
  { keywords: ['生产', '工艺', '设备', '投料', 'process', 'equipment'], icon: 'tool' },
  { keywords: ['模型', '算法', '求解', '计算', '优化', 'model', 'solve'], icon: 'calculator' },
  { keywords: ['参数', '配置', '设置', '维护', '字典', 'config', 'setting'], icon: 'setting' },
  { keywords: ['查询', '搜索', '检索', 'search', 'query'], icon: 'search' },
  { keywords: ['统计', '报表', '分析', '指标', '结果', 'report', 'chart'], icon: 'bar-chart' },
  { keywords: ['价格', '成本', '金额', '财务', 'price', 'cost'], icon: 'fund' },
  { keywords: ['新增', '编辑', '录入', '表单', '增删改查', 'form', 'crud'], icon: 'form' },
  { keywords: ['消息', '通知', '公告', 'message', 'notice'], icon: 'notification' },
  { keywords: ['接口', '服务', '联调', 'api', 'service'], icon: 'api' },
  { keywords: ['安全', '风控', '校验', 'security', 'validate'], icon: 'safety' },
  { keywords: ['系统', '平台', '应用', '模块', 'system', 'platform'], icon: 'appstore' }
]

const GROUP_ICONS = [
  'folder-open',
  'project',
  'apartment',
  'cluster',
  'deployment-unit',
  'container',
  'database',
  'build'
]

const PAGE_ICONS = [
  'profile',
  'table',
  'file',
  'read',
  'solution',
  'experiment',
  'control',
  'area-chart',
  'line-chart',
  'pie-chart'
]

function stableIndex(text, length) {
  let hash = 0
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0
  }
  return Math.abs(hash) % length
}

function routeIcon(route, hasChildren) {
  if (route.meta && route.meta.icon) return route.meta.icon

  const source = [
    route.meta && route.meta.title,
    route.meta && route.meta.group,
    route.meta && route.meta.nodeEname,
    route.name,
    route.path
  ].filter(Boolean).join(' ').toLowerCase()

  const matched = ICON_RULES.find(rule => rule.keywords.some(keyword => source.includes(keyword)))
  if (matched) return matched.icon

  const candidates = hasChildren ? GROUP_ICONS : PAGE_ICONS
  return candidates[stableIndex(source, candidates.length)]
}

export default {
  name: 'SideMenu',
  // 🔴 必须声明 emits：本组件根节点就是第三方组件 a-menu。
  // Vue3 中父组件上的 @select 若未在此声明，会作为「未识别监听器」fallthrough 透传到根节点 a-menu，
  // 导致 BasicLayout 既收到本组件 emit 的字符串 key，又收到 a-menu 原生 click 事件对象，
  // onMenuClick 被调用两次、对象污染 router.push → 表面上「点菜单没反应」。
  // 凡是 $emit('xxx') 的组件都要把 'xxx' 写进 emits，wrapper 组件尤其要警惕透传。
  emits: ['select'],
  props: {
    routes: {
      type: Array,
      default: () => []
    },
    selectedKeys: {
      type: Array,
      default: () => []
    },
    collapsed: Boolean
  },
  data() {
    return { openKeys: [] }
  },
  computed: {
    items() {
      const list = []
      for (const route of this.routes) {
        const children = visibleRoutes(route.children)
        if (route.path === '/' && children.length) {
          children.forEach(child => list.push(this.toItem(child, '')))
        } else if (!route.hidden && route.meta && route.meta.title) {
          list.push(this.toItem(route, ''))
        }
      }
      return list
    }
  },
  watch: {
    items: {
      immediate: true,
      handler(items) {
        if (this.collapsed) return
        // 默认展开全部分组
        this.openKeys = items.filter(item => item.children).map(item => item.key)
      }
    }
  },
  methods: {
    toItem(route, parentPath) {
      const path = joinPath(parentPath, route.path)
      const children = visibleRoutes(route.children)
      const type = routeIcon(route, children.length > 0)
      if (children.length) {
        return {
          key: route.name || path,
          icon: () => h(AIcon, { type }),
          label: route.meta.title,
          children: children.map(child => this.toItem(child, path))
        }
      }
      return {
        key: path,
        icon: () => h(AIcon, { type }),
        label: route.meta.title
      }
    },
    onClick({ key }) {
      this.$emit('select', key)
    }
  }
}
</script>
