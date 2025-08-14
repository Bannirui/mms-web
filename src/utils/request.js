import axios from 'axios'
import buildURL from 'axios/lib/helpers/buildURL'
import { merge } from 'axios/lib/utils'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// 判断参数是不是对象
function isPlainObj(data) {
  return data && data.constructor.name === 'Object'
}

// request interceptor
const reqInterceptors = [
  config => {
    // do something before request is sent
    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['X-Token'] = getToken()
    }
    // 表单提交还是json提交
    const isJson = config.useJson === true
    if (!isJson && isPlainObj(config.data)) {
      // 转成form data
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      config.data = buildURL('', config.data).substr(1)
    } else if (isJson) {
      config.headers['Content-Type'] = 'application/json'
    }
    return config
  }
]

const respInterceptors = [
  response => {
    const res = response.data
    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 20000) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      // 直接返回data部分 避免调用方再解构
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
]

// create an axios instance
const serviceCreate = config => {
  const service = axios.create(merge({}, config))
  service.interceptors.request.use(...reqInterceptors)
  service.interceptors.response.use(...respInterceptors)
  return service
}
serviceCreate()
export { serviceCreate, merge }
