<template>
  <div class="user-avatar-dropdown">
    <Dropdown @on-click="handleClick">
      <Badge :dot="!!messageUnreadCount">
        <Avatar :src="userAvatar" @on-error="error"/>
      </Badge>
      <Icon :size="18" type="md-arrow-dropdown"></Icon>
      <DropdownMenu slot="list">
        <DropdownItem name="setting"><Icon size="16" type="md-person" /> 个人设置</DropdownItem>
        <DropdownItem name="message">
          <Icon size="16" type="md-mail" /> 消息中心
          <Badge style="margin-left: 10px" :count="messageUnreadCount"></Badge>
        </DropdownItem>
        <DropdownItem name="logout"><Icon size="16" type="md-power" /> 退出登录</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>

<script>
import './user.less'
import image from '@/assets/images/nopic.jpg'
import { mapActions } from 'vuex'
export default {
  name: 'User',
  props: {
    userAvatar: {
      type: String,
      default: ''
    },
    messageUnreadCount: {
      type: Number,
      default: 0
    }
  },
  methods: {
    ...mapActions([
      'handleLogOut'
    ]),
    logout () {
      this.handleLogOut().then(() => {
        this.$router.push({
          name: 'login'
        })
      })
    },
    message () {
      this.$router.push({
        name: 'profile_message'
      })
    },
    profile () {
      this.$router.push({
        name: 'profile_user'
      })
    },
    error () {
      this.userAvatar = image
    },
    handleClick (name) {
      switch (name) {
        case 'logout': this.logout()
          break
        case 'setting': this.profile()
          break
        case 'message': this.message()
          break
      }
    }
  }
}
</script>
