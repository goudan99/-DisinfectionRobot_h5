<template>
  <div>
    <Card>
      <Tabs value="profile">
        <TabPane label="个人信息" name="profile">
          <Form ref="user" :model="formItem" :label-width="100">
            <FormItem label="头像" prop="avatar">
              <Upload v-model="formItem.avatar" :change="upload"/>
            </FormItem>
            <FormItem label="呢称" prop="nickname">
              <Input v-model="formItem.nickname" placeholder="请输入内容"></Input>
            </FormItem>
            <FormItem label="">
              <Button type="default" @click="handleSubmit">保存</Button>
            </FormItem>
          </Form>
        </TabPane>
        <TabPane label="安全设置" name="safe">
          <Form ref="passwordForm" :model="passwordItem" :rules="formItemRules" :label-width="100">
            <FormItem label="登录密码" prop="password">
              <Input type="password" v-model="passwordItem.password"  placeholder="请输入内容"></Input>
            </FormItem>
            <FormItem label="再次确认密码" prop="passwordConfirm">
              <Input type="password" v-model="passwordItem.passwordConfirm" placeholder="请输入内容"></Input>
            </FormItem>
            <FormItem label="">
              <Button type="default" @click="handlePassword">修改密码</Button>
            </FormItem>
          </Form>
        </TabPane>
      </Tabs>
    </Card>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { uploadAvatar, storePassword } from '@/api/user'

export default {
  name: 'message_page',
  data () {
    const validatePassConfirm = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.passwordItem.password) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    return {
      formItem: {
        nickname: '',
        avatar: '',
        email: ''
      },
      passwordItem: {
        password: '',
        passwordConfirm: ''
      },
      formItemRules: {
        password: [
          { required: true, message: '登录密码不能为空', trigger: 'blur' }
        ],
        passwordConfirm: [
          { validator: validatePassConfirm, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    userAvatar () {
      return this.$store.state.user.avatarImgPath
    },
    userName () {
      return this.$store.state.user.userName
    }
  },
  mounted: function () {
    this.init()
  },
  methods: {
    ...mapActions([
      'getUserInfo',
      'storeProfileUser'
    ]),
    init () {
      this.getUserInfo().then(res => {
        this.formItem.nickname = res.nickname
        this.formItem.avatar = res.avatar
      })
    },
    handleSubmit () {
      this.storeProfileUser(this.formItem).then(res => {
        console.log('0')
        this.$Message.success('保存成功')
      })
    },
    handlePassword () {
      this.$refs['passwordForm'].validate((valid) => {
        if (valid) {
          storePassword(this.passwordItem).then(res => {
            this.$Message.success('保存成功')
          })
        }
      })
    },
    upload (file) {
      return uploadAvatar(file)
    }
  }
}
</script>
