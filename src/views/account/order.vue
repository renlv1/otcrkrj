<template>
  <div class="c-page">
    <div class="wrap order">
      <!-- <div class="left-menu">
        <a href="javascript:;" v-for="(item, index) in currencyList" :key="index">{{item}} <span class="badge">15</span></a>
      </div> -->
      <div class="right-content">
        <div class="order-tab">
          <div class="hd">
            <div class="item" :class="{active: typeIndex === index}" @click="typeIndex = index" v-for="(item, index) in typeList" :key="index">
              {{item}}<span v-if="firstRow[index]">({{firstRow[index]}})</span>
            </div>
          </div>
          <div class="bd">
            <div class="item" :class="{active: statusIndex === index}" @click="statusIndex = index" v-for="(item, index) in statusList" :key="index">
              {{item}}(15)
            </div>
          </div>
        </div>
        <load-more @change="getData" :list="list" :total="total">
          <div class="web-list">
            <table>
              <thead>
                <tr>
                  <td>订单号</td>
                  <td>做市商</td>
                  <td>数量/单价</td>
                  <td>交易金额</td>
                  <td>支付方式</td>
                  <td>订单状态</td>
                  <td>操作</td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in list" :key="index">
                  <td>{{item.id}}</td>
                  <td><div class="ell">{{item.userSystemCode}}</div></td>
                  <td>{{item.total | f}}/{{item.rate | f}}CNY</td>
                  <td>{{item.sendAmount | f}}CNY</td>
                  <td>
                    <span v-if="item.paymothed === 1">银行卡</span>
                    <span v-else-if="item.paymothed === 2">支付宝</span>
                    <span v-else-if="item.paymothed === 3">微信支付</span>
                    <span v-else>- -</span>
                  </td>
                  <td>{{status2text(item.status, isRecharge, isBoss)}}</td>
                  <td><div class="btn small" @click="$router.push(`/order/rechargeDetail?id=${item.id}`)" >查看</div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </load-more>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      detail: {},
      list: [],
      typeIndex: 0,
      statusIndex: 0,
      total: -1,
      type: [
        '充值订单',
        '提现订单',
        '做市商充值订单',
        '做市商提现订单'
      ],
      status: [
        '所有状态',
        '等待中',
        '待放行',
        '申诉中',
        '已完成',
        '已取消'
      ],
      firstRow: [],
      allOrder: {}
    };
  },
  mounted() {
    // this.getData()
    // this.getAllOrder()
  },
  computed: {
    typeList () {
      const boss = this.$store.state.user.isbusinessman === 2
      let arr = []
      if (boss) {
        arr = this.type
      } else {
        arr = this.type.slice(0, 2)
      }
      return arr
    },
    statusList () {
      let arr = [...this.status]
      if (this.isBoss) {
        arr[1] = '等待中'
      } else {
        if (this.isRecharge) {
          arr[1] = '待选择支付方式'
        } else {
          arr[1] = '待选择收款方式'
        }
      }
      return arr
    },
    isRecharge () {
      if (this.typeIndex === 0 || this.typeIndex === 2) {
        return true
      } else {
        return false
      }
    },
    isBoss () {
      if (this.typeIndex === 2 || this.typeIndex === 3) {
        return true
      } else {
        return false
      }
    }
  },
  watch: {
    typeIndex () {
      this.getData()
    },
    statusIndex () {
      this.getData()
    }
  },
  methods: {
    getData(pageIndex) {
      this.$fetch.post('/deposit/queryDepositOrderList', {
        pageIndex,
        pageSize: 10,
        status: this.statusIndex ? this.statusIndex - 1 : '',
        type: this.isBoss ? 2 : 1
      }).then(res => {
        this.list = res.data.results
        this.total = res.data.totalRecord
      })
    },
    status2text (status, isRecharge, isBoss) {
      let statusText = ''
      switch (status) {
        case 0:
          if (isBoss) {
            statusText = '等待中'
          } else {
            if (isRecharge) {
              statusText = '选择支付方式'
            } else {
              statusText = '选择收款方式'
            }
          }
          break
        case 1:
          if (isBoss) {
            if (isRecharge) {
              statusText = '等待收款'
            } else {
              statusText = '等待打款'
            }
          } else {
            if (isRecharge) {
              statusText = '等待打款'
            } else {
              statusText = '等待收款'
            }
          }
          break
        case 2:
          if (isBoss) {
            if (isRecharge) {
              statusText = '等待确认收款'
            } else {
              statusText = '等待对方确认收款'
            }
          } else {
            if (isRecharge) {
              statusText = '等待对方确认收款'
            } else {
              statusText = '等待确认收款'
            }
          }
          break
        case 3:
          statusText = '完成'
          break
        case 4:
          statusText = '取消'
          break
        case 5:
          statusText = '仲裁中'
          break
        case 6:
          statusText = '仲裁完成'
          break
      }

      return statusText
    },
    getAllOrder () {
      this.$fetch.post('/user/queryOrderNum').then(res => {
        const d = res.data
        let firstRow = []
        let all = []
        // 先把第一排的数量整出来
        firstRow = [
          d.deposit.numbers,
          d.draw.numbers,
          d.sell.numbers,
          d.buy.numbers,
        ]

        // 接着把第一排每个的子类型数量整出来
        all[0] = [
          d.deposit.numbers, // 总数量
          d.deposit.newnum, // 新创建订单数量
          d.deposit.givemoneynum, // 待确认数量
          d.deposit.doingzhongcainum, // 申诉中数量
          d.deposit.cancelnum, // 已取消
          d.deposit.finishnum, // 已完成
        ]

        this.firstRow = firstRow
      })
    }
  }
};
</script>

<style lang="less" scoped>
.order{
  // .hCenter;
  padding: 30px 0 100px;
  .left-menu{
    .shadow;
    width: 240px;
    a{
      .vCenter;
      justify-content: space-between;
      height: 60px;
      font-size: 18px;
      border-bottom: 1px solid @bc;
      padding: 0 15px 0 28px;
      color: #999;
      &.active{
        color: @blue;
      }
      .badge{
        background: @blue;
        color: #fff;
        border-radius: 20px;
        padding: 0 10px;
        line-height: 20px;
        font-size: 16px;
      }

    }
  }
  .right-content{
    .shadow;
    // width: 1050px;
    padding: 50px 70px 100px;
  }
  &-tab{
    font-size: 17px;
    color: #999;
    margin-bottom: 40px;
    .item{
      line-height: 50px;
      padding: 0 25px;
      cursor: pointer;
    }
    .hd{
      display: flex;
      border-bottom: 1px solid @bc;
      margin-bottom: 10px;
      .item{
        margin-bottom: -1px;
        border: 1px solid transparent;
        &.active{
          border-color: @bc;
          border-bottom-color: #fff;
          color: @blue;
          font-weight: bold;
        }
      }
    }
    .bd{
      display: flex;
      .item{
        padding: 0 20px;
      }
      .item.active{
        color: @blue;
        font-weight: bold;
      }
    }
  }
}
thead{
  color: #999;
}
table{
  // table-layout: fixed;
  text-align: center;
  td:first-child{
    padding-left: 0 !important;
  }
}
.ell{
  max-width: 110px;
  display: inline-block;
}
</style>
