import axios from 'axios'
import store from '@/store'
import config from '@/config'
import { getToken } from '@/libs/util'
import { Message } from 'iview'

const baseUrl = process.env.NODE_ENV === 'development' ? config.baseUrl.dev : config.baseUrl.pro

/**
 * 收集错误,把错误请求发往后端
 */
const addErrorLog = error => {
  const { statusText, status, request: { responseURL } } = error
  let info = {
    type: 'ajax',
    code: status,
    msg: statusText,
    url: responseURL
  }
  console.log(responseURL)
  if (!responseURL.includes('logger/api')) store.dispatch('addErrorLog', info)
}

const service = axios.create({
  baseURL: baseUrl, // api的base_url
  timeout: 5000 // 请求超时时间
})
/**
 * 请求参数处理
 */
service.interceptors.request.use((config) => {
  /** 暂没有解决
  config.headers['Content-Type'] = 'multipart/form-data'
  config.headers['charset'] = 'utf-8'
  config.headers['boundary'] = Math.random().toString().substr(2)
  **/
  if (getToken()) {
    config.headers['Authorization'] = 'Bearer ' + getToken()
  }
  return config
})
/**
 * 响应结果处理
 */
service.interceptors.response.use(
  (response) => {
    if (response.data.code === 200 || response.data.code === 0) { // 编号为200 0才认定为成功
      return Promise.resolve(response.data)
    } else {
      Message.error({ content: response.data.msg })
      return Promise.reject(response.data)
    }
  }, error => {
    // 错误记录
    if (typeof (error.response) === 'undefined') { // 超时的时候不会有error.response,该记录不发往后端统计
      Message.error({ content: '连接服务器失败' })
      return Promise.reject(new Error('连接服务器失败'))
    }
    let errorInfo = error.response
    if (error.response.status === 401) {
      location.reload()
    }
    if (!errorInfo) {
      const { request: { statusText, status }, config } = JSON.parse(JSON.stringify(error))
      errorInfo = {
        statusText,
        status,
        request: { responseURL: config.url }
      }
    }
    addErrorLog(errorInfo)
    // 错误拦截
    let message = ''
    if (error && error.response) {
      Message.error({ content: message })
      // 请求错误处理
      return Promise.reject(error)
    } else {
      message = '连接服务器失败'
      Message.error({ content: message })
      return Promise.reject(error)
    }
  }
)

export default service
