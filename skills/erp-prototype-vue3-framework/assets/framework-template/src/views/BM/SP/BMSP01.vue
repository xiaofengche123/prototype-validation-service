<template>
  <!-- 高保真转换样板：结构与类名 1:1 对齐原型 pages/基础信息管理/供应商准入申请.html，
       复用 prototype-parity.scss 的 prototype-* 公用类，行为用 Ant Design Vue 4 组件实现。 -->
  <div class="prototype-page">
    <!-- 统计卡片（联动 filter.status） -->
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
          <a-button @click="onReset"><template #icon><a-icon type="reload" /></template>重置</a-button>
          <a-button type="primary" @click="onSearch"><template #icon><a-icon type="search" /></template>查询</a-button>
          <a-button type="primary" @click="openAdd"><template #icon><a-icon type="plus" /></template>新增申请</a-button>
        </div>
      </div>
      <div class="prototype-query-grid">
        <div class="prototype-field">
          <label>申请单号</label>
          <a-input v-model:value="filter.no" placeholder="请输入申请单号" allow-clear />
        </div>
        <div class="prototype-field">
          <label>供应商名称<span class="req">*</span></label>
          <a-input v-model:value="filter.name" placeholder="请输入供应商名称" allow-clear />
        </div>
        <div class="prototype-field">
          <label>申请类型</label>
          <a-select v-model:value="filter.type" placeholder="全部" allow-clear>
            <a-select-option v-for="t in typeOptions" :key="t" :value="t">{{ t }}</a-select-option>
          </a-select>
        </div>
        <div class="prototype-field">
          <label>申请状态</label>
          <a-select v-model:value="filter.status" @change="onSearch">
            <a-select-option v-for="s in statList" :key="s.key" :value="s.key">{{ s.label }}</a-select-option>
          </a-select>
        </div>
        <div class="prototype-field">
          <label>提交日期</label>
          <a-range-picker v-model:value="filter.dateRange" />
        </div>
      </div>
    </div>

    <!-- 列表卡片 -->
    <div class="prototype-card prototype-list-card">
      <div class="prototype-list-toolbar">
        <div class="prototype-title">供应商准入申请清单</div>
        <div class="prototype-actions">
          <a-button size="small" @click="batchExport">批量导出</a-button>
          <a-button size="small" type="primary" @click="batchApprove">批量审批</a-button>
        </div>
      </div>

      <div v-if="selectedRowKeys.length" class="prototype-batch-bar">
        已选择 <b>{{ selectedRowKeys.length }}</b> 项
        <a-button size="small" type="primary" @click="batchSubmit">批量提交</a-button>
        <a-button size="small" @click="batchDelete">批量删除</a-button>
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
          :row-selection="{ selectedRowKeys, onChange: keys => (selectedRowKeys = keys) }"
          :scroll="{ x: 1100 }"
          row-key="id"
          size="middle"
          @change="onTableChange">
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'no'">
              <a class="prototype-link" @click="goDetail">{{ text }}</a>
            </template>
            <template v-else-if="column.dataIndex === 'status'">
              <a-tag :class="['status-tag', text]">{{ statusText(text) }}</a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <template v-if="record.status === 'draft'">
                <a class="prototype-op blue" @click="openEdit(record)">编辑</a>
                <a class="prototype-op red" @click="onDelete(record)">删除</a>
              </template>
              <template v-else-if="record.status === 'pending'">
                <a class="prototype-op blue" @click="openView(record)">查看</a>
                <a class="prototype-op green" @click="approve(record)">审核</a>
                <a class="prototype-op blue" @click="recall(record)">撤回</a>
              </template>
              <template v-else-if="record.status === 'pass'">
                <a class="prototype-op blue" @click="openView(record)">查看</a>
                <a class="prototype-op blue" @click="print(record)">打印</a>
              </template>
              <template v-else>
                <a class="prototype-op blue" @click="openView(record)">查看</a>
                <a class="prototype-op blue" @click="resubmit(record)">重新提交</a>
              </template>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 弹窗：2 列网格表单（对齐原型 .modal-body） -->
    <a-modal
      v-model:open="modalVisible"
      :title="editing.id ? '编辑供应商准入申请' : '新增供应商准入申请'"
      :confirm-loading="saving"
      @ok="onSave">
      <a-form ref="form" :model="editing" :rules="rules" layout="vertical">
        <div class="prototype-modal-form">
          <a-form-item label="供应商名称" name="name">
            <a-input v-model:value="editing.name" placeholder="请输入供应商名称" />
          </a-form-item>
          <a-form-item label="统一社会信用代码" name="code">
            <a-input v-model:value="editing.code" placeholder="请输入统一社会信用代码" />
          </a-form-item>
          <a-form-item label="申请类型" name="type">
            <a-select v-model:value="editing.type" placeholder="请选择">
              <a-select-option v-for="t in typeOptions" :key="t" :value="t">{{ t }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="提交人" name="person">
            <a-input v-model:value="editing.person" placeholder="请输入提交人" />
          </a-form-item>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { queryBmsp01, countByStatus, saveBmsp01, deleteBmsp01 } from './bmsp01Api'

const STATUS_TEXT = { draft: '草稿', pending: '待审核', pass: '已通过', reject: '已驳回' }

export default {
  name: 'BMSP01',
  data() {
    return {
      loading: false,
      saving: false,
      rows: [],
      counts: {},
      filter: { status: 'all', no: '', name: '', type: undefined, dateRange: [] },
      typeOptions: ['新增准入', '信息变更', '续签延期'],
      statList: [
        { key: 'all', label: '全部', color: '' },
        { key: 'draft', label: '草稿', color: '#8c8c8c' },
        { key: 'pending', label: '待审核', color: '#1677ff' },
        { key: 'pass', label: '已通过', color: '#389e0d' },
        { key: 'reject', label: '已驳回', color: '#cf1322' }
      ],
      selectedRowKeys: [],
      pagination: { current: 1, pageSize: 20, total: 0, showTotal: t => `共 ${t} 条` },
      modalVisible: false,
      editing: {},
      rules: {
        name: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }]
      },
      columns: [
        { title: '序号', key: 'idx', width: 60, align: 'left', customRender: ({ index }) => index + 1 },
        { title: '申请单号', dataIndex: 'no', align: 'left', width: 140 },
        { title: '供应商名称', dataIndex: 'name', align: 'left', width: 180 },
        { title: '统一社会信用代码', dataIndex: 'code', align: 'left', width: 170 },
        { title: '申请类型', dataIndex: 'type', align: 'left', width: 100 },
        { title: '申请状态', dataIndex: 'status', align: 'left', width: 100 },
        { title: '提交人', dataIndex: 'person', align: 'left', width: 90 },
        { title: '提交时间', dataIndex: 'time', align: 'left', width: 110 },
        { title: '操作', key: 'action', align: 'left', width: 160 }
      ]
    }
  },
  created() {
    this.fetch()
    this.loadCounts()
  },
  methods: {
    statusText(s) { return STATUS_TEXT[s] || s },
    async fetch() {
      this.loading = true
      try {
        const { current, pageSize } = this.pagination
        const { rows, count } = await queryBmsp01({
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
      this.filter = { status: 'all', no: '', name: '', type: undefined, dateRange: [] }
      this.onSearch()
    },
    onStatusChange(key) { this.filter.status = key; this.onSearch() },
    onTableChange(pagination) {
      this.pagination.current = pagination.current
      this.pagination.pageSize = pagination.pageSize
      this.fetch()
    },
    openAdd() { this.editing = { type: '新增准入' }; this.modalVisible = true },
    openEdit(record) { this.editing = { ...record }; this.modalVisible = true },
    openView(record) { this.$message.info('查看：' + record.no) },
    async onSave() {
      try {
        await this.$refs.form.validate()
      } catch (e) {
        return
      }
      this.saving = true
      try {
        await saveBmsp01(this.editing)
        this.$message.success('已保存')
        this.modalVisible = false
        this.fetch()
      } finally {
        this.saving = false
      }
    },
    onDelete(record) {
      this.$confirm({
        title: '确认删除？',
        onOk: async () => { await deleteBmsp01(record.id); this.$message.success('已删除'); this.fetch() }
      })
    },
    goDetail() { this.$router.push('/BMSP02') },  // BMSP02 为占位详情页，未注册 menu
    // 自定义业务动作：待实现桩（点了有反应）
    approve() { this.$message.info('「审核」功能待实现') },
    recall() { this.$message.info('「撤回」功能待实现') },
    print() { this.$message.info('「打印」功能待实现') },
    resubmit() { this.$message.info('「重新提交」功能待实现') },
    batchExport() { this.$message.info('「批量导出」功能待实现') },
    batchApprove() { this.checkSel() && this.$message.info(`批量审批 ${this.selectedRowKeys.length} 项（待实现）`) },
    batchSubmit() { this.checkSel() && this.$message.info(`批量提交 ${this.selectedRowKeys.length} 项（待实现）`) },
    batchDelete() { this.checkSel() && this.$message.info(`批量删除 ${this.selectedRowKeys.length} 项（待实现）`) },
    checkSel() {
      if (!this.selectedRowKeys.length) { this.$message.warning('请先勾选数据'); return false }
      return true
    }
  }
}
</script>

<style lang="scss" scoped>
// 页面无需自带样式：布局/卡片/查询网格/表格/标签/操作链接全部来自 prototype-parity.scss 的 prototype-* 公用类。
// 仅留一处与原型一致的操作链接间距微调。
.prototype-op + .prototype-op {
  margin-left: 6px;
}
</style>
