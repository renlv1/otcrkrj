<template>
  <el-dialog class="d-form" :visible.sync="showDialog">
    <div class="d-tit">支付验证</div>
    <div class="input-wrap">
      <div class="label">交易密码</div>
      <input class="input" type="password" v-model="payPassword" placeholder="请输入交易密码" autocomplete="new-password">
    </div>
    <div class="input-wrap">
      <div class="label">请输入谷歌验证码</div>
      <input class="input" type="tel" v-model="payCode" placeholder="请输入谷歌验证码">
    </div>
    <button @click="submit" :disabled="!payPassword || !payCode" class="btn">提交</button>
  </el-dialog>
</template>
<script>
export default {
  data () {
    return {
      showDialog: false,
      payPassword: '',
      payCode: ''
    }
  },
  methods: {
    show () {
      this.showDialog = true
    },
    submit () {
      this.$emit('submit', this.payPassword, this.payCode)
    },
    cancel () {
      this.showDialog = false
      this.$emit('cancel')
    }
  }
}
</script>
