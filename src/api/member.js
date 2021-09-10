import request from '@/libs/request'

export const getUsers = (data) => {
  return request({
    url: 'member/user',
    params: data,
    method: 'get'
  })
}

export const getUsersInfo = (id) => {
  return request({
    url: 'member/role/' + id,
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

export const getRoles = (data) => {
  return request({
    url: 'member/role',
    params: data,
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

export const removeRole = (data) => {
  return request({
    url: 'member/role',
    data,
    method: 'delete'
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
