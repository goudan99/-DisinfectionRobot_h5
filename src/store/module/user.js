import {
  login,
  logout,
  getProfileUser,
  getProfileMenus,
  storeProfileUser,
  getNotices,
  getNotice,
  removeRead,
  hasRead,
  restTrash,
  getUnreadCount
} from '@/api/user'
import { setToken, getToken, clearTagNav } from '@/libs/util'

export default {
  state: {
    id: '',
    nickname: '',
    avatar: '',
    phone: '',
    token: getToken(),
    access: '',
    hasGetInfo: false,
    menus: [],
    unreadCount: 0,
    messageUnreadList: [],
    messageReadedList: [],
    messageTrashList: [],
    messageContentStore: {}
  },
  mutations: {
    setAvatar (state, avatarPath) {
      state.avatar = avatarPath
    },
    setPhone (state, phone) {
      state.phone = phone
    },
    setUserId (state, id) {
      state.id = id
    },
    setUserName (state, name) {
      state.nickname = name
    },
    setAccess (state, access) {
      state.access = access
    },
    setToken (state, token) {
      state.token = token
      setToken(token)
    },
    setHasGetInfo (state, status) {
      state.hasGetInfo = status
    },
    setUserMenus (state, menus) {
      state.menus = menus
    },
    setMessageCount (state, count) {
      state.unreadCount = count
    },
    setMessageUnreadList (state, list) {
      state.messageUnreadList = list
    },
    setMessageReadedList (state, list) {
      state.messageReadedList = list
    },
    setMessageTrashList (state, list) {
      state.messageTrashList = list
    },
    updateMessageContentStore (state, { msg_id, content }) {
      state.messageContentStore[msg_id] = content
    },
    moveMsg (state, { from, to, msg_id }) {
      const index = state[from].findIndex(_ => _.id === msg_id)
      console.log(msg_id)
      const msgItem = state[from].splice(index, 1)[0]
      msgItem.loading = false
      state[to].unshift(msgItem)
    }
  },
  getters: {
    messageUnreadCount: state => state.messageUnreadList.length,
    messageReadedCount: state => state.messageReadedList.length,
    messageTrashCount: state => state.messageTrashList.length
  },
  actions: {
    // 登录
    handleLogin ({ commit }, { userName, password }) {
      let username = userName.trim()
      return new Promise((resolve, reject) => {
        login({
          username,
          password
        }).then(res => {
          const data = res.data
          if (res.code === 422) {
            reject(res.msg)
          } else {
            commit('setToken', data.access_token)
          }
          clearTagNav()
          resolve()
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 退出登录
    handleLogOut ({ state, commit }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('setToken', '')
          commit('setAccess', [])
          clearTagNav()
          resolve()
        }).catch(err => {
          reject(err)
        })
        // 如果你的退出登录无需请求接口，则可以直接使用下面三行代码而无需使用logout调用接口
        // commit('setToken', '')
        // commit('setAccess', [])
        // resolve()
      })
    },
    // 获取用户相关信息
    getUserInfo ({ state, commit }) {
      return new Promise((resolve, reject) => {
        try {
          getProfileUser().then(res => {
            if (res.code === 0) {
              const data = res.data
              commit('setAvatar', data.avatar)
              commit('setUserName', data.nickname)
              commit('setUserId', data.id)
              commit('setPhone', data.phone)
              commit('setAccess', '')
              commit('setHasGetInfo', true)
              data.menus = getProfileMenus().then(res => {
                if (res.code === 0) {
                  commit('setUserMenus', res.data)
                  resolve(state)
                }
              }).catch(err => {
                reject(err)
              })
            }
          }).catch(err => {
            reject(err)
          })
        } catch (error) {
          reject(error)
        }
      })
    },
    // 保存个人信息
    storeProfileUser ({ commit }, { nickname, avatar }) {
      return new Promise((resolve, reject) => {
        try {
          storeProfileUser({ nickname, avatar }).then(res => {
            if (res.code === 0) {
              resolve(res.data)
              commit('setAvatar', res.data.avatar)
              commit('setUserName', res.data.nickname)
            }
          }).catch(err => {
            reject(err)
          })
        } catch (error) {
          reject(error)
        }
      })
    },
    // 此方法用来获取未读消息条数，接口只返回数值，不返回消息列表
    getUnreadMessageCount ({ state, commit }) {
      getUnreadCount().then(res => {
        const { data } = res
        commit('setMessageCount', data)
      })
    },
    // 获取消息列表，其中包含未读、已读、回收站三个列表
    getMessageList ({ state, commit }) {
      return new Promise((resolve, reject) => {
        getNotices().then(res => {
          let unread = []
          let readed = []
          let trash = []
          // console.log(res.data)
          res.data.map((row) => {
            console.log(row)
            if (row.is_read === 0 && !row.deleted_at) {
              unread.push(row)
            }
            if (row.is_read === 1 && !row.deleted_at) {
              readed.push(row)
            }
            if (row.deleted_at) {
              trash.push(row)
            }
          })
          // console.log(unread)
          // console.log(readed)
          // console.log(trash)
          // const { unread, readed, trash } = res.data
          commit('setMessageUnreadList', unread.sort((a, b) => new Date(b.create_at) - new Date(a.create_at)))
          commit('setMessageReadedList', readed.map(_ => {
            _.loading = false
            return _
          }).sort((a, b) => new Date(b.create_at) - new Date(a.create_at)))
          commit('setMessageTrashList', trash.map(_ => {
            _.loading = false
            return _
          }).sort((a, b) => new Date(b.create_at) - new Date(a.create_at)))
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 根据当前点击的消息的id获取内容
    getContentByMsgId ({ state, commit }, { msg_id }) {
      return new Promise((resolve, reject) => {
        let contentItem = state.messageContentStore[msg_id]
        if (contentItem) {
          resolve(contentItem)
        } else {
          getNotice(msg_id).then(res => {
            const content = res.data
            // if (res.data.is_read===1) {
            // commit('moveMsg', {
            //  from: 'messageUnreadList',
            //  to: 'messageReadedList',
            //  msg_id
            // })
            // }
            commit('setMessageCount', state.unreadCount - 1)
            commit('updateMessageContentStore', { msg_id, content })
            resolve(content)
          })
        }
      })
    },
    // 删除一个已读消息到回收站
    hasRead ({ commit }, { id }) {
      return new Promise((resolve, reject) => {
        hasRead(id).then(() => {
          commit('moveMsg', {
            from: 'messageUnreadList',
            to: 'messageReadedList',
            msg_id: id
          })
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 删除一个已读消息到回收站
    removeRead ({ commit }, { id }) {
      return new Promise((resolve, reject) => {
        removeRead(id).then(() => {
          commit('moveMsg', {
            from: 'messageReadedList',
            to: 'messageTrashList',
            msg_id: id
          })
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 还原一个已删除消息到已读消息
    restoreTrash ({ commit }, { msg_id }) {
      return new Promise((resolve, reject) => {
        restTrash(msg_id).then(() => {
          commit('moveMsg', {
            from: 'messageTrashList',
            to: 'messageReadedList',
            msg_id
          })
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}
