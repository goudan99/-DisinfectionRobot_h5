import request from '@/libs/request'

export const saveErrorLogger = info => {
  return request({
    url: 'system/logger/api',
    data: info,
    method: 'post'
  })
}

export const getApiLogs = (page) => {
  return request({
    url: 'system/logger/api',
    params: page,
    method: 'get'
  })
}

export const getCodeLogs = (page) => {
  return request({
    url: 'system/logger/code',
    params: page,
    method: 'get'
  })
}

export const getCodeLog = (req, date) => {
  return request({
    url: 'system/logger/code/' + date,
    params: req,
    method: 'get'
  })
}

export const removeCodeLog = (date) => {
  return request({
    url: 'system/logger/code/' + date,
    method: 'delete'
  })
}
