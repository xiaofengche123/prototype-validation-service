<template>
  <div class="prototype-page">
    <!-- 预警统计卡片 -->
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
        <div class="prototype-title">筛选条件</div>
        <div class="prototype-actions">
          <a-button @click="onReset">重置</a-button>
          <a-button type="primary" @click="onSearch">查询</a-button>
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

    <!-- 到期预警清单 -->
    <div class="prototype-card prototype-list-card">
      <div class="prototype-list-toolbar">
        <div class="prototype-title">到期预警清单</div>
        <div class="prototype-actions">
          <a-button size="small" @click="batchExport">导出预警清单</a-button>
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
            <template v-else-if="column.dataIndex === 'remain'">
              {{ record.status === 'expired' ? '已过期 ' + Math.abs(record.remain) + ' 天' : record.remain + ' 天' }}
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
  </div>
</template>

<script>
import { queryBmsp02Alert, countByStatus, STATUS_MAP, TYPE_OPTIONS } from './bmsp02-alertApi'

export default {
  name: 'BMSP02-ALERT',
  data() {
    return {
      loading: false,
      rows: [],
      counts: {},
      filter: { status: 'all', name: '', type: undefined },
      typeOptions: TYPE_OPTIONS,
      statusMap: STATUS_MAP,
      statList: [
        { key: 'all', label: '全部预警', color: '' },
        { key: 'danger30', label: '30 天内到期', color: '#e53935' },
        { key: 'warning90', label: '31-90 天到期', color: '#fb8c00' },
        { key: 'expired', label: '已过期', color: '#c62828' }
      ],
      pagination: { current: 1, pageSize: 10, total: 0, showTotal: t => `共 ${t} 条` },
      columns: [
        { title: '序号', key: 'idx', width: 50, align: 'center', customRender: ({ index }) => index + 1 },
        { title: '供应商', dataIndex: 'supplier', align: 'center', width: 180 },
        { title: '证照类型', dataIndex: 'type', align: 'center', width: 140 },
        { title: '证号', dataIndex: 'no', align: 'center', width: 190 },
        { title: '有效期', dataIndex: 'expire', align: 'center', width: 110 },
        { title: '剩余天数', dataIndex: 'remain', align: 'center', width: 100 },
        { title: '状态', dataIndex: 'status', align: 'center', width: 100 },
        { title: '操作', key: 'action', align: 'center', width: 130 }
      ]
    }
  },
  created() {
    this.fetch()
    this.loadCounts()
  },
  methods: {
    async fetch() {
      this.loading = true
      try {
        const { current, pageSize } = this.pagination
        const { rows, count } = await queryBmsp02Alert({
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
    openRenew(record) { this.$message.info(`打开「${record.supplier} - ${record.type}」续期登记（占位）`) },
    batchExport() { this.$message.info('已导出预警证照清单') }
  }
}
</script>

<style lang="scss" scoped>
.prototype-op + .prototype-op {
  margin-left: 6px;
}
</style>
