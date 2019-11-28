<template>
  <div class="c-page">
    <div class="crumb">
      <div class="wrap">
        <router-link exact="" to="/">做市商</router-link>
        <span class="el-icon-arrow-right"></span>
        <span class="cblue">我的概览</span>
      </div>
    </div>
    <div class="wrap">
      <div class="boss">
        <div class="left-menu">
          <router-link to="/boss/bossPre">我的概览</router-link>
          <router-link to="/boss/bossSetInfo">交易设置</router-link>
          <router-link to="/boss/bossSell">充值挂单记录</router-link>
          <router-link to="/boss/bossBuy">提现挂单记录</router-link>
        </div>
        <router-view class="right-content"></router-view>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      detail: {},
      pageSize: 10,
      shareTotal: 100,
      list: [],
      tabList: ['CNY', 'BTC'],
      tabIndex: 0,
      pageIndex: 1,
      options: [
        {
          value: 'HTML',
          label: 'HTML'
        }
      ]
    };
  },
  mounted() {
    // this.getData()
  },
  methods: {
    getData() {
      this.$fetch.post("/bountymap/bountyMapIndex").then(res => {
        if (res.success) {
          this.detail = res.data
        }
      })
    }
  }
};
</script>

<style lang="less" scoped>
.boss{
  .hCenter;
  padding: 30px 0 100px;
  .left-menu{
    .shadow;
    width: 240px;
    a{
      .vCenter;
      height: 60px;
      font-size: 16px;
      border-bottom: 1px solid @bc;
      padding-left: 28px;
      color: #999;
      &.active{
        color: @blue;
      }
    }
  }
  .right-content{
    .shadow;
    width: 1050px;
    padding: 50px 70px 100px;
  }
}
</style>

