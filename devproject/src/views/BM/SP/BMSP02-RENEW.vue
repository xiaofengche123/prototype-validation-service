<template>
  <div class="prototype-page has-fixed-actions">
    <!-- 证照信息 -->
    <div class="prototype-card">
      <div class="prototype-card-head">
        <div class="prototype-title">证照信息</div>
      </div>
      <div class="prototype-query-grid">
        <div class="prototype-field">
          <label>供应商名称<span class="req">*</span></label>
          <a-select v-model:value="form.supplier" placeholder="请选择" @change="onCertChange">
            <a-select-option v-for="s in supplierOptions" :key="s" :value="s">{{ s }}</a-select-option>
          </a-select>
        </div>
        <div class="prototype-field">
          <label>证照类型<span class="req">*</span></label>
          <a-select v-model:value="form.certType" placeholder="请选择" @change="onCertChange">
            <a-select-option v-for="t in typeOptions" :key="t" :value="t">{{ t }}</a-select-option>
          </a-select>
        </div>
        <div class="prototype-field">
          <label>原证号</label>
          <a-input v-model:value="form.oldNo" readonly />
        </div>
        <div class="prototype-field">
          <label>原有效期至</label>
          <a-input v-model:value="form.oldExpire" readonly />
        </div>
      </div>
    </div>

    <!-- 续期信息 -->
    <div class="prototype-card">
      <div class="prototype-card-head">
        <div class="prototype-title">续期信息</div>
      </div>
      <a-form ref="form" :model="form" :rules="rules" layout="vertical">
        <div class="prototype-query-grid">
          <a-form-item class="prototype-field" name="newExpire">
            <template #label>新有效期至<span class="req">*</span></template>
            <a-date-picker v-model:value="form.newExpire" value-format="YYYY-MM-DD" style="width:100%" />
          </a-form-item>
          <a-form-item class="prototype-field">
            <template #label>新扫描件<span class="req">*</span></template>
            <a-upload :file-list="fileList" :before-upload="beforeUpload" @change="info => fileList = info.fileList">
              <a-button size="small">选择文件</a-button>
            </a-upload>
          </a-form-item>
          <a-form-item class="prototype-field" label="备注" style="grid-column:span 2">
            <a-textarea v-model:value="form.remark" :rows="3" placeholder="请填写续期说明" />
          </a-form-item>
        </div>
      </a-form>
    </div>

    <!-- 审批记录占位 -->
    <div class="prototype-card">
      <div class="prototype-card-head">
        <div class="prototype-title">审批记录</div>
      </div>
      <div class="prototype-table-wrap prototype-table fit-table">
        <a-table
          :columns="historyColumns"
          :data-source="[]"
          :pagination="false"
          row-key="id"
          size="middle">
          <template #emptyText>
            <span style="color:#999">提交后生成审批记录</span>
          </template>
        </a-table>
      </div>
    </div>

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
import { SUPPLIER_OPTIONS, TYPE_OPTIONS, getCertInfo, submitRenew, saveDraft } from './bmsp02-renewApi'

export default {
  name: 'BMSP02-RENEW',
  data() {
    return {
      supplierOptions: SUPPLIER_OPTIONS,
      typeOptions: TYPE_OPTIONS,
      form: {
        supplier: '广西铝业科技有限公司',
        certType: '危废经营许可证',
        oldNo: '',
        oldExpire: '',
        newExpire: '',
        remark: ''
      },
      fileList: [],
      rules: {
        supplier: [{ required: true, message: '请选择供应商', trigger: 'change' }],
        certType: [{ required: true, message: '请选择证照类型', trigger: 'change' }],
        newExpire: [{ required: true, message: '请选择新有效期至', trigger: 'change' }]
      },
      historyColumns: [
        { title: '序号', key: 'idx', width: 50, align: 'center', customRender: ({ index }) => index + 1 },
        { title: '日期', dataIndex: 'date', align: 'center', width: 160 },
        { title: '操作人', dataIndex: 'user', align: 'center', width: 120 },
        { title: '动作', dataIndex: 'action', align: 'center', width: 100 },
        { title: '意见', dataIndex: 'memo', align: 'left' }
      ]
    }
  },
  created() {
    this.onCertChange()
  },
  methods: {
    beforeUpload() { return false },
    onCertChange() {
      const info = getCertInfo(this.form.supplier, this.form.certType)
      this.form.oldNo = info.no
      this.form.oldExpire = info.expire
    },
    goBack() { this.$router.push('/BMSP02') },
    async saveDraft() {
      await saveDraft(this.form)
      this.$message.success('草稿已保存')
    },
    async submit() {
      try { await this.$refs.form.validate() } catch (e) { return }
      if (!this.fileList.length) {
        this.$message.warning('请上传新扫描件')
        return
      }
      await submitRenew(this.form)
      this.$message.success('续期申请已提交审核')
    }
  }
}
</script>

<style lang="scss" scoped>
.prototype-field.ant-form-item {
  margin-bottom: 0;
}
</style>
