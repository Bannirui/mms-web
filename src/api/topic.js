import { getData, postData } from './api'

export function fetchList(page, size, topicName, userId) {
  const params = new URLSearchParams({ page, size })
  // 只有非空字符串才加
  if (topicName) params.append('topicName', topicName)
  // 过滤 null 和 undefined
  if (userId != null) params.append('userId', userId)
  return getData(`/api/topic/querypage?${params.toString()}`)
}

export function createTopic(data) {
  return postData('/api/topic/add', data)
}
