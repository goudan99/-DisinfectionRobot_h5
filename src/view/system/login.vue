<template>
  <div class="login">
    <div class="login-con">
      <Card title="欢迎登录" :bordered="false">
        <login-form @on-success-valid="handleSubmit"></login-form>
        <p class="login-tip"></p>
      </Card>
      <p class="copyright">
        Copyright © 2021 - heekit.com
      </p>
    </div>
  </div>
</template>

<script>
import LoginForm from '_c/login-form'
import { mapActions } from 'vuex'
export default {
  components: {
    LoginForm
  },
  methods: {
    ...mapActions([
      'handleLogin',
      'getUserInfo'
    ]),
    handleSubmit ({ userName, password }) {
      this.handleLogin({ userName, password }).then(res => {
        this.getUserInfo().then(res => {
          this.$router.push({ name: this.$config.homeName })
          location.reload()
        })
      })
    }
  }
}
</script>

<style lang="less">
@gradient-color: #3788ee;
@bg-color: #f7f8fa;
@title-color: #3a3a3a;
@text-color: #7e7e7e;
@placeholder-color: #7e7e7e;
.login{
  width: 100%;
  height: 100%;
  background: @bg-color;
  background-size: cover;
  background-position: center;
  position: relative;
  &-con{
    position: absolute;
    right: 160px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 320px;
    .ivu-card{
      letter-spacing: 2px;
      background: #fff;
      padding: 70px 30px 20px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.06);
      border-radius: 3px;
      box-sizing: border-box;
      &-head{
        padding:0;
        margin:0;
        border-bottom:none;
        p{
          font-size: 30px;
          color: @title-color;
          line-height: 1;
          margin: -16px 0px 40px;
          font-weight: 200;
          height:30px;
          text-align:center
        }
      }
      &-body{
        padding: 10px 0 0;
      }
      .login-tip{
        font-size: 10px;
        text-align: center;
        color: #c3c3c3;
      }
    }
    .copyright {
      letter-spacing: 1px;
      margin-top: 30px;
      color: @text-color;
      text-align:center;
      a {
        color: @text-color;
      }
    }
  }
}
</style>
