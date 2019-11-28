<template>
  <div class="c-page" @click="showSelect = false">
    <div class="crumb">
      <div class="wrap">
        <router-link class="cgray" to="/order">充值</router-link>
        <span class="el-icon-arrow-right"></span>
        <span class="cblue">订单详情</span>
      </div>
    </div>
    <div class="wrap">

      <div class="order-detail">
        <div class="intro">
          <div class="back" @click="$router.back()">
            <span class="el-icon-back"></span>返回
          </div>
          <div class="row number">
            <span>充值订单编号：{{detail.id}}</span>
            <span>下单时间 {{detail.createtime | time}}</span>
          </div>
          <div class="money">充值{{detail.total | f}} CNY</div>
          <div class="text">单价{{detail.rate | f}} CNY</div>
          <div class="text">需要支付金额<span class="cblue">{{detail.total * detail.rate | f}} CNY</span></div>
          <!--   0新创建 1选择支付方式（买家） 2已打款（买家） 3完成（卖家放款） 4取消 5仲裁完成   -->
          <div class="pay-list section" v-if="detail.status === 0">
            <p>选择支付方式</p>
            <el-radio-group v-model="radio">
              <div class="item" v-if="list.length">
                <el-radio :label="1">
                  <img :src="require(`@img/bank0.png`)" alt=""> 银行卡
                  <div class="select">
                    <div class="text" @click.stop.prevent="showSelect = !showSelect">
                      <span>{{selectedBank.realName}}</span>
                      <span>{{selectedBank.bankName}}</span>
                      <span>{{selectedBank.subBankName}}</span>
                      <span>{{selectedBank.bankNumber}}</span>
                      <span class="drop el-icon-caret-bottom"></span>
                    </div>
                    <div class="option-wrap" v-show="showSelect">
                      <div class="option" @click="selectedBank = item" :class="{active: selectedBank.id === item.id}" v-for="(item, index) in list" :key="index">
                        <span>{{item.realName}}</span>
                        <span>{{item.bankName}}</span>
                        <span>{{item.subBankName}}</span>
                        <span>{{item.bankNumber}}</span>
                      </div>
                    </div>
                  </div>
                </el-radio>
              </div>
              <div class="item" v-if="detail.alipayId">
                <el-radio :label="2"><img  :src="require(`@img/bank1.png`)" alt="">支付宝</el-radio>
              </div>
              <div class="item" v-if="detail.wechatId">
                <el-radio :label="3"><img  :src="require(`@img/bank2.png`)" alt="">微信支付</el-radio>
              </div>
            </el-radio-group>
            <div class="btn" @click="selectBank">确认</div>
            <div class="btn cancel" @click="cancel">取消</div>
          </div>
          <div class="bank-info section" v-if="sellBankAccount.id">
            <div class="t1">请向此账号进行转账</div>
            <div class="t2">
              <span>{{sellBankAccount.bankName}}</span>
              <span>{{sellBankAccount.subBankName}}</span>
              <span>{{sellBankAccount.realName}}</span>
              <span>{{sellBankAccount.bankNumber}}</span>
            </div>
            <div class="t3">*付款码：<b>{{detail.code}}</b>，转账时请在备注中填写付款码</div>

            <div v-if="detail.status === 1">
              <div class="btn" @click="gived">我已转账</div>
              <div class="btn cancel" @click="cancel">取消订单</div>
            </div>

            <div v-if="detail.status === 2">
              <div class="btn plain" >等待放款中</div>
              <div class="btn cancel" @click="showAppeal = true">申诉订单</div>
            </div>

            <div v-if="detail.status === 3">
              <div class="success-state"><img src="@img/success.png" alt="">交易完成</div>
              <div class="btn" @click="showAppeal = true">申诉订单</div>
            </div>
          </div>
          <div v-if="detail.status === 4">
            <div class="cancel-state"><img src="@img/close.png" alt="">交易已取消</div>
          </div>
          <appeal :problem="userProblem" v-if="showAppeal || detail.status === 5 || detail.status === 6"></appeal>
        </div>
        <div class="chat">
          <chat :order="detail"></chat>
        </div>
      </div>
      <loading v-if="!detail.id"></loading>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      detail: {},
      list: [],
      radio: 1,
      id: this.$route.query.id,
      selectedBank: {},
      showSelect: false,
      sellBankAccount: {},
      userProblem: '',
      showAppeal: false
    };
  },
  mounted() {
    this.getData()
  },
  components: {
    chat: require('@/components/chat').default,
    appeal: require('@/components/appeal').default
  },
  methods: {
    getData() {
      this.$fetch.post('/deposit/queryDepositOrderDetail', {
        depositorderid: this.id
      }).then(res => {
        if (res.success) {
          let payjson = res.data.payjson
          let list = JSON.parse(payjson)
          let bankList = []
          this.detail = res.data
          this.userProblem = res.data.problem || ''
          list.forEach(item => {
            if (item.bankType === 1) {
              bankList.push(item)
            } else if (item.bankType === 2) {
              this.detail.alipayId = item.id
            } else if (item.bankType === 3) {
              this.detail.wechatId = item.id
            }
          })

          this.list = bankList
          this.selectedBank = bankList[0]

          if (res.data.sellBankAccount) {
            this.sellBankAccount = JSON.parse(res.data.sellBankAccount)
          }
        }
      })
    },
    selectBank () {
      let bankId = ''
      let radio = this.radio
      if (radio === 1) {
        bankId = this.selectedBank.id
      } else if (radio === 2) {
        bankId = this.detail.alipayId
      } else if (radio === 3) {
        bankId = this.detail.wechatId
      }
      this.$confirm('确定选择此支付方式吗？').then(() => {
        this.$fetch.post('/deposit/changeDepositBankInfo', {
          bankinfoid: bankId,
          depositorderid: this.detail.id,
          paymethod: radio,
          loading: true
        }).then(res => {
          this.cb(res)
        })
      }).catch(() => {})
    },
    gived () {
      this.$confirm('确定已转账吗？').then(() => {
        this.$fetch.post('/deposit/doGiveMoney', {
          depositorderid: this.detail.id,
          loading: true
        }).then(res => {
          this.cb(res)
        })
      }).catch(() => {})
    },
    cancel () {
      this.$confirm('确定取消订单吗？').then(() => {
        this.$fetch.post('/deposit/cancelDepositOrder', {
          depositorderid: this.detail.id,
          loading: true
        }).then(res => {
          this.cb(res)
        })
      }).catch(() => {})
    },
    cb (res) {
      if (res.success) {
        this.getData()
      } else {
        this.$message.error(res.msg)
      }
    }
  }
};
</script>

<style lang="less" scoped>
.select{
  display: inline-block;
  margin-left: 30px;
  color: #666;
  width: 300px;
  position: relative;
  span{
    margin-right: 10px;
    &:empty{
      display: none;
    }
    &.drop{
      display: inline-block;
      color: @blue;
      vertical-align: 0px;
      font-size: 18px;
    }
  }
  .text{
    display: inline-block;
  }
  .option-wrap{
    position: absolute;
    background: #fff;
    border-radius: 4px;
    border: 1px solid #eee;
    box-shadow: 0 0 10px rgba(0,0,0,.15);
    top: 30px;
    padding: 10px 20px;
    .option{
      line-height: 40px;
      max-height: 300px;
      overflow: auto;
      &+.option{
        border-top: 1px solid #eee;
      }
      &.active{
        color: @blue;
        background: url(~@img/check2.png) no-repeat right center;
        padding-right: 20px;
        font-weight: bold;
      }
    }
  }
}
.text{
  margin-bottom: 24px;
}
.radio-text{
  font-size: 16px;
  margin-left: 10px;
}
</style>
