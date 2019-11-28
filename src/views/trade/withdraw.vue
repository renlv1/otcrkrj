<template>
  <div class="c-page">
    <div class="wrap">
      <!-- <div class="tab">
        <div class="label">交易币种</div>
        <div class="item" :class="{active: tabIndex === index}" v-for="(item, index) in tabList" :key="index" @click="tabIndex = index">{{item}}</div>
      </div> -->

      <load-more
        @change="getData"
        :list="list"
        :total="total">
        <div class="web-list">
          <table>
            <thead>
              <tr>
                <td>做市商</td>
                <td>成单量|成单率</td>
                <td>数量</td>
                <td>交易限额</td>
                <td>单价</td>
                <td>支付方式</td>
                <td>交易</td>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in list" :key="index">
                <td><div class="ell">{{item.userSystemCode}}</div></td>
                <td>{{item.successnum}}|{{item.successrate / 100}}%</td>
                <td>{{item.tradetotal | f}}CNY</td>
                <td>{{item.mintotal | f}} - {{item.maxtotal | f}}CNY</td>
                <td class="cblue">{{item.rate | f}}CNY</td>
                <td>{{payWay(item.payjson)}}</td>
                <td>
                  <button disabled v-if="item.userSystemCode === $store.state.user.userSystemCode" title="不能和自己交易" class="btn small">下单</button>
                  <div v-else class="btn small" @click="selectOrder(item)">下单</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </load-more>
      <el-dialog class="d-form" :visible.sync="showDialog">
        <div class="d-tit">确认下单</div>
        <div class="intro">当前选择的交易单价：<span class="cblue">{{currentOrder.rate | f}}CNY</span>, 请输入提现金额或支付金额进行下单。</div>
        <div class="input-wrap">
          <div class="label">提现金额</div>
          <input type="text" :value="amount" @input="calcPayAmount">
          <div class="unit">CNY</div>
        </div>
        <div class="input-wrap">
          <div class="label">支付金额</div>
          <input type="text" :value="payAmount" @input="calcAmount">
          <div class="unit">CNY</div>
        </div>
        <button class="btn big" @click="submit">确认下单</button>
        <div class="cancel" @click="showDialog = false">取消</div>
      </el-dialog>
      <pay-dialog ref="payDialog" @submit="payConfirm"/>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      detail: {},
      pageSize: 10,
      list: [],
      tabList: ['CNY', 'BTC'],
      tabIndex: 0,
      total: -1,
      showDialog: false,
      currentOrder: {},
      amount: '',
      payAmount: '',
    };
  },
  methods: {
    getData(pageIndex) {
      this.$fetch.post('/business/queryAllOrderBySellAndBuy', {
        pageIndex,
        pageSize: 10,
        type: 2
      }).then(res => {
        if (res.success) {
          this.list = res.data.results
          this.total = res.data.totalRecord
        }
      })
    },
    selectOrder (item) {
      this.amount = ''
      this.payAmount = ''
      this.currentOrder = item
      this.showDialog = true
    },
    submit () {
      this.showDialog = false
      this.$refs.payDialog.show()
    },
    payWay (item) {
      let str = ''
      if (item.includes('"bankType":1')) {
        str = '银行卡'
      } else if (item.includes('"bankType":2')) {
        str += '，支付宝'
      } else if (item.includes('"bankType":3')) {
        str += '，微信'
      }
      return str
    },
    calcAmount (e) {
      const val = e.target.value
      this.payAmount = val
      this.amount = (val / this.currentOrder.rate).toFixed(2)
    },
    calcPayAmount (e) {
      const val = e.target.value
      this.amount = val
      this.payAmount = (val * this.currentOrder.rate).toFixed(2)
    },
    payConfirm (p1, p2) {
      this.$fetch.post('/draw/userDraw', {
        buyorderid: this.currentOrder.id,
        total: this.amount,
        tradePwd: p1,
        code: p2,
        loading: true
      }).then(res => {
        if (res.success) {
          this.$message.success('下单成功！')
          this.$router.push(`/order/withdrawDetail?id=${res.data.id}`)
        } else {
          this.$message.error({
            message: res.msg,
          })
        }
      })
    }
  }
};
</script>

<style lang="less" scoped>
.web-list{
  margin-top: 60px;
  border-top: 10px solid #eee;
}
.intro{
  margin-bottom: 20px;
}
</style>
