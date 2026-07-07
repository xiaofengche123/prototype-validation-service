import dayjs from 'dayjs'

export const TODAY = '2026-06-26'

export function computeStatus(expire) {
  const diff = dayjs(expire).diff(dayjs(TODAY), 'day')
  if (diff < 0) return 'expired'
  if (diff <= 90) return 'warning'
  return 'valid'
}

export const STATUS_MAP = {
  valid: { cls: 'pass', text: '有效' },
  warning: { cls: 'pending', text: '即将到期' },
  expired: { cls: 'reject', text: '已过期' }
}

export const TYPE_OPTIONS = ['营业执照', '危废经营许可证', '道路运输许可证', '安全生产许可证']

let MOCK_DATA = [
  { id: 1, supplier: '广西铝业科技有限公司', type: '营业执照', no: '91450100MA5KAXXXXX', org: '南宁市行政审批局', expire: '2028-03-15' },
  { id: 2, supplier: '广西铝业科技有限公司', type: '危废经营许可证', no: 'GXWF2024-0012', org: '自治区生态环境厅', expire: '2026-08-10' },
  { id: 3, supplier: '广西铝业科技有限公司', type: '道路运输许可证', no: '桂交运管许可南字12345号', org: '南宁市交通运输局', expire: '2026-07-05' },
  { id: 4, supplier: '柳州鑫源物流有限公司', type: '道路运输许可证', no: '桂交运管许可柳字67890号', org: '柳州市交通运输局', expire: '2025-12-20' },
  { id: 5, supplier: '柳州鑫源物流有限公司', type: '安全生产许可证', no: '（桂）FM安许证字〔2023〕0078', org: '自治区应急管理厅', expire: '2026-09-30' },
  { id: 6, supplier: '桂林绿能环保科技有限公司', type: '危废经营许可证', no: 'GXWF2023-0089', org: '自治区生态环境厅', expire: '2026-05-01' },
  { id: 7, supplier: '桂林绿能环保科技有限公司', type: '营业执照', no: '91450300MA5P2XXXXX', org: '桂林市市场监管局', expire: '2027-11-08' },
  { id: 8, supplier: '北海宏泰化工原料有限公司', type: '安全生产许可证', no: '（桂）FM安许证字〔2024〕0112', org: '自治区应急管理厅', expire: '2026-06-10' },
  { id: 9, supplier: '北海宏泰化工原料有限公司', type: '营业执照', no: '91450500MA5R3XXXXX', org: '北海市行政审批局', expire: '2025-08-18' },
  { id: 10, supplier: '南宁安达运输服务有限公司', type: '道路运输许可证', no: '桂交运管许可南字55678号', org: '南宁市交通运输局', expire: '2027-02-28' }
].map(d => { d.status = computeStatus(d.expire); return d })

export async function queryBmsp02({ filter = {}, offset = 0, limit = 20 } = {}) {
  let list = [...MOCK_DATA]
  if (filter.status && filter.status !== 'all') list = list.filter(d => d.status === filter.status)
  if (filter.name) list = list.filter(d => d.supplier.includes(filter.name))
  if (filter.type) list = list.filter(d => d.type === filter.type)
  return { rows: list.slice(offset, offset + limit), count: list.length }
}

export async function countByStatus() {
  const c = { all: MOCK_DATA.length, valid: 0, warning: 0, expired: 0 }
  MOCK_DATA.forEach(d => { c[d.status] = (c[d.status] || 0) + 1 })
  return c
}

export async function saveAdd(record) {
  const id = MOCK_DATA.length ? Math.max(...MOCK_DATA.map(d => d.id)) + 1 : 1
  MOCK_DATA.push({ ...record, id, status: computeStatus(record.expire) })
  return { success: true, id }
}

export async function saveRenew({ id, expire }) {
  const row = MOCK_DATA.find(d => d.id === id)
  if (row) {
    row.expire = expire
    row.status = computeStatus(expire)
  }
  return { success: true, id }
}

export async function getDetailCerts() {
  return MOCK_DATA.filter(d => d.supplier === '广西铝业科技有限公司')
}

export default { queryBmsp02, countByStatus, saveAdd, saveRenew, computeStatus, STATUS_MAP, TYPE_OPTIONS, getDetailCerts }
