<template>
  <div class="c-page">
    <div class="boss-setting">
      <!-- <div class="tab">
        <div class="label">交易币种</div>
        <div class="item" :class="{active: tabIndex === index}" v-for="(item, index) in tabList" :key="index" @click="tabIndex = index">{{item}}</div>
      </div> -->
      <div class="info">
        <span>充值设置</span>
        <div v-if="sell.id">
          <p>接单限额： {{sell.mintotal | f}} - {{sell.maxtotal | f}} CNY</p>
          <p>用户充值 1.00CNY 需要向您支付 {{1 * sell.rate | f}}CNY</p>
          <p>成交金额/挂单金额：{{sell.tradetotal - sell.subtotal | f}}/{{sell.tradetotal | f}}CNY</p>
          <div class="btn" @click="$router.push('/boss/bossSetInfo/bossSetting?type=1')">修改</div>
        </div>
        <div v-else>
          <div class="empty-tips">
            <span class="el-icon-warning"></span>
            <span>暂无设置</span>
          </div>
          <div class="btn" @click="$router.push('/boss/bossSetInfo/bossSetting?type=1')">前往设置</div>
        </div>
      </div>
      <div class="info">
        <span>提现设置</span>
        <div v-if="buy.id">
          <p>接单限额： {{buy.mintotal | f}} - {{buy.maxtotal | f}} CNY</p>
          <p>用户提现 1.00CNY 需要向您支付 {{1 * buy.rate | f}}CNY</p>
          <p>成交金额/挂单金额：{{(buy.tradetotal - buy.subtotal) | f}}/{{buy.tradetotal | f}}CNY</p>
          <div class="btn" @click="$router.push('/boss/bossSetInfo/bossSetting?type=2')">修改</div>
        </div>
        <div v-else>
          <div class="empty-tips">
            <span class="el-icon-warning"></span>
            <span>暂无设置</span>
          </div>
          <div class="btn" @click="$router.push('/boss/bossSetInfo/bossSetting?type=2')">前往设置</div>
        </div>
      </div>
    </div>
    <loading v-if="loading"></loading>
  </div>
</template>

<script>
export default {
  data() {
    return {
      sell: {},
      buy: {},
      loading: true
    };
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      this.$fetch.post('/business/queryDepositAndDraw').then(res => {
        if (res.success) {
          this.loading = false
          this.sell = res.data.sell || {}
          this.buy = res.data.buy || {}
        }
      })
    }
  }
};
</script>

<style lang="less" scoped>
.tab{
  height: auto;
  border-width: 1px;
  padding-bottom: 30px;
}
.info{
  padding-top: 30px;
  margin-bottom: 30px;
  padding-left: 30px;
  span{
    font-size: 14px;
    color: #999;
  }
  p{
    padding-top: 20px;
    font-size: 18px;
  }
}
.empty-tips{
  padding-top: 40px;
  span{
    font-size: 16px;
    margin-right: 6px;
  }
}
</style>

