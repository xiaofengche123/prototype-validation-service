export const INDUSTRY_OPTIONS = ['有色金属冶炼', '物流运输', '环保科技', '化工原料', '机械制造']

export const LEVEL_OPTIONS = ['一级', '二级', '三级']

export async function submitApply(data) {
  return { success: true, data }
}

export async function saveDraft(data) {
  return { success: true, data }
}

export default { INDUSTRY_OPTIONS, LEVEL_OPTIONS, submitApply, saveDraft }
