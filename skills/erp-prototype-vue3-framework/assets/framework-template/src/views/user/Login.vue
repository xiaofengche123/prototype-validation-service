<template>
  <div class="login">
    <div class="login-card">
      <div class="login-brand">
        <span class="brand-mark">绿</span>
        <div>
          <h2 class="login-title">高端ERP</h2>
          <p class="login-sub">管理系统演示</p>
        </div>
      </div>

      <a-form ref="form" :model="form" :rules="rules" @finish="handleSubmit">
        <a-form-item name="username">
          <a-input v-model:value="form.username" size="large" placeholder="用户名">
            <template #prefix><a-icon type="user" /></template>
          </a-input>
        </a-form-item>
        <a-form-item name="password">
          <a-input-password v-model:value="form.password" size="large" placeholder="密码">
            <template #prefix><a-icon type="lock" /></template>
          </a-input-password>
        </a-form-item>
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading">登 录</a-button>
        </a-form-item>
      </a-form>

      <p class="login-tip">提示：当前为离线演示模式，任意账号密码均可进入。</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      loading: false,
      form: { username: 'admin', password: '' },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  methods: {
    // a-form 校验通过后由 @finish 触发
    handleSubmit() {
      this.loading = true
      this.$store.dispatch('Login', { username: this.form.username, password: this.form.password })
        .then(res => {
          if (res && res.token) {
            this.$message.success('登录成功')
            const redirect = this.$route.query.redirect || '/'
            this.$router.push(redirect)
          } else {
            this.$message.error('登录失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error((err && err.message) || '登录请求异常')
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.login {
  @include flex-center;

  &-card {
    width: 388px;
    padding: 34px 32px 28px;
    background: $component-bg;
    border: 1px solid rgba(255, 255, 255, 0.65);
    border-radius: 6px;
    box-shadow: 0 16px 48px rgba(13, 71, 161, 0.2);
  }

  &-title {
    margin: 0 0 3px;
    color: $primary-dark;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 3px;
  }

  &-sub {
    margin: 0;
    color: $text-color-secondary;
    font-size: 12px;
  }

  &-tip {
    margin-top: 8px;
    color: $text-color-secondary;
    font-size: 12px;
  }
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}

.brand-mark {
  @include flex-center;

  width: 46px;
  height: 46px;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, $primary-dark, #4096ff);
  border-radius: 10px;
  box-shadow: 0 6px 16px rgba(21, 101, 192, 0.24);
}

:deep(.ant-input-affix-wrapper .ant-input) {
  height: 40px;
}

:deep(.ant-btn-lg) {
  height: 42px;
  background: linear-gradient(90deg, $primary-dark, #1677ff);
  border: 0;
}
</style>
