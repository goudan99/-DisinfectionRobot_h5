import request from '@/libs/request'

export const getUsers = ({ page, limit }) => {
  const data = { page: page, limit: limit }
  return request({
    url: 'member/user',
    data,
    method: 'get'
  })
}

export const storeUser = (data) => {
  return request({
    url: 'member/user',
    data,
    method: 'post'
  })
}

export const removeUser = (data) => {
  return request({
    url: 'member/user',
    data,
    method: 'delete'
  })
}

export const getRoles = ({ page, limit }) => {
  const data = { page: page, limit: limit }
  return request({
    url: 'member/role',
    data,
    method: 'get'
  })
}

export const storeRole = (data) => {
  return request({
    url: 'member/role',
    data,
    method: 'post'
  })
}

export const removeRole = ({ id }) => {
  const data = { id: id }
  return request({
    url: 'member/role',
    data,
    method: 'delete'
  })
}

export const roleGrantApi = ({ roleId, apiIds }) => {
  const data = { roleId: roleId, apiIds: apiIds }
  return request({
    url: 'base/role/grant/api',
    data,
    method: 'post'
  })
}

export const getRoleInfo = (roleId) => {
  const data = { roleId: roleId }
  return request({
    url: 'member/role/' + roleId,
    data,
    method: 'get'
  })
}
