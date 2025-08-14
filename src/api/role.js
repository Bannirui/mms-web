import { delData, getData, postDataForm, putDataForm } from './api'

export function getRoutes() {
  return getData('/vue-element-admin/routes')
}

export function getRoles() {
  return getData('/vue-element-admin/roles')
}

export function addRole(data) {
  return postDataForm('/vue-element-admin/role', data)
}

export function updateRole(id, data) {
  return putDataForm(`/vue-element-admin/role/${id}`, data)
}

export function deleteRole(id) {
  return delData(`/vue-element-admin/role/${id}`)
}
