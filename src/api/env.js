import { delData, getData, postData, putData } from './api'

export function fetchList() {
  return getData('/api/env/allEnv')
}
export function allEnableEnv() {
  return getData('/api/env/allEnableEnv')
}
export function addEnv(data) {
  return postData('/api/env/add', data)
}

// status 要更新成哪个状态
export function updateStatus(id, status) {
  return putData(`/api/env/updateStatus/${id}`, { status: status })
}

export function del(id) {
  return delData(`/api/env/del/${id}`)
}
export function updateEnv(id, data) {
  return putData(`/api/env/update/${id}`, data)
}

/**
 * 环境-主机-服务
 * @returns data=[[envId, envName, [id, name, [id, name]]]]
 */
export function listServer() {
  return getData('/api/env/listServer')
}
/**
 * 给环境绑定/换绑zk
 * @param envId 给哪个服务绑定zk
 * @param zkId zk服务的id
 * @returns {AxiosPromise<any>}
 */
export function envBindZk(envId, data) {
  return putData(`/api/env/updateDataSource/${envId}`, data)
}
