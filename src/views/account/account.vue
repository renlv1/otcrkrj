<template>
  <div class="c-page">
    <div class="wrap">
      <div class="account-wrap">
        <div class="account">
          <div class="assets">
            <p>我的资产</p>
            <h3>{{$store.state.balance | f}} CNY  <span class="line anim-wave" @click="transfromAssets = true">划转</span></h3>
          </div>
          <div class="pay-list section">
            <p>我的交易账户</p>
            <div class="item">
              <div class="img"><img src="@img/bank1.png" alt=""> 支付宝</div>
              <template v-if="alipay.length">
                <div class="val">{{alipay[0].bankNumber}}</div>
                <div class="line anim-wave" @click="show(2, alipay[0].id)">修改</div>
              </template>
              <template v-else>
                <div class="val">未绑定</div>
                <div class="line anim-wave" @click="show(2)">立即绑定</div>
              </template>
            </div>
            <div class="item">
              <div class="img"><img src="@img/bank2.png" alt=""> 微信支付</div>
              <template v-if="wechat.length">
                <div class="val">{{wechat[0].bankNumber}}</div>
                <div class="line anim-wave" @click="show(3, wechat[0].id)">修改</div>
              </template>
              <template v-else>
                <div class="val">未绑定</div>
                <div class="line anim-wave" @click="show(3)">立即绑定</div>
              </template>
            </div>
            <div class="item last">
              <div class="img"><img src="@img/bank0.png" alt=""> 银行卡</div>
              <div class="bank-list">
                <div class="scroll-wrap">
                  <div v-for="(item, index) in bankList" :key="index" class="bank-item val">
                    <span>
                      <span>{{item.bankName}}</span>
                      <span>{{item.subBankName}}</span>
                      <span>{{item.bankNumber}}</span>
                    </span>
                    <span class="line anim-wave red delete" @click="deleteBank(item.id)">删除</span>
                  </div>
                </div>
                <div class="line anim-wave" style="margin:0;display:inline-block;" @click="show(1)">添加银行卡</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!--   添加银行卡   -->
      <el-dialog class="d-form add-bank" :visible.sync="showAddBank">
        <div class="d-tit" v-if="bankType === 2">{{this.bankId ? '修改' : '添加'}}支付宝账户</div>
        <div class="d-tit" v-else-if="bankType === 3">{{this.bankId ? '修改' : '添加'}}微信账户</div>
        <div class="d-tit" v-else>添加银行卡</div>
        <template v-if="bankType === 1">
          <div class="input-wrap">
            <div class="label">银行名称</div>
            <input type="text" v-model="bankName">
          </div>
          <div class="input-wrap">
            <div class="label">分行名称</div>
            <input type="text" v-model="subBankName">
          </div>
        </template>
        <template v-if="bankType !== 3">
          <div class="input-wrap">
            <div class="label">账户名称</div>
            <input type="text" v-model="realName">
          </div>
        </template>
        <div class="input-wrap">
          <div class="label" v-if="bankType === 2">支付宝账户</div>
          <div class="label" v-else-if="bankType === 3">微信账户</div>
          <div class="label" v-else>银行卡号</div>
          <input type="text" v-model="bankNumber">
        </div>
        <button style="margin-top: 30px;" class="btn big" :disabled="isDisabled()" @click="addBank">确定</button>
        <div class="cancel" @click="showAddBank = false">取消</div>
      </el-dialog>

      <!--   划转资产   -->
      <el-dialog class="d-form" :visible.sync="transfromAssets">
        <div class="d-tit">划转资产</div>
        <div class="transfrom-arrow">
          <span>OTC资产</span>
          <span class="el-icon-right arrow"></span>
          <span>RADR资产</span>
        </div>
        <div class="input-wrap">
          <div class="label">OTC资产</div>
          <input type="text" placeholder="资产余额4000.000">
          <div class="unit">CNY</div>
        </div>
        <div class="input-wrap">
          <div class="label">RADR资产</div>
          <input type="text" placeholder="资产余额4000.000">
          <div class="unit">CNY</div>
        </div>
        <div class="btn big">确认划转</div>
        <div class="cancel" @click="transfromAssets = false">取消</div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      transfromAssets: false,
      bankList: [],
      bankName: '',
      subBankName: '',
      realName: '',
      bankNumber: '',
      bankType: 0,
      showAddBank: false,
      alipay: [],
      wechat: [],
      bankId: ''
    };
  },
  mounted() {
    this.getBankList()
  },
  methods: {
    isDisabled () {
      const t = this
      if (t.bankType === 1) {
        return !t.bankName || !t.realName || !t.bankNumber
      } else if (t.bankType === 2) {
        return !t.realName || !t.bankNumber
      } else {
        return !t.bankNumber
      }
    },
    getBankList () {
      this.$fetch.post('/bankinfo/queryBankInfoList', {
        currency: 'CNY',
        pageIndex: 1,
        pageSize: 100,
      }).then(res => {
        if (res.success) {
          let list = res.data
          let wechatIndex = -1
          let alipayIndex = -1

          list.forEach((item, index) => {
            if (item.bankType === 2) {
              alipayIndex = index
            }
            if (item.bankType === 3) {
              wechatIndex = index
            }
          })

          this.alipay = alipayIndex !== -1 ? list.splice(alipayIndex, 1) : []
          this.wechat = wechatIndex !== -1 ? list.splice(wechatIndex, 1) : []
          this.bankList = list
        }
      })
    },
    addBank () {
      const type = this.bankType
      const url = this.bankId ? '/bankinfo/editBankInfo' : '/bankinfo/addBankInfo'
      let bankName = ''
      if (type === 2) {
        bankName = '支付宝'
      } else if (type === 3) {
        bankName = '微信支付'
      } else {
        bankName = this.bankName
      }
      this.$fetch.post(url, {
        bankType: type,
        currency: 'CNY',
        bankName,
        subBankName: this.subBankName,
        realName: this.realName,
        bankNumber: this.bankNumber,
        id: this.bankId,
        loading: true
      }).then(res => {
        this.bankId = ''
        if (res.success) {
          this.showAddBank = false
          this.$message.success('添加成功!')
          this.getBankList()
        } else {
          this.$message.error(res.msg)
        }
      }).catch(() => {
        this.bankId = ''
      })
    },
    deleteBank (bankInfoId) {
      this.$confirm('确认删除银行卡吗？').then(() => {
        this.$fetch.post('/bankinfo/delBankInfo', {
          bankInfoId
        }).then(res => {
          if (res.success) {
            this.$message.success('删除成功!')
            this.getBankList()
          }
        })
      })
    },
    show (type, bankId) {
      this.bankType = type
      this.bankName = ''
      this.subBankName = ''
      this.realName = ''
      this.bankNumber = ''
      this.showAddBank = true
      this.bankId = bankId
    }
  }
};
</script>

