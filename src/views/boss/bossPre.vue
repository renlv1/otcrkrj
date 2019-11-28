<template>
  <div class="c-page pre">
    <h3>概览</h3>
    <div class="total">
      <div class="item">
        <p>累计接单：</p>
        <h4>{{detail.ordernum}}</h4>
      </div>
      <div class="item">
        <p>成单量：</p>
        <h4>{{detail.successorder}}</h4>
      </div>
      <div class="item">
        <p>成单率：</p>
        <h4>{{detail.rate}}</h4>
      </div>
    </div>
    <div class="info">
      <div class="item">
        <div class="label">联系电话</div>
        <h4>{{detail.mobile}}</h4>
      </div>
      <div class="item">
        <div class="label">联系邮箱</div>
        <h4>{{detail.email}}</h4>
      </div>
      <div class="item">
        <div class="label">保证金额度</div>
        <h4>{{detail.bond}}CNY <span class="cblue anim-wave" @click="showDialog = true">调整</span></h4>
      </div>
    </div>
    <el-dialog class="d-form" :visible.sync="showDialog">
      <div class="d-tit">修改保证金额度</div>
      <div class="input-wrap">
        <div class="label">保证金</div>
        <input type="text" v-model="amount" placeholder="请输入10000或10000的倍数">
        <div class="unit">CNY</div>
      </div>
      <div class="input-wrap">
        <div class="label">交易密码</div>
        <input type="password" v-model="tradePwd" autocomplete="new-password">
      </div>
      <div class="input-wrap">
        <div class="label">谷歌验证码</div>
        <input type="text" v-model="code">
      </div>
      <button class="btn big" :disabled="!amount || !tradePwd || !code" @click="submit">提交</button>
      <div class="cancel" @click="showDialog = false">取消</div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      showDialog: false,
      amount: '',
      tradePwd: '',
      code: ''
    }
  },
  computed: {
    detail () {
      const d = this.$store.state.allUserInfo.businessman || {}
      return d
    }
  },
  methods: {
    submit () {
      this.$fetch.post('/business/updateBond', {
        tradePwd: this.tradePwd,
        code: this.code,
        total: this.amount,
        loading: true
      }).then(res => {
        if (res.success) {
          this.$message.success('修改成功！')
          this.$store.dispatch('getBalance')
          this.showDialog = false
        } else {
          this.$message.error(res.msg)
        }
      })
    }
  }
};
</script>

<style lang="less" scoped>
.pre{
  line-height: 1.2;
  h3{
    font-size: 36px;
    margin-bottom: 30px;
  }
  h4{
    font-size: 22px;
    padding-top: 10px;
  }
  .total{
    padding-bottom: 30px;
    border-bottom: 1px solid @bc;
    margin-bottom: 30px;
    display: flex;
    .item{
      &+ .item{
        margin-left: 80px;
      }
    }
  }
  .info{
    .item{
      .label{
        color: #999;
      }
      margin-bottom: 40px;
    }
    .cblue{
      margin-left: 10px;
      font-size: 18px;
    }
  }
}
</style>

