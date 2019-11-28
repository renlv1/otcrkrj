<template>
  <div class="header">
    <div class="wrap row">
      <div class="row">
        <div class="logo vCenter" @click="$router.push('/')"><img src="@img/logo.png" alt=""></div>
        <div class="nav row">
          <router-link class="link" @click.native="clearList" v-for="(item, index) in list" :key="index" :to="item.link">{{item.text}}</router-link>
        </div>
      </div>
      <div class="row">
        <template v-if="$store.state.user.id">
          <router-link @click="clearList" class="link ell" to="/account">{{$store.state.user.userSystemCode}}</router-link>
          <router-link @click="clearList" class="link" to="/order">我的订单</router-link>
          <div class="link" @click="logout">退出账号</div>
        </template>
        <template v-else>
          <div class="link" @click="login">登录</div>
        </template>
        <div class="link">中文</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    list () {
      return [
        {
          text: '充值',
          link: '/recharge'
        },
        {
          text: '提现',
          link: '/withdraw'
        },
        {
          text: '做市商',
          link: this.$store.state.user.isbusinessman === 2 ? '/boss' : '/applyBoss'
        }
      ]
    }
  },
  methods: {
    login () {
      this.$fetch.post('/user/userlogin', {
        username: 'to-xwj',
        userSystemCode: 'rMt98dMZ11GFfHinLFXHwFU1r2FtcopBF6',
        sign: 'be03cfc02e5b9ee7f63d5bbef7ad01f6',
        cookie: '123',
        authentication: 1,
      }).then(res => {
        if (res.success) {
          this.$store.dispatch('getBalance')
        }
      })
    },
    clearList () {
      this.$store.commit("SET_LIST_RECORD", {})
      this.$store.commit("SET_TAB_INDEX", 0)
    },
    logout () {
      this.$fetch.get('/user/logout').then(res => {
        if (res.success) {
          this.$store.commit('CLEAR_ACCOUNT')
          this.$router.push('/')
        }
      })
    }
  }
};
</script>

<style lang="less" scoped>
.header{
  background: #011039;
  color: #fff;
  line-height: 60px;
  position: fixed;
  width: 100%;
  left: 0;
  top: 0;
  z-index: 99;
  .nav{
    margin-left: 40px;
  }
  .link{
    width: 110px;
    text-align: center;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    &::before{
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      border-radius: 50%;
      width: 0px;
      height: 0px;
      transform: translate(-50%, -50%);
      background: @blue;
      z-index: -1;
    }
    &.active{
      &::before{
        width: 150px;
        height: 150px;
        transition: .3s ease-in;
      }
    }
    &.ell{
      width: 110px;
      padding: 0 8px;
    }
  }
}
</style>

