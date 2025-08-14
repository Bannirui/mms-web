import { delData, getData, postData, putData } from './api'

export function fetchList() {
  return getData('/api/env/allEnv')
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
