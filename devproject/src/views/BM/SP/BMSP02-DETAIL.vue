<template>
  <div class="prototype-page has-fixed-actions">
    <!-- 供应商基本信息 -->
    <div class="prototype-card">
      <div class="prototype-card-head">
        <div class="prototype-title">供应商基本信息</div>
        <div class="prototype-actions">
          <a-tag :class="['status-tag', supplier.status]">{{ statusText(supplier.status) }}</a-tag>
        </div>
      </div>
      <div class="prototype-query-grid" style="padding-bottom:8px">
        <div class="prototype-field"><label>供应商名称</label><div>{{ supplier.name }}</div></div>
        <div class="prototype-field"><label>统一社会信用代码</label><div>{{ supplier.code }}</div></div>
        <div class="prototype-field"><label>联系人</label><div>{{ supplier.contact }}</div></div>
        <div class="prototype-field"><label>联系电话</label><div>{{ supplier.phone }}</div></div>
        <div class="prototype-field"><label>所属行业</label><div>{{ supplier.industry }}</div></div>
        <div class="prototype-field"><label>注册地址</label><div>{{ supplier.address }}</div></div>
      </div>
    </div>

    <!-- 证照列表 -->
    <div class="prototype-card prototype-list-card">
      <div class="prototype-list-toolbar">
        <div class="prototype-title">证照清单</div>
        <div class="prototype-actions">
          <a-button size="small" @click="refresh">刷新</a-button>
        </div>
      </div>
      <div class="prototype-table-wrap prototype-table">
        <a-table
          :columns="certColumns"
          :data-source="certs"
          :loading="loading"
          :pagination="false"
          :scroll="{ x: 900 }"
          row-key="id"
          size="middle">
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'status'">
              <a-tag :class="['status-tag', statusMap[text].cls]">{{ statusMap[text].text }}</a-tag>
            </template>
            <template v-else-if="column.key === 'scan'">
              <a class="prototype-op blue" @click="viewScan(record)">查看</a>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 历史续期记录 -->
    <div class="prototype-card">
      <div class="prototype-card-head">
        <div class="prototype-title">历史续期记录</div>
      </div>
      <div class="prototype-table-wrap prototype-table fit-table">
        <a-table
          :columns="historyColumns"
          :data-source="history"
          :pagination="false"
          row-key="id"
          size="middle">
          <template #bodyCell="{ column, text }">
            <template v-if="column.dataIndex === 'memo'">
              <span style="text-align:left;display:block;">{{ text }}</span>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 底部固定操作栏 -->
    <div class="fixed-bottom-bar between">
      <a-button @click="goBack">← 返回列表</a-button>
      <a-button type="primary" @click="printDetail">打印</a-button>
    </div>
  </div>
</template>

<script>
import { getSupplier, getCerts, getHistory } from './bmsp02-detailApi'
import { STATUS_MAP } from './bmsp02Api'

const STATUS_TEXT = { valid: '有效', warning: '即将到期', expired: '已过期' }

export default {
  name: 'BMSP02-DETAIL',
  data() {
    return {
      loading: false,
      supplier: {},
      certs: [],
      history: [],
      statusMap: STATUS_MAP,
      certColumns: [
        { title: '序号', key: 'idx', width: 50, align: 'center', customRender: ({ index }) => index + 1 },
        { title: '证照类型', dataIndex: 'type', align: 'center', width: 140 },
        { title: '证号', dataIndex: 'no', align: 'center', width: 190 },
        { title: '发证机关', dataIndex: 'org', align: 'center', width: 140 },
        { title: '有效期', dataIndex: 'expire', align: 'center', width: 110 },
        { title: '状态', dataIndex: 'status', align: 'center', width: 90 },
        { title: '扫描件', key: 'scan', align: 'center', width: 80 }
      ],
      historyColumns: [
        { title: '序号', key: 'idx', width: 50, align: 'center', customRender: ({ index }) => index + 1 },
        { title: '日期', dataIndex: 'date', align: 'center', width: 110 },
        { title: '操作人', dataIndex: 'user', align: 'center', width: 120 },
        { title: '动作', dataIndex: 'action', align: 'center', width: 80 },
        { title: '备注', dataIndex: 'memo', align: 'left' }
      ]
    }
  },
  created() {
    this.load()
  },
  methods: {
    statusText(s) { return STATUS_TEXT[s] || s },
    async load() {
      this.loading = true
      try {
        const [supplier, certs, history] = await Promise.all([getSupplier(), getCerts(), getHistory()])
        this.supplier = supplier
        this.certs = certs
        this.history = history.map((h, i) => ({ ...h, id: i }))
      } finally {
        this.loading = false
      }
    },
    refresh() { this.$message.info('已刷新'); this.load() },
    viewScan(record) { this.$message.info(`查看「${record.type}」扫描件（占位）`) },
    goBack() { this.$router.push('/BMSP02') },
    printDetail() { this.$message.info('打印供应商证照详情（占位）') }
  }
}
</script>

<style lang="scss" scoped>
.prototype-op + .prototype-op {
  margin-left: 6px;
}
</style>
