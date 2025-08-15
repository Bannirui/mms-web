import { getData, postData } from './api'

export function fetchList(page, size) {
  return getData(`/api/topic/querypage?page=${page}&size=${size}`)
}

export function createTopic(data) {
  return postData('/api/topic/add', data)
}
