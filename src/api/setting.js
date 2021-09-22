import request from '@/libs/request'
import axios from 'axios'
import config from '@/config'
import { getToken } from '@/libs/util'
const baseUrl = process.env.NODE_ENV === 'development' ? config.baseUrl.dev : config.baseUrl.pro
/**
 菜单,配置文件
**/
export const getMenus = () => {
  return request({
    url: 'setting/menus',
    method: 'get'
  })
}

export const storeMenu = (data) => {
  return request({
    url: 'setting/menus',
    data,
    method: 'post'
  })
}

export const removeMenu = ({ id }) => {
  const data = {
    id: id
  }
  return request({
    url: 'setting/menus',
    data,
    method: 'delete'
  })
}

export const getMenuActions = (menu_id) => {
  return request({
    url: 'setting/menus/' + menu_id + '/action',
    method: 'get'
  })
}

export const storeAction = (data) => {
  return request({
    url: 'setting/menus/' + data.menu_id + '/action',
    data,
    method: 'post'
  })
}

export const removeAction = (data) => {
  return request({
    url: 'setting/menus/' + data.menu_id + '/action',
    data,
    method: 'delete'
  })
}

export const getAccess = () => {
  return request({
    url: 'system/access',
    method: 'get'
  })
}

export const storeAccess = (data) => {
  return request({
    url: 'system/access',
    data,
    method: 'post'
  })
}

export const removeAccess = (id) => {
  return request({
    url: 'system/access/' + id,
    method: 'delete'
  })
}

export const getUris = () => {
  return request({
    url: 'system/uris',
    method: 'get'
  })
}

export const getConfig = () => {
  return request({
    url: 'setting/config',
    method: 'get'
  })
}

export const storeConfig = (data) => {
  return request({
    url: 'setting/config',
    data,
    method: 'post'
  })
}

export const upload = (file) => {
  let param = new FormData()
  param.append('file', file)
  let config = {
    headers: { 'Content-Type': 'multipart/form-data', 'Authorization': 'Bearer ' + getToken() }
  }
  return axios.post(baseUrl + '/setting/config/upload', param, config)
}
