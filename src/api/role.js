import { delData, getData, postData, putData } from './api'

export function getRoutes() {
  return getData('/vue-element-admin/routes')
}

export function getRoles() {
  return getData('/vue-element-admin/roles')
}

export function addRole(data) {
  return postData('/vue-element-admin/role', data)
}

export function updateRole(id, data) {
  return putData(`/vue-element-admin/role/${id}`, data)
}

export function deleteRole(id) {
  return delData(`/vue-element-admin/role/${id}`)
}
