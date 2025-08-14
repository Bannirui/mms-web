import { getData, postDataJson } from './api'

export function login(data) {
  return postDataJson('/vue-element-admin/user/login', data)
}

// token值
export function getInfo(token) {
  return getData('/vue-element-admin/user/info', { 'token': token })
}

export function logout() {
  return postDataJson('/vue-element-admin/user/logout')
}
