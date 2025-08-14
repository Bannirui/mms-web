import { getData, postDataJson, putDataJson } from './api'

export function fetchList(query) {
  return getData('/api/env/allEnv', query)
}

export function addEnv(data) {
  return postDataJson('/api/env/add', data)
}

export function updateStatus(id, status) {
  return putDataJson(`/api/env/updateStatus/${id}`, { status: status })
}

export function del(id) {
  return putDataJson(`/api/env/del/${id}`)
}
