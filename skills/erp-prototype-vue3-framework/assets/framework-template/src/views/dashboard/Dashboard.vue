<template>
  <div class="dashboard">
    <div class="page-heading">
      <div>
        <h1><span></span>功能导航</h1>
        <p>由菜单(menu.js)自动生成；点击任意功能进入对应页面</p>
      </div>
      <div class="user-summary">
        <span class="online-dot"></span>
        {{ username }}，欢迎进入系统
      </div>
    </div>

    <div v-if="modules.length" class="module-grid">
      <article v-for="(mod, index) in modules" :key="mod.name" class="module-card">
        <header>
          <span class="module-num">{{ index + 1 }}</span>
          <div>
            <h2>{{ mod.name }}</h2>
            <small>{{ mod.items.length }} 个功能</small>
          </div>
          <a-icon :type="mod.icon" />
        </header>
        <div class="module-links">
          <div
            v-for="item in mod.items"
            :key="item.path"
            class="module-link"
            @click="go(item.path)">
            <span class="link-dot"></span>
            <span>{{ item.title }}</span>
            <a-icon type="right" />
          </div>
        </div>
      </article>
    </div>

    <a-empty v-else description="暂无功能页面，请用「原型转Vue」把页面转进来并登记菜单" />
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  computed: {
    username() {
      const info = this.$store.getters.userInfo || {}
      return info.name || info.username || '当前用户'
    },
    modules() {
      const groups = []
      const ungrouped = []
      const walk = routes => {
        ;(routes || []).forEach(r => {
          const kids = (r.children || []).filter(c => c.meta && c.meta.title)
          if (r.path && r.path.indexOf('/mock/') === 0 && kids.length) {
            groups.push({
              name: r.meta.title,
              icon: (r.meta && r.meta.icon) || 'appstore',
              items: kids.map(k => ({ title: k.meta.title, path: k.path }))
            })
          } else if (r.meta && r.meta.title && r.meta.keepAlive && r.path && r.path !== '/dashboard' && r.path.indexOf('/mock/') !== 0) {
            ungrouped.push({ title: r.meta.title, path: r.path })
          }
          if (r.children) walk(r.children)
        })
      }
      walk(this.$store.getters.routers)
      if (ungrouped.length) groups.push({ name: '其他功能', icon: 'appstore', items: ungrouped })
      return groups
    }
  },
  methods: {
    go(path) {
      if (path && path !== this.$route.path) this.$router.push(path)
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  min-height: 100%;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 16px;

  h1 {
    display: flex;
    align-items: center;
    margin: 0 0 5px;
    color: $text-color;
    font-size: 16px;
    font-weight: 700;

    span {
      width: 4px;
      height: 18px;
      margin-right: 8px;
      background: $primary-color;
      border-radius: 2px;
    }
  }

  p {
    margin: 0 0 0 12px;
    color: $text-color-muted;
    font-size: 12px;
  }
}

.user-summary {
  color: $text-color-secondary;
  font-size: 12px;
}

.online-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 6px;
  background: $success-color;
  border-radius: 50%;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(250px, 1fr));
  gap: 16px;
}

.module-card {
  overflow: hidden;
  background: #fff;
  border: 1px solid $border-color;
  border-radius: 6px;
  box-shadow: $box-shadow-card;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  header {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 64px;
    padding: 12px 16px;
    background: linear-gradient(90deg, $primary-light 0%, #fff 100%);
    border-bottom: 1px solid $border-color;

    h2 {
      margin: 0;
      color: $text-color;
      font-size: 14px;
      font-weight: 700;
    }

    small {
      color: $text-color-muted;
      font-size: 9px;
      letter-spacing: 0.6px;
    }

    > .anticon {
      position: absolute;
      right: 16px;
      color: $primary-color;
      font-size: 26px;
      opacity: 0.12;
    }
  }
}

.module-num {
  @include flex-center;

  width: 28px;
  height: 28px;
  color: #fff;
  font-weight: 700;
  background: $primary-color;
  border-radius: 50%;
}

.module-links {
  padding: 6px 0;
}

.module-link {
  display: flex;
  align-items: center;
  min-height: 38px;
  padding: 0 16px;
  color: $text-color-secondary;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    color: $primary-color;
    background: $primary-light;
  }

  .link-dot {
    width: 6px;
    height: 6px;
    margin-right: 9px;
    background: $primary-color;
    border-radius: 50%;
    opacity: 0.55;
  }

  span:nth-child(2) {
    flex: 1;
  }

  .anticon {
    font-size: 10px;
    opacity: 0.45;
  }
}

@media (max-width: 1200px) {
  .module-grid {
    grid-template-columns: repeat(2, minmax(250px, 1fr));
  }
}

@media (max-width: 760px) {
  .module-grid {
    grid-template-columns: 1fr;
  }

  .user-summary {
    display: none;
  }
}
</style>
