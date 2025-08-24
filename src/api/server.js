import { getData, postData } from './api'

// 主机上服务
// data {name, type, port, status}
// return 数据库id
export function addServer(hostId, data) {
  return postData(`/api/server/add/${hostId}`, data)
}

/**
 * 服务实例
 * @serverType 服务器类型
 * @returns [serverId, serverName, serverPort, hostId, hostName, hostHost, envId, envName]
 */
export function getServer8Type(serverType) {
  return getData(`/api/server/${serverType}`)
}