<style lang="less" scoped>

.account-wrap{
  padding: 30px 0 100px;
  .account{
    border: 1px solid @bc;
    border-radius: 4px;
    padding: 74px 50px 120px;
  }
  .line{
    margin-left: 20px;
    font-size: 14px;
    color: @blue;
    line-height: 27px;
    cursor: pointer;
    &.delete{
      color: red;
      visibility: hidden;
    }
  }
  .assets{
    font-size: 18px;
    border-bottom: 1px solid @bc;
    padding-left: 60px;
    margin-bottom: 24px;
    h3{
      font-size: 30px;
      padding: 10px 0 30px;
      .vCenter;
    }
    .line{font-size: 14px;}
  }
  .pay-list{
    padding-left: 60px;
    .item{
      margin-top: 30px;
      font-size: 16px;
      .vCenter;
      padding-bottom: 26px;
      line-height: 27px;
      &.last{
        align-items: flex-start;
      }
      .img{
        min-width: 170px;
        padding-right: 20px;
      }
      img{
        width: 27px;
        vertical-align: middle;
        margin: 0 10px 0;
      }
      .val{
        font-size: 14px;
      }
    }
    .add-bank{
      padding-left: 170px;
      margin-left: 0;
      margin-top: -22px;
      .line{
        display: inline-block;
        height: 22px;
      }
    }
  }
  .bank-item{
    .hCenter;
    span{
      margin-right: 20px;
      &:empty{display: none;}
    }
    &:hover{
      .delete{
        visibility: visible;
      }
    }
  }
}
.scroll-wrap{
  max-height: 300px;
  overflow: auto;
  &::-webkit-scrollbar{
    width: 5px;
  }
  &::-webkit-scrollbar-track{
    background-color: #F5F5F5;
  }
  &::-webkit-scrollbar-thumb{
    border-radius: 6px;
    background-color: #c3c3c3;
  }
}
.add-bank{
  .input-wrap{
    margin-bottom: 14px;
    .label{
      margin-bottom: 5px;
    }
    input{
      height: 40px !important;
    }
  }
}
.transfrom-arrow{
  .vCenter;
  justify-content: center;
  font-size: 20px;
  padding: 20px 0 40px;
  .arrow{
    width: 44px;
    height: 44px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    margin: 0 40px;
    font-size: 30px;
    color: @blue;
    .vCenter;
    justify-content: center;
  }
}
</style>
