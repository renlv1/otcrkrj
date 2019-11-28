<template>
  <div class="footer">
    <div class="wrap row">
      <div class="row">
        <router-link class="link" v-for="(item, index) in list" :key="index" :to="item.link">{{item.text}}</router-link>
      </div>
      <div class="row">
        CopyRight@2019 OTC
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      list: [
        {
          text: '雷达实验室',
          link: '/recharge'
        },
        {
          text: '雷达钱包',
          link: '/withdraw'
        },
        {
          text: '使用帮助',
          link: '/boss'
        }
      ]
    }
  }
}
</script>

<style lang="less" scoped>
.footer{
  background: #011039;
  color: #fff;
  line-height: 80px;
  position: relative;
  z-index: 2;
  // font-size: 18px;
  .link{
    margin-right: 80px;
  }
}
</style>

