<template>
  <Form ref="passwordForm" :model="form" :rules="rules" @keydown.enter.native="handleSubmit">
    <FormItem prop="phone">
      <Input v-model="form.phone" size="large" placeholder="请输入手机号" >
        <span slot="prepend">
          <Icon :size="20" type="ios-phone-portrait"></Icon>
        </span>
        <Button slot="append" @click="handleSend" :loading="loading" :disabled="disable">{{sendStr}}</Button>
      </Input>
    </FormItem>
    <FormItem prop="code">
      <Input v-model="form.code" size="large" placeholder="请输入验证码">
        <span slot="prepend">
          <Icon :size="14" type="md-code"></Icon>
        </span>
      </Input>
    </FormItem>
    <FormItem prop="password">
      <Input type="password" v-model="form.password" size="large" placeholder="请输入密码">
        <span slot="prepend">
          <Icon :size="14" type="md-lock"></Icon>
        </span>
      </Input>
    </FormItem>
    <FormItem prop="passwordConfirm">
      <Input type="password" v-model="form.passwordConfirm" size="large" placeholder="请输入确认密码">
        <span slot="prepend">
          <Icon :size="14" type="md-lock"></Icon>
        </span>
      </Input>
    </FormItem>
    <FormItem>
      <Button @click="handleSubmit" size="large" type="primary" long>提交</Button>
    </FormItem>
  </Form>
</template>
<script>
export default {
  name: 'PasswordForm',
  data () {
    const validatePassConfirm = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.form.password) {
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
      loading: false,
      disable: false,
      sendStr: '发送验证码',
      rules: {
        phone: [
          { required: true, validator: validateMobile, trigger: 'blur' }
        ],
        password: [
          { required: true, message: '登录密码不能为空', trigger: 'blur' }
        ],
        passwordConfirm: [
          { required: true, validator: validatePassConfirm, trigger: 'blur' }
        ],
        code: [
          { required: true, message: '验证码不能为空', trigger: 'blur' }
        ]
      },
      form: {
        phone: '',
        code: '',
        password: '',
        passwordConfirm: ''
      }
    }
  },
  methods: {
    handleSubmit () {
      this.$refs.passwordForm.validate((valid) => {
        if (valid) {
          this.$emit('on-success-valid', {
            phone: this.form.phone,
            password: this.form.password,
            password_confirmation: this.form.passwordConfirm,
            code: this.form.code
          })
        }
      })
    },
    handleSend () {
      this.$refs.passwordForm.validateField('phone', errors => {
        if (!errors) {
          this.loading = true
          this.disable = true
          let i = 0
          this.$emit('on-send', this.form.phone, (res) => {
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
          })
        }
      })
    }
  }
}
</script>
