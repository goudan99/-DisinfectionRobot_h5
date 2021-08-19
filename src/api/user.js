import request from '@/libs/request'
import axios from 'axios'
import config from '@/config'
import { getToken } from '@/libs/util'

const baseUrl = process.env.NODE_ENV === 'development' ? config.baseUrl.dev : config.baseUrl.pro

export const login = ({ username, password }) => {
  const data = {
    username,
    password
  }
  return request({
    url: 'login/token',
    data,
    method: 'post'
  })
}

export const logout = (token) => {
  return request({
    url: 'login/logout',
    method: 'post'
  })
}

export const getProfileUser = () => {
  return request({
    url: 'profile/user',
    method: 'get'
  })
}

export const storeProfileUser = (data) => {
  return request({
    url: 'profile/user',
    data,
    method: 'post'
  })
}

export const storePassword = (data) => {
  return request({
    url: 'profile/password',
    data,
    method: 'post'
  })
}

export const uploadAvatar = (file) => {
  let param = new FormData()
  param.append('file', file)
  let config = {
    headers: { 'Content-Type': 'multipart/form-data', 'Authorization': 'Bearer ' + getToken() }
  }
  return axios.post(baseUrl + '/profile/avatar', param, config)
}

export const getProfileMenus = () => {
  return request({
    url: 'profile/menu',
    method: 'get'
  })
}

export const getNotices = () => {
  return request({
    url: 'profile/notice',
    method: 'get'
  })
}

export const getNotice = id => {
  return request({
    url: 'profile/notice/' + id,
    method: 'get'
  })
}

/* 删除 */
export const removeRead = id => {
  return request({
    url: 'profile/notice/' + id,
    method: 'delete'
  })
}
/* 恢复删除 */
export const restTrash = id => {
  return request({
    url: 'profile/notice/' + id,
    method: 'patch'
  })
}

/* 获取没有读消息条数 */
export const getUnreadCount = () => {
  return request({
    url: 'analysis/notice/unread',
    method: 'get'
  })
}
