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
    // ??????
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
    // ????????????
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
        // ???????????????????????????????????????????????????????????????????????????????????????????????????logout????????????
        // commit('setToken', '')
        // commit('setAccess', [])
        // resolve()
      })
    },
    // ????????????????????????
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
    // ??????????????????
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
    // ???????????????????????????????????????????????????????????????????????????????????????
    getUnreadMessageCount ({ state, commit }) {
      getUnreadCount().then(res => {
        const { data } = res
        commit('setMessageCount', data)
      })
    },
    // ????????????????????????????????????????????????????????????????????????
    getMessageList ({ state, commit }) {
      return new Promise((resolve, reject) => {
        getNotices().then(res => {
          let unread = []
          let readed = []
          let trash = []
          res.data.map((row) => {
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
    // ??????????????????????????????id????????????
    getContentByMsgId ({ state, commit }, { msg_id }) {
      return new Promise((resolve, reject) => {
        let contentItem = state.messageContentStore[msg_id]
        if (contentItem) {
          resolve(contentItem)
        } else {
          getNotice(msg_id).then(res => {
            const content = res.data
            commit('setMessageCount', state.unreadCount - 1)
            commit('updateMessageContentStore', { msg_id, content })
            resolve(content)
          })
        }
      })
    },
    // ????????????????????????????????????
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
    // ????????????????????????????????????
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
    // ??????????????????????????????????????????
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
