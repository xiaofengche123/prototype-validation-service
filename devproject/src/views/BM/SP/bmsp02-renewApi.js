export const SUPPLIER_OPTIONS = [
  '广西铝业科技有限公司',
  '柳州鑫源物流有限公司',
  '桂林绿能环保科技有限公司',
  '北海宏泰化工原料有限公司',
  '南宁安达运输服务有限公司'
]

export const TYPE_OPTIONS = ['营业执照', '危废经营许可证', '道路运输许可证', '安全生产许可证']

const CERT_MAP = {
  '广西铝业科技有限公司|营业执照': { no: '91450100MA5KAXXXXX', expire: '2028-03-15' },
  '广西铝业科技有限公司|危废经营许可证': { no: 'GXWF2024-0012', expire: '2026-08-10' },
  '广西铝业科技有限公司|道路运输许可证': { no: '桂交运管许可南字12345号', expire: '2026-07-05' },
  '柳州鑫源物流有限公司|道路运输许可证': { no: '桂交运管许可柳字67890号', expire: '2025-12-20' },
  '柳州鑫源物流有限公司|安全生产许可证': { no: '（桂）FM安许证字〔2023〕0078', expire: '2026-09-30' },
  '桂林绿能环保科技有限公司|危废经营许可证': { no: 'GXWF2023-0089', expire: '2026-05-01' },
  '桂林绿能环保科技有限公司|营业执照': { no: '91450300MA5P2XXXXX', expire: '2027-11-08' },
  '北海宏泰化工原料有限公司|安全生产许可证': { no: '（桂）FM安许证字〔2024〕0112', expire: '2026-06-10' },
  '北海宏泰化工原料有限公司|营业执照': { no: '91450500MA5R3XXXXX', expire: '2025-08-18' },
  '南宁安达运输服务有限公司|道路运输许可证': { no: '桂交运管许可南字55678号', expire: '2027-02-28' }
}

export function getCertInfo(supplier, type) {
  return CERT_MAP[`${supplier}|${type}`] || { no: '', expire: '' }
}

export async function submitRenew(data) {
  return { success: true, data }
}

export async function saveDraft(data) {
  return { success: true, data }
}

export default { SUPPLIER_OPTIONS, TYPE_OPTIONS, getCertInfo, submitRenew, saveDraft }
