import {getData, postData, putData} from './api'

/**
 * topic的相关信息
 * @param page 页码
 * @param size 页容
 * @param topicName 要不要过滤topic name
 * @param userId 要不要过滤用户id
 * return
 * {
 *   total,
 *   data: [
 *   {
 *     topicId,
 *     topicName,
 *     topicType,
 *     topicStatus,
 *     topicTps,
 *     topicMsgSz,
 *     topicPartitions,
 *     topicReplication,
 *     topicRemark,
 *     userId,
 *     userName,
 *     appId,
 *     appName,
 *     envs: [
 *       {
 *         envId,
 *         envName
 *       }
 *     ]
 *   }
 *   ]
 * }
 */
export function fetchList(page, size, topicName, userId) {
  const params = new URLSearchParams({ page, size })
  // 只有非空字符串才加
  if (topicName) params.append('topicName', topicName)
  // 过滤 null 和 undefined
  if (userId != null) params.append('userId', userId)
  return getData(`/api/topic/querypage?${params.toString()}`)
}

/**
 * 申请topic
 * @returns topic的id
 */
export function createTopic(data) {
  return postData('/api/topic/add', data)
}
/**
 * 审批topic
 */
export function approveTopic(topicId, data) {
  return putData(`/api/topic/${topicId}/approve`, data)
}
