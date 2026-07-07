import dayjs from 'dayjs'

export const TODAY = '2026-06-26'

export function computeRemain(expire) {
  const diff = dayjs(expire).diff(dayjs(TODAY), 'day')
  if (diff < 0) return { status: 'expired', days: diff }
  if (diff <= 30) return { status: 'danger30', days: diff }
  if (diff <= 90) return { status: 'warning90', days: diff }
  return { status: 'normal', days: diff }
}

export const STATUS_MAP = {
  danger30: { cls: 'reject', text: '30天内到期' },
  warning90: { cls: 'pending', text: '31-90天到期' },
  expired: { cls: 'reject', text: '已过期' }
}

export const TYPE_OPTIONS = ['营业执照', '危废经营许可证', '道路运输许可证', '安全生产许可证']

const MOCK_DATA = [
  { id: 1, supplier: '广西铝业科技有限公司', type: '道路运输许可证', no: '桂交运管许可南字12345号', expire: '2026-07-05' },
  { id: 2, supplier: '北海宏泰化工原料有限公司', type: '安全生产许可证', no: '（桂）FM安许证字〔2024〕0112', expire: '2026-06-10' },
  { id: 3, supplier: '桂林绿能环保科技有限公司', type: '危废经营许可证', no: 'GXWF2023-0089', expire: '2026-05-01' },
  { id: 4, supplier: '广西铝业科技有限公司', type: '危废经营许可证', no: 'GXWF2024-0012', expire: '2026-08-10' },
  { id: 5, supplier: '柳州鑫源物流有限公司', type: '道路运输许可证', no: '桂交运管许可柳字67890号', expire: '2025-12-20' },
  { id: 6, supplier: '北海宏泰化工原料有限公司', type: '营业执照', no: '91450500MA5R3XXXXX', expire: '2025-08-18' }
].map(d => {
  const r = computeRemain(d.expire)
  d.status = r.status
  d.remain = r.days
  return d
})

export async function queryBmsp02Alert({ filter = {}, offset = 0, limit = 20 } = {}) {
  let list = [...MOCK_DATA]
  if (filter.status && filter.status !== 'all') list = list.filter(d => d.status === filter.status)
  if (filter.name) list = list.filter(d => d.supplier.includes(filter.name))
  if (filter.type) list = list.filter(d => d.type === filter.type)
  return { rows: list.slice(offset, offset + limit), count: list.length }
}

export async function countByStatus() {
  const c = { all: MOCK_DATA.length, danger30: 0, warning90: 0, expired: 0 }
  MOCK_DATA.forEach(d => { c[d.status] = (c[d.status] || 0) + 1 })
  return c
}

export default { queryBmsp02Alert, countByStatus, computeRemain, STATUS_MAP, TYPE_OPTIONS }
