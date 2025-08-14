import { serviceCreate } from '@/utils/request'

// 封装每个后端项目的api
const mmsAPI = serviceCreate(
  {
    // url = base url + request url
    baseURL: process.env.VUE_APP_BASE_API,
    // request timeout
    timeout: 5000,
    // 默认表单提交
    useJson: false
  }
)

export function getData(url, params) {
  return mmsAPI.get(url, { params })
}
export function delData(url, params) {
  return mmsAPI.delete(url, { params })
}
// post表单
export function postDataForm(url, params) {
  return mmsAPI.post(url, params)
}
// post json
export function postDataJson(url, params) {
  return mmsAPI.post(url, params, { useJson: true })
}
// put表单
export function putDataForm(url, params) {
  return mmsAPI.put(url, params, {})
}
// put json
export function putDataJson(url, params) {
  return mmsAPI.put(url, params, { useJson: true })
}
