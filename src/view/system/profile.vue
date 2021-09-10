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
          <Form ref="passwordForm" :model="passwordItem" :rules="passwordItemRules" :label-width="100">
            <FormItem label="登录密码" prop="password">
              <Input type="password" v-model="passwordItem.password"  placeholder="请输入内容"></Input>
            </FormItem>
            <FormItem label="再次确认密码" prop="password_confirmation">
              <Input type="password" v-model="passwordItem.password_confirmation" placeholder="请输入内容"></Input>
            </FormItem>
            <FormItem label="验证码" prop="code">
              <Input v-model="passwordItem.code" placeholder="请输入内容"><Button slot="append" @click="handleSend(2)" :loading="loading1" :disabled="disable1">{{sendStr1}}</Button></Input>
            </FormItem>
            <FormItem label="">
              <Button type="default" @click="handlePassword">修改密码</Button>
            </FormItem>
          </Form>
        </TabPane>
        <TabPane label="修改手机" name="phone">
          <Form ref="phoneForm" :model="phoneItem" :rules="phoneItemRules" :label-width="100">
            <FormItem label="新手机号" prop="phone">
              <Input v-model="phoneItem.phone"  placeholder="请输入内容"><Button slot="append" @click="handlePhoneSend" :loading="loading" :disabled="disable">{{sendStr}}</Button></Input>
            </FormItem>
            <FormItem label="新手机验证码" prop="code">
              <Input v-model="phoneItem.code" placeholder="请输入内容"></Input>
            </FormItem>
            <FormItem label="旧手机验证码" prop="oldcode">
              <Input v-model="phoneItem.oldcode"  placeholder="请输入内容"><Button slot="append" @click="handleSend1(3)" :loading="loading2" :disabled="disable2">{{sendStr2}}</Button></Input>
            </FormItem>
            <FormItem label="">
              <Button type="default" @click="handlePhone">修改手机</Button>
            </FormItem>
          </Form>
        </TabPane>
      </Tabs>
    </Card>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { uploadAvatar, storePassword, storePhone, getCode, getUserPhoneCode } from '@/api/user'

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
    const validateMobile = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('手机号不能为空'))
      }
      var reg = /^1\d{10}$/
      if (value !== '' && !reg.test(value)) {
        callback(new Error('手机号码格式不正确'))
      } else {
        callback()
      }
    }
    return {
      phone: '',
      loading: false,
      disable: false,
      sendStr: '发送验证码',
      loading1: false,
      disable1: false,
      sendStr1: '发送验证码',
      loading2: false,
      disable2: false,
      sendStr2: '发送验证码',
      formItem: {
        nickname: '',
        avatar: '',
        email: ''
      },
      passwordItem: {
        password: '',
        password_confirmation: '',
        code: ''
      },
      passwordItemRules: {
        password: [
          { required: true, message: '登录密码不能为空', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '验证码不能为空', trigger: 'blur' }
        ],
        password_confirmation: [
          { validator: validatePassConfirm, trigger: 'blur' }
        ]
      },
      phoneItem: {
        phone: '',
        code: '',
        oldcode: ''
      },
      phoneItemRules: {
        phone: [
          { required: true, validator: validateMobile, trigger: 'blur' }
        ],
        code: [
          { required: true, message: '新手机验证码不为能空', trigger: 'blur' }
        ],
        oldcode: [
          { required: true, message: '旧手机验证码不能为空', trigger: 'blur' }
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
    },
    userPhone () {
      return this.$store.state.user.phone
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
    handlePhone () {
      this.$refs['phoneForm'].validate((valid) => {
        if (valid) {
          storePhone(this.phoneItem).then(res => {
            this.$Message.success('保存成功')
          })
        }
      })
    },
    handlePhoneSend () {
      this.$refs.phoneForm.validateField('phone', errors => {
        if (!errors) {
          this.loading = true
          this.disable = true
          let i = 0
          getCode({ phone: this.phoneItem.phone, type: 4 }).then(resut => {
            if (resut.code === 0) {
              this.loading = false
              let t = setInterval(() => {
                i++
                this.sendStr = '' + (60 - i) + '秒后重发'
                this.disable = true
                if (60 - i === 0) {
                  clearInterval(t)
                  this.disable = false
                  this.sendStr = '发送验证码'
                }
              }, 1000)
              this.$Modal.info({ content: resut.msg })
            } else {
              this.disable = false
              this.sendStr = '发送验证码'
              this.$Message.error(resut.msg)
            }
          })
        }
      })
    },
    handleSend (type) {
      this.loading1 = true
      this.disable1 = true
      let i = 0
      getUserPhoneCode(type).then(resut => {
        if (resut.code === 0) {
          this.loading1 = false
          let t = setInterval(() => {
            i++
            this.sendStr1 = '' + (60 - i) + '秒后重发'
            this.disable1 = true
            if (60 - i === 0) {
              clearInterval(t)
              this.disable1 = false
              this.sendStr1 = '发送验证码'
            }
          }, 1000)
          this.$Modal.info({ content: resut.msg })
        } else {
          this.disable1 = false
          this.sendStr1 = '发送验证码'
          this.$Message.error(resut.msg)
        }
      })
    },
    handleSend1 (type) {
      this.loading2 = true
      this.disable2 = true
      let i = 0
      getUserPhoneCode(type).then(resut => {
        if (resut.code === 0) {
          this.loading2 = false
          let t = setInterval(() => {
            i++
            this.sendStr2 = '' + (60 - i) + '秒后重发'
            this.disable2 = true
            if (60 - i === 0) {
              clearInterval(t)
              this.disable2 = false
              this.sendStr2 = '发送验证码'
            }
          }, 1000)
          this.$Modal.info({ content: resut.msg })
        } else {
          this.disable2 = false
          this.sendStr2 = '发送验证码'
          this.$Message.error(resut.msg)
        }
      })
    },
    upload (file) {
      return uploadAvatar(file)
    }
  }
}
</script>
