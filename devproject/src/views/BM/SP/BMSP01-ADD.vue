<template>
  <div class="prototype-page has-fixed-actions">
    <a-form ref="form" :model="form" :rules="rules" layout="vertical">
      <!-- 基本信息 -->
      <div class="prototype-card">
        <div class="prototype-card-head">
          <div class="prototype-title">基本信息</div>
        </div>
        <div class="prototype-query-grid">
          <a-form-item class="prototype-field" name="name">
            <template #label>供应商名称<span class="req">*</span></template>
            <a-input v-model:value="form.name" placeholder="请输入供应商全称" />
          </a-form-item>
          <a-form-item class="prototype-field" name="code">
            <template #label>统一社会信用代码<span class="req">*</span></template>
            <a-input v-model:value="form.code" placeholder="请输入 18 位信用代码" />
          </a-form-item>
          <a-form-item class="prototype-field" label="所属行业" name="industry">
            <a-select v-model:value="form.industry" placeholder="请选择" allow-clear>
              <a-select-option v-for="item in industryOptions" :key="item" :value="item">{{ item }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item class="prototype-field" label="成立日期" name="establish">
            <a-date-picker v-model:value="form.establish" value-format="YYYY-MM-DD" style="width:100%" />
          </a-form-item>
        </div>
      </div>

      <!-- 联系信息 -->
      <div class="prototype-card">
        <div class="prototype-card-head">
          <div class="prototype-title">联系信息</div>
        </div>
        <div class="prototype-query-grid">
          <a-form-item class="prototype-field" name="contact">
            <template #label>联系人<span class="req">*</span></template>
            <a-input v-model:value="form.contact" />
          </a-form-item>
          <a-form-item class="prototype-field" name="phone">
            <template #label>联系电话<span class="req">*</span></template>
            <a-input v-model:value="form.phone" />
          </a-form-item>
          <a-form-item class="prototype-field" label="邮箱" name="email">
            <a-input v-model:value="form.email" />
          </a-form-item>
          <a-form-item class="prototype-field" label="地址" name="address">
            <a-input v-model:value="form.address" />
          </a-form-item>
        </div>
      </div>

      <!-- 资质信息 -->
      <div class="prototype-card">
        <div class="prototype-card-head">
          <div class="prototype-title">资质信息</div>
        </div>
        <div class="prototype-query-grid">
          <a-form-item class="prototype-field">
            <template #label>营业执照扫描件<span class="req">*</span></template>
            <a-upload :file-list="licenseFileList" :before-upload="beforeUpload" @change="info => licenseFileList = info.fileList">
              <a-button size="small">选择文件</a-button>
            </a-upload>
          </a-form-item>
          <a-form-item class="prototype-field" label="资质等级" name="level">
            <a-select v-model:value="form.level" placeholder="请选择" allow-clear>
              <a-select-option v-for="item in levelOptions" :key="item" :value="item">{{ item }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item class="prototype-field" name="licenseExpire">
            <template #label>营业执照有效期至<span class="req">*</span></template>
            <a-date-picker v-model:value="form.licenseExpire" value-format="YYYY-MM-DD" style="width:100%" />
          </a-form-item>
          <a-form-item class="prototype-field" label="其他资质附件">
            <a-upload :file-list="attachFileList" :before-upload="beforeUpload" @change="info => attachFileList = info.fileList">
              <a-button size="small">选择文件</a-button>
            </a-upload>
          </a-form-item>
        </div>
      </div>
    </a-form>

    <!-- 底部固定操作栏 -->
    <div class="fixed-bottom-bar between">
      <a-button @click="goBack">← 返回列表</a-button>
      <div style="display:flex;gap:10px">
        <a-button @click="saveDraft">保存草稿</a-button>
        <a-button type="primary" @click="submit">提交审核</a-button>
      </div>
    </div>
  </div>
</template>

<script>
import { INDUSTRY_OPTIONS, LEVEL_OPTIONS, submitApply, saveDraft } from './bmsp01-addApi'

export default {
  name: 'BMSP01-ADD',
  data() {
    return {
      industryOptions: INDUSTRY_OPTIONS,
      levelOptions: LEVEL_OPTIONS,
      form: {
        name: '',
        code: '',
        industry: undefined,
        establish: '',
        contact: '',
        phone: '',
        email: '',
        address: '',
        level: undefined,
        licenseExpire: ''
      },
      licenseFileList: [],
      attachFileList: [],
      rules: {
        name: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }],
        code: [{ required: true, message: '请输入统一社会信用代码', trigger: 'blur' }],
        contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
        phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
        licenseExpire: [{ required: true, message: '请选择营业执照有效期至', trigger: 'change' }]
      }
    }
  },
  methods: {
    beforeUpload() { return false },
    goBack() { this.$router.push('/BMSP01') },
    async saveDraft() {
      await saveDraft(this.form)
      this.$message.success('草稿已保存')
    },
    async submit() {
      try { await this.$refs.form.validate() } catch (e) { return }
      if (!this.licenseFileList.length) {
        this.$message.warning('请上传营业执照扫描件')
        return
      }
      await submitApply(this.form)
      this.$message.success('准入申请已提交审核')
    }
  }
}
</script>

<style lang="scss" scoped>
.prototype-field.ant-form-item {
  margin-bottom: 0;
}
</style>
