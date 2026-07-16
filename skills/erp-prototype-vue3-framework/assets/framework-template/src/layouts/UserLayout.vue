<template>
  <div class="user-layout">
    <div class="user-layout-content">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserLayout'
}
</script>

<style lang="scss" scoped>
.user-layout {
  @include flex-center;

  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(13, 71, 161, 0.94), rgba(25, 118, 210, 0.82)),
    radial-gradient(circle at 20% 20%, #4096ff, transparent 38%),
    $primary-dark;

  &::before,
  &::after {
    position: absolute;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 50%;
    content: '';
  }

  &::before {
    width: 520px;
    height: 520px;
    top: -240px;
    right: -120px;
  }

  &::after {
    width: 360px;
    height: 360px;
    bottom: -180px;
    left: -80px;
  }

  &-content {
    width: 384px;
    padding: 32px 0;
    z-index: 1;
  }
}
</style>
