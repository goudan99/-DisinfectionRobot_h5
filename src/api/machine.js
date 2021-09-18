import request from '@/libs/request'

/* 获取所有机器 */
export const getMachines = () => {
  return request({
    url: 'robot/machine',
    method: 'get'
  })
}
/* 获取机器详情信息 */
export const getMachine = id => {
  return request({
    url: 'robot/machine/' + id,
    method: 'get'
  })
}
/* 保存机器 */
export const storeMachine = (data) => {
  return request({
    url: 'robot/machine',
    data,
    method: 'post'
  })
}

/* 删除机器 */
export const removeMachine = (data) => {
  return request({
    url: 'robot/machine/',
    data,
    method: 'delete'
  })
}
