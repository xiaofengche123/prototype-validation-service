<template>
  <div class="prototype-page">
    <!-- 统计卡片 -->
    <div class="prototype-stat-row">
      <div
        v-for="s in statList"
        :key="s.key"
        class="prototype-stat-card"
        :class="{ active: filter.status === s.key }"
        @click="onStatusChange(s.key)">
        <div class="label">
          <span v-if="s.color" class="dot" :style="{ background: s.color }"></span>{{ s.label }}
        </div>
        <div class="num">{{ counts[s.key] || 0 }}</div>
      </div>
    </div>

    <!-- 查询卡片 -->
    <div class="prototype-card">
      <div class="prototype-card-head">
        <div class="prototype-title">查询信息</div>
        <div class="prototype-actions">
          <a-button @click="onReset">重置</a-button>
          <a-button type="primary" @click="onSearch">查询</a-button>
          <a-button type="primary" @click="openAdd">＋ 新增证照</a-button>
        </div>
      </div>
      <div class="prototype-query-grid">
        <div class="prototype-field">
          <label>供应商名称</label>
          <a-input v-model:value="filter.name" placeholder="请输入供应商名称" allow-clear />
        </div>
        <div class="prototype-field">
          <label>证照类型</label>
          <a-select v-model:value="filter.type" placeholder="全部" allow-clear>
            <a-select-option v-for="t in typeOptions" :key="t" :value="t">{{ t }}</a-select-option>
          </a-select>
        </div>
      </div>
    </div>

    <!-- 列表卡片 -->
    <div class="prototype-card prototype-list-card">
      <div class="prototype-list-toolbar">
        <div class="prototype-title">证照清单</div>
        <div class="prototype-actions">
          <a-button size="small" @click="batchExport">导出当前结果</a-button>
        </div>
      </div>

      <div class="prototype-status-tabs">
        <div
          v-for="s in statList"
          :key="s.key"
          class="prototype-status-tab"
          :class="{ active: filter.status === s.key }"
          @click="onStatusChange(s.key)">
          {{ s.label }} ({{ counts[s.key] || 0 }})
        </div>
      </div>

      <div class="prototype-table-wrap prototype-table">
        <a-table
          :columns="columns"
          :data-source="rows"
          :loading="loading"
          :pagination="pagination"
          :scroll="{ x: 1000 }"
          row-key="id"
          size="middle"
          @change="onTableChange">
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'supplier'">
              <a class="prototype-link" @click="goDetail(record)">{{ text }}</a>
            </template>
            <template v-else-if="column.dataIndex === 'expire'">
              <span>{{ text }}</span>
              <br v-if="fmtRemain(record.expire, record.status)">
              <small v-if="fmtRemain(record.expire, record.status)" :class="['remain', record.status]">{{ fmtRemain(record.expire, record.status) }}</small>
            </template>
            <template v-else-if="column.dataIndex === 'status'">
              <a-tag :class="['status-tag', statusMap[text].cls]">{{ statusMap[text].text }}</a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a class="prototype-op blue" @click="viewScan(record)">查看扫描件</a>
              <a class="prototype-op green" @click="openRenew(record)">登记续期</a>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 新增证照登记 -->
    <a-modal
      v-model:open="addVisible"
      title="新增证照登记"
      :confirm-loading="addSaving"
      @ok="onSaveAdd">
      <a-form ref="addForm" :model="addModel" :rules="addRules" layout="vertical">
        <div class="prototype-modal-form">
          <a-form-item name="supplier">
            <template #label>供应商名称<span class="req">*</span></template>
            <a-input v-model:value="addModel.supplier" placeholder="请输入供应商名称" />
          </a-form-item>
          <a-form-item name="type">
            <template #label>证照类型<span class="req">*</span></template>
            <a-select v-model:value="addModel.type" placeholder="请选择">
              <a-select-option v-for="t in typeOptions" :key="t" :value="t">{{ t }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item name="no">
            <template #label>证号<span class="req">*</span></template>
            <a-input v-model:value="addModel.no" placeholder="请输入证号" />
          </a-form-item>
          <a-form-item name="org">
            <template #label>发证机关<span class="req">*</span></template>
            <a-input v-model:value="addModel.org" placeholder="请输入发证机关" />
          </a-form-item>
          <a-form-item name="expire">
            <template #label>有效期至<span class="req">*</span></template>
            <a-date-picker v-model:value="addModel.expire" value-format="YYYY-MM-DD" style="width:100%" />
          </a-form-item>
          <a-form-item label="扫描件">
            <a-upload :file-list="addFileList" :before-upload="beforeUpload" @change="info => addFileList = info.fileList">
              <a-button size="small">选择文件</a-button>
            </a-upload>
          </a-form-item>
        </div>
      </a-form>
    </a-modal>

    <!-- 登记续期 -->
    <a-modal
      v-model:open="renewVisible"
      title="登记续期"
      :confirm-loading="renewSaving"
      @ok="onSaveRenew">
      <a-form ref="renewForm" :model="renewModel" :rules="renewRules" layout="vertical">
        <div class="prototype-modal-form">
          <a-form-item label="供应商">
            <a-input v-model:value="renewModel.supplier" readonly />
          </a-form-item>
          <a-form-item label="证照类型">
            <a-input v-model:value="renewModel.type" readonly />
          </a-form-item>
          <a-form-item name="expire">
            <template #label>新有效期至<span class="req">*</span></template>
            <a-date-picker v-model:value="renewModel.expire" value-format="YYYY-MM-DD" style="width:100%" />
          </a-form-item>
          <a-form-item label="新扫描件">
            <a-upload :file-list="renewFileList" :before-upload="beforeUpload" @change="info => renewFileList = info.fileList">
              <a-button size="small">选择文件</a-button>
            </a-upload>
          </a-form-item>
          <a-form-item label="备注" class="full-width">
            <a-textarea v-model:value="renewModel.remark" :rows="2" placeholder="请填写备注" />
          </a-form-item>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { queryBmsp02, countByStatus, saveAdd, saveRenew, TYPE_OPTIONS, STATUS_MAP, computeStatus } from './bmsp02Api'

export default {
  name: 'BMSP02',
  data() {
    return {
      loading: false,
      rows: [],
      counts: {},
      filter: { status: 'all', name: '', type: undefined },
      typeOptions: TYPE_OPTIONS,
      statusMap: STATUS_MAP,
      statList: [
        { key: 'all', label: '全部', color: '' },
        { key: 'valid', label: '有效', color: '#43a047' },
        { key: 'warning', label: '即将到期', color: '#fb8c00' },
        { key: 'expired', label: '已过期', color: '#e53935' }
      ],
      pagination: { current: 1, pageSize: 10, total: 0, showTotal: t => `共 ${t} 条` },
      columns: [
        { title: '序号', key: 'idx', width: 50, align: 'center', customRender: ({ index }) => index + 1 },
        { title: '供应商', dataIndex: 'supplier', align: 'center', width: 180 },
        { title: '证照类型', dataIndex: 'type', align: 'center', width: 140 },
        { title: '证号', dataIndex: 'no', align: 'center', width: 180 },
        { title: '发证机关', dataIndex: 'org', align: 'center', width: 140 },
        { title: '有效期', dataIndex: 'expire', align: 'center', width: 120 },
        { title: '状态', dataIndex: 'status', align: 'center', width: 90 },
        { title: '操作', key: 'action', align: 'center', width: 130 }
      ],
      // 新增
      addVisible: false,
      addSaving: false,
      addModel: {},
      addFileList: [],
      addRules: {
        supplier: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择证照类型', trigger: 'change' }],
        no: [{ required: true, message: '请输入证号', trigger: 'blur' }],
        org: [{ required: true, message: '请输入发证机关', trigger: 'blur' }],
        expire: [{ required: true, message: '请选择有效期至', trigger: 'change' }]
      },
      // 续期
      renewVisible: false,
      renewSaving: false,
      renewModel: {},
      renewFileList: [],
      renewRow: null,
      renewRules: {
        expire: [{ required: true, message: '请选择新有效期至', trigger: 'change' }]
      }
    }
  },
  created() {
    this.fetch()
    this.loadCounts()
  },
  methods: {
    fmtRemain(expire, status) {
      const diff = dayjs(expire).diff(dayjs(), 'day') // 以当前日期计算剩余天数，与静态示例语义一致
      if (status === 'expired') return '已过期 ' + Math.abs(diff) + ' 天'
      if (status === 'warning') return diff + ' 天后到期'
      return ''
    },
    async fetch() {
      this.loading = true
      try {
        const { current, pageSize } = this.pagination
        const { rows, count } = await queryBmsp02({
          filter: this.filter,
          offset: (current - 1) * pageSize,
          limit: pageSize
        })
        this.rows = rows
        this.pagination = { ...this.pagination, total: count }
      } finally {
        this.loading = false
      }
    },
    async loadCounts() { this.counts = await countByStatus() },
    onSearch() { this.pagination.current = 1; this.fetch() },
    onReset() {
      this.filter = { status: 'all', name: '', type: undefined }
      this.onSearch()
    },
    onStatusChange(key) { this.filter.status = key; this.onSearch() },
    onTableChange(pagination) {
      this.pagination.current = pagination.current
      this.pagination.pageSize = pagination.pageSize
      this.fetch()
    },
    goDetail(record) { this.$router.push('/BMSP02-DETAIL') },
    viewScan(record) { this.$message.info(`查看「${record.supplier}」的 ${record.type} 扫描件（占位）`) },
    batchExport() { this.$message.info('已按当前查询结果导出 Excel') },
    // 新增
    openAdd() {
      this.addModel = {}
      this.addFileList = []
      this.addVisible = true
    },
    beforeUpload() { return false },
    async onSaveAdd() {
      try { await this.$refs.addForm.validate() } catch (e) { return }
      this.addSaving = true
      try {
        const record = {
          supplier: this.addModel.supplier,
          type: this.addModel.type,
          no: this.addModel.no,
          org: this.addModel.org,
          expire: this.addModel.expire
        }
        await saveAdd(record)
        this.$message.success('证照登记已保存')
        this.addVisible = false
        this.fetch()
        this.loadCounts()
      } finally {
        this.addSaving = false
      }
    },
    // 续期
    openRenew(record) {
      this.renewRow = record
      this.renewModel = { supplier: record.supplier, type: record.type, expire: record.expire, remark: '' }
      this.renewFileList = []
      this.renewVisible = true
    },
    async onSaveRenew() {
      try { await this.$refs.renewForm.validate() } catch (e) { return }
      this.renewSaving = true
      try {
        await saveRenew({ id: this.renewRow.id, expire: this.renewModel.expire })
        this.$message.success('续期登记已保存')
        this.renewVisible = false
        this.renewRow = null
        this.fetch()
        this.loadCounts()
      } finally {
        this.renewSaving = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.prototype-op + .prototype-op {
  margin-left: 6px;
}
.remain {
  color: $warning-color;
  &.expired { color: $error-color; }
}
.full-width {
  grid-column: span 2;
}
</style>
