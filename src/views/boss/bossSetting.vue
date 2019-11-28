<template>
  <div class="c-page">
    <div class="boss-setting">
      <!-- <div class="tab">
        <div class="label">交易币种</div>
        <div class="item" :class="{active: tabIndex === index}" v-for="(item, index) in tabList" :key="index" @click="tabIndex = index">{{item}}</div>
      </div> -->
      <div class="info">
        <span>{{type === 1 ? '充值' : '提现'}}设置</span>
        <div class="input-wrap">
          <div class="p">最低接单金额：</div>
          <input type="text" placeholder="0.00" v-model="mintotal">
          <div class="unit">CNY</div>
        </div>
        <div class="input-wrap">
          <div class="p">最高接单金额：</div>
          <input type="text" placeholder="0.00" v-model="maxtotal">
          <div class="unit">CNY</div>
        </div>
        <div class="input-wrap">
          <div class="p">交易汇率： 1.00CNY = &nbsp;</div>
          <input type="text" placeholder="0.00" v-model="rate">
          <div class="unit">CNY</div>
        </div>
        <div class="input-wrap">
          <div class="p">挂单交易金额：</div>
          <input type="text" placeholder="0.00" v-model="total">
          <div class="unit">CNY</div>
        </div>
        <button :disabled="!mintotal || !maxtotal || !rate || !total" class="btn" @click="submit">提交</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      detail: {},
      mintotal: '',
      maxtotal: '',
      rate: '',
      total: '',
      type: parseInt(this.$route.query.type) || 1 // 1: 充值设置 2： 提现设置
    };
  },
  mounted() {
    // this.getData()
  },
  methods: {
    submit () {
      const type = this.type
      if (type === 1 && this.total > this.$store.state.balance) {
        this.$message.error('挂单交易金额必须小于等于OTC中的余额')
      } else {
        const url = type === 1 ? '/business/createSellOrder' : '/business/createBuyOrder'
        this.$fetch.post(url, {
          mintotal: this.mintotal,
          maxtotal: this.maxtotal,
          rate: this.rate,
          total: this.total,
          tradePwd: '1',
          code: '1',
          loading: true
        }).then(res => {
          if (res.success) {
            this.$message.success({
              message: '设置成功！',
              onClose: () => {
                this.$router.back()
              }
            })
          } else {
            this.$message.error(res.msg)
          }
        })
      }
    },
    jump(link) {
      this.$store.commit("SET_LIST_RECORD", {})
      this.$store.commit("SET_TAB_INDEX", 0)
      this.$router.push(link);
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
  width: 370px;
  padding-top: 30px;
  margin-bottom: 30px;
  padding-left: 30px;
  span{
    font-size: 14px;
    color: #999;
    display: block;
    margin-bottom: 20px;
  }
}
.input-wrap{
  font-size: 18px;
  .vCenter;
  .label{margin-bottom: 0;}
  overflow: hidden;
  input{
    flex: 1;
    height: 38px;
    padding: 0 10px;
  }
  .unit{
    font-size: 15px;
    line-height: 36px;
    bottom: 1px;
    color: #aaa;
    right: 10px;
  }
}
.btn{
  margin-top: 70px;
}
</style>

