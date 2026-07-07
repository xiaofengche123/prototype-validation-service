// a-icon 兼容层（Vue3 + Ant Design Vue 4）
// 背景：AntD Vue 1.x 用 <a-icon type="search" /> 的字符串写法；AntD Vue 4 改成了独立图标组件
// （@ant-design/icons-vue 的 SearchOutlined 等），不再有内置 a-icon。
// 为了让框架沿用「按字符串名取图标」的写法（菜单 menu.js 的 icon 字段、SideMenu 的自动选标都靠它），
// 这里提供一个全局 <a-icon type="xxx" />，把 type 字符串映射成对应的 *Outlined 组件。
import { h } from 'vue'
import * as Icons from '@ant-design/icons-vue'

// 'file-text' -> 'FileTextOutlined'；'search' -> 'SearchOutlined'
function toComponentName(type) {
  const base = String(type || '')
    .split('-')
    .filter(Boolean)
    .map(seg => seg.charAt(0).toUpperCase() + seg.slice(1))
    .join('')
  return base ? `${base}Outlined` : ''
}

export default {
  name: 'AIcon',
  props: {
    type: { type: String, default: '' },
    spin: { type: Boolean, default: false },
    rotate: { type: Number, default: undefined }
  },
  render() {
    const Comp = Icons[toComponentName(this.type)] || Icons.AppstoreOutlined
    return h(Comp, { spin: this.spin, rotate: this.rotate })
  }
}
