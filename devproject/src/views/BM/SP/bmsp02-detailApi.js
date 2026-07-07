import { computeStatus, STATUS_MAP } from './bmsp02Api'

export const TODAY = '2026-06-26'

export async function getSupplier() {
  return {
    name: '广西铝业科技有限公司',
    code: '91450100MA5KAXXXXX',
    contact: '张建国',
    phone: '13800138001',
    industry: '有色金属冶炼及压延加工',
    address: '广西南宁市良庆区五象大道 101 号',
    status: 'valid'
  }
}

export async function getCerts() {
  const certs = [
    { id: 1, type: '营业执照', no: '91450100MA5KAXXXXX', org: '南宁市行政审批局', expire: '2028-03-15' },
    { id: 2, type: '危废经营许可证', no: 'GXWF2024-0012', org: '自治区生态环境厅', expire: '2026-08-10' },
    { id: 3, type: '道路运输许可证', no: '桂交运管许可南字12345号', org: '南宁市交通运输局', expire: '2026-07-05' }
  ].map(d => { d.status = computeStatus(d.expire); return d })
  return certs
}

export async function getHistory() {
  return [
    { date: '2025-03-10', user: '管理员-李婷', action: '续期', memo: '营业执照续期，有效期延至 2028-03-15' },
    { date: '2024-08-12', user: '管理员-王强', action: '续期', memo: '危废经营许可证续期，有效期延至 2026-08-10' },
    { date: '2024-06-20', user: '管理员-李婷', action: '新领', memo: '首次申领道路运输许可证' },
    { date: '2023-05-08', user: '管理员-王强', action: '新领', memo: '首次申领危废经营许可证' }
  ]
}

export default { getSupplier, getCerts, getHistory, STATUS_MAP }
