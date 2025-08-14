import { serviceCreate } from '@/utils/request'

// 封装每个后端项目的api
const mmsAPI = serviceCreate(
  {
    // url = base url + request url
    baseURL: process.env.VUE_APP_BASE_API,
    // request timeout
    timeout: 5000
  }
)

export function getData(url) {
  return mmsAPI.get(url)
}
export function delData(url) {
  return mmsAPI.delete(url)
}
export function postData(url, data) {
  return mmsAPI.post(url, data)
}
export function putData(url, data) {
  return mmsAPI.put(url, data)
}
