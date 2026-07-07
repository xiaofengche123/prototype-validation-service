import dayjs from 'dayjs'

const NAMES = ['华信电气设备', '广西铝模科技', '南方智能装备', '中铝物流运输', '桂海建筑工程', '鼎盛矿业技术', '云岭信息服务', '恒通钢材贸易']
const TYPES = ['新增准入', '信息变更', '续签延期']
const POOL = ['draft', 'pending', 'pending', 'pass', 'pass', 'pass', 'reject']
const PERSONS = ['张伟', '李娜', '王芳', '刘洋', '陈静']

const MOCK_DATA = []
for (let i = 1; i <= 128; i++) {
  const status = POOL[i % POOL.length]
  MOCK_DATA.push({
    id: i,
    no: 'ZRSQ2024' + (10000 + i),
    name: NAMES[i % NAMES.length] + '有限公司',
    code: '91450' + (100000000000 + i),
    type: TYPES[i % TYPES.length],
    status,
    person: PERSONS[i % PERSONS.length],
    time: '2024-05-' + String(1 + (i % 21)).padStart(2, '0')
  })
}

export async function queryBmsp01({ filter = {}, offset = 0, limit = 20 } = {}) {
  let list = [...MOCK_DATA]
  if (filter.status && filter.status !== 'all') list = list.filter(d => d.status === filter.status)
  if (filter.no) list = list.filter(d => d.no.includes(filter.no))
  if (filter.name) list = list.filter(d => d.name.includes(filter.name))
  if (filter.type) list = list.filter(d => d.type === filter.type)
  if (filter.dateRange && filter.dateRange.length === 2) {
    const start = dayjs(filter.dateRange[0]).format('YYYY-MM-DD')
    const end = dayjs(filter.dateRange[1]).format('YYYY-MM-DD')
    list = list.filter(d => d.time >= start && d.time <= end)
  }
  return { rows: list.slice(offset, offset + limit), count: list.length }
}

export async function countByStatus() {
  const c = { all: MOCK_DATA.length, draft: 0, pending: 0, pass: 0, reject: 0 }
  MOCK_DATA.forEach(d => { c[d.status] = (c[d.status] || 0) + 1 })
  return c
}

export async function saveBmsp01(record) {
  return { success: true, data: record }
}

export async function deleteBmsp01(id) {
  return { success: true, id }
}

export default { queryBmsp01, countByStatus, saveBmsp01, deleteBmsp01 }
