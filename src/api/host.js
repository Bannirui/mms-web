import { delData, getData, postData, putData } from './api'

// 向关联环境添加主机
export function addHost(envId, data) {
  return postData(`/api/host/add/${envId}`, data)
}
