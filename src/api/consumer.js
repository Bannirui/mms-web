import { getData, postData, putData } from './api'

/**
 * consumer的相关信息
 * @param page 页码
 * @param size 页容
 * @param consumerName 要不要过滤consumer name
 * @param userId 要不要过滤用户id
 * return
 * private Long consumerId;
 * private String consumerName;
 * private Long consumerUserId;
 * private String consumerUserName;
 * private Long consumerAppId;
 * private String consumerAppName;
 * private Integer consumerStatus;
 * private String consumerRemark;
 * private Long topicId;
 * private Long topicName;
 * private List<EnvExtDTO> consumerEnvs;
 *     envs: [
 *       {
 *         envId,
 *         envName
 *       }
 *     ]
 */
export function pageList(page, size, consumerName, userId) {
  const params = new URLSearchParams({ page, size })
  // 只有非空字符串才加
  if (consumerName) params.append('consumerName', consumerName)
  // 过滤null和undefined
  if (userId != null) params.append('userId', userId)
  return getData(`/api/consumer/pageList?${params.toString()}`)
}

/**
 * 申请consumer
 * @param data {name,userId,appId,topicId,remark}
 * @returns {consumerId,consumerEnvs:[{envId,envName}]}
 */
export function createConsumer(data) {
  return postData('/api/consumer/add', data)
}
/**
 * 审批consumer
 * @param consumerId
 */
export function approveConsumer(consumerId) {
  return putData(`/api/consumer/${consumerId}/approve`)
}
