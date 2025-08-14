import { getData, postData } from './api'

export function login(data) {
  return postData('/api/user/login', data)
}

// token值
export function getInfo(token) {
  return getData(`/api/user/info/${token}`)
}

export function logout() {
  return postData('/api/user/logout')
}
