import { postData } from './api'

// 主机上服务
// data {name, type, port, status}
// return 数据库id
export function addServer(hostId, data) {
  return postData(`/api/server/add/${hostId}`, data)
}
