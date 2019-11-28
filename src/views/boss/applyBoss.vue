<template>
  <div class="c-page">
    <div class="wrap">
      <div class="apply-boss">
        <div class="d-form" v-if="$store.state.user.isbusinessman === 1">
          <div class="d-tit">成为做市商</div>
          <div class="text">完善资料认证并提交保证金后，即可成为做市商。</div>
          <div class="input-wrap">
            <div class="label">联系电话：</div>
            <div class="row tel">
              <el-select
                class="tel-select"
                v-model="phoneCode">
                <el-option
                  v-for="(item, index) in options"
                  :key="index"
                  :label="item.code"
                  :value="item.code">
                </el-option>
              </el-select>
              <input type="text" v-model="phone">
            </div>
          </div>
          <div class="input-wrap">
            <div class="label">联系邮箱：</div>
            <input type="text" v-model="email">
          </div>
          <div class="input-wrap">
            <div class="label">保证金金额：</div>
            <p class="tips">您需要支付保证金以保障交易安全进行，交易的最高限额不能超过已支付保证金的金额，最低需要支付10000CNY保证金。</p>
            <input type="text" placeholder="请输入10000或10000的倍数"  v-model="total">
          </div>
          <div class="btn big" @click="submit">提交申请</div>
        </div>
        <div class="review-tips"  v-if="$store.state.user.isbusinessman === 3">
          <span class="el-icon-info"></span>  您的申请正在审核中，请耐心等待。
        </div>
      </div>
    </div>
    <pay-dialog ref="payDialog" @submit="payConfirm"/>
  </div>
</template>

<script>
import telCodeData from '@/assets/js/telcode.json'
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
      options: telCodeData,
      phoneCode: '86',
      phone: '',
      email: '',
      total: '',
    };
  },
  mounted() {
    // this.getData()
  },
  components: {
    payDialog: () => import('@/components/payDialog')
  },
  methods: {
    submit () {
      if (!/\d{11}/.test(this.phone)) {
        this.$message.error('请输入正确的手机号')
      } else if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(this.email)) {
        this.$message.error('请输入正确的邮箱地址')
      } else if (!this.total) {
        this.$message.error('请输入保证金金额')
      } else {
        this.$refs.payDialog.show()
      }

    },
    payConfirm (p1, p2) {
      this.$fetch.post('/business/doBusinessMan', {
        phoneCode: this.phoneCode,
        phone: this.phone,
        email: this.email,
        tradePwd: p1,
        code: p2,
        total: this.total,
      }).then(res => {
        if (res.success) {
          this.$message({
            type: 'success',
            message: '开通成功！',
            onClose: () => {
              this.$router.push('/boss/bossPre')
            }
          })
        } else {
          this.$message.error(res.msg)
        }
      })
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
.wrap{
  padding: 66px 0;
}
.apply-boss{
  .shadow;
  padding: 90px 0 100px;
  .d-form{
    width: 400px;
    margin: 0 auto;
  }
  .text{
    text-align: center;
  }
  .label{
    color: #000000;
  }
  .tips{
    font-size: 14px;
    color: #999;
    margin-bottom: 20px;
  }
  .tel{
    border: 1px solid #707070;
    border-radius: 4px;
    input{
      border: none;
    }
  }
}
.review-tips{
  padding: 10% 0;
  text-align: center;
  font-size: 32px;
  color: #bbb;
}
</style>
<style lang="less">
.tel-select{
  width: 150px;
  border-right: 1px solid #999;
  .el-input__inner{
    border: none;
  }
}
</style>

