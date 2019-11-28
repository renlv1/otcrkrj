<template>
  <div class="c-page" @click="showSelect = false">
    <div class="crumb">
      <div class="wrap">
        <router-link to="">充值</router-link>
        <span class="el-icon-arrow-right"></span>
        <router-link to="">订单详情</router-link>
      </div>
    </div>
    <div class="wrap">
      <div class="order-detail">
        <div class="intro">
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
          <div class="bank-info section" v-else>
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
          <div class="appeal section" v-if="showAppeal">
            <!-- <div class="cblue mb20">请您提交相应证据（长时间不提交证据系统将判断为您的过失，将相应金额转账到对方账户中。）</div> -->
            <h4>提交申诉</h4>
            <div class="appeal-radio">
              <el-radio v-model="reason" label="1">未收到款</el-radio>
              <el-radio v-model="reason" label="2">收到金额与订单不符</el-radio>
              <el-radio v-model="reason" label="3">恶意下单</el-radio>
            </div>
            <div class="text-box">
              <textarea class="textarea tradingCenter-input" :placeholder="$t('appeal.text14')" v-model="problemContent" @input="textareaVal"></textarea>
              <div class="warm-num"><span class="text-count">{{descNum}}</span>/<i>500</i></div>
            </div>
            <div class="upload">
              <el-upload
                :action="`${path}/uploadfile/uploadimg`"
                list-type="picture-card"
                name="myfile"
                :limit="4"
                :on-success="getFileList"
                :on-remove="removeFileList"
                :on-preview="showImg"
                with-credentials>
                <i class="el-icon-plus"></i>
              </el-upload>
            </div>
            <button class="btn mt60" @click="showConfirm">提交申诉</button>
          </div>
        </div>
        <div class="chat">
          <chat></chat>
        </div>
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
      radio: 1,
      id: this.$route.query.id,
      selectedBank: {},
      showSelect: false,
      sellBankAccount: {},
      descNum: 0,
      type: parseInt(this.$route.query.type) || 1,
      isBoss: this.$route.query.isBoss,
      load: true,
      reason: '', // 申诉原因
      problemContent: '',
      imagesArr: [],
      userProblem: '',
      managerReply: [],
      bigImgSrc: '',
      showBigImg: false,
      path: process.env.VUE_APP_BASE_PATH,
      showAppeal: false
    };
  },
  mounted() {
    this.getData()
  },
  components: {
    chat: require('@/components/chat').default
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
    showConfirm () {
      if (!this.userProblem && !this.reason) {
        this.$message.error('请选择申诉原因！')
      } else if (!this.problemContent) {
        this.$message.error('请填写申诉内容！')
      } else {
        this.$confirm('确认提交申诉吗？').then(() => {
          let params = {
            orderid: this.id, // 订单ID
            ordertype: 1, // 申诉来源，1.充值，2:提现
            problemtype: this.userProblem ? this.userProblem.contentType : this.reason, // 申诉类型，1.未收到款 2.金额与订单不符 3.恶意下单
            content: this.problemContent, // 申诉内容
            img: JSON.stringify(this.imagesArr), // 图片
            loading: true
          }
          // 如果是被申诉人还要传问题id
          if (this.detail.problemId) {
            params.problemId = this.detail.problemId // 问题ID
          }
          this.$fetch.post('/problem/createProblem', params).then(res => {
            this.cb(res)
          })
        }).catch(() => {})
      }
    },
    cb (res) {
      if (res.success) {
        this.getData()
      } else {
        this.$message.error(res.msg)
      }
    },
    // 输入文字控制
    textareaVal () {
      this.descNum = this.problemContent.length
      this.noneContent = ''
      if (this.problemContent.length > 500) {
        this.descNum = 500
        this.problemContent = this.problemContent.substring(0, 500)
      }
    },
    getFileList (res, file, fileList) {
      this.transfterData(fileList)
    },
    removeFileList (file, fileList) {
      this.transfterData(fileList)
    },
    transfterData (fileList) {
      this.imagesArr = []
      fileList.forEach(item => {
        this.imagesArr.push({
          imageKey: item.name,
          imageUrl: item.response.data.fileName
        })
      })
    },
    showImg (src) {
      this.bigImgSrc = ''
      if (typeof src === 'string') {
        this.bigImgSrc = src
      } else {
        this.bigImgSrc = src.url
      }
      this.showBigImg = true
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
.appeal{
  &-radio{
    padding-top: 20px;
  }
}
.text-box{
  position: relative;
  padding-top: 20px;
  width: 380px;
  .textarea{
    width: 100%;
    line-height: 1.3;
    height: 150px;
    border-radius: 4px;
    font-size: 16px;
    padding: 10px 20px;
    font-family: Arial;
    box-sizing: border-box;
    border: 1px solid @bc;
    resize: none;
  }
  .warm-num{
    font-size: 16px;
    color: #999;
    position: absolute;
    z-index: 30;
    right: 14px;
    bottom: 14px;
  }
}
.radio-text{
  font-size: 16px;
  margin-left: 10px;
}
.img-list{
  padding: 20px 0;
  ul{
    display: flex;
  }
  li{
    border: 1px solid #384d9a;
    border-radius: 4px;
    overflow: hidden;
  }
  li + li{
    margin-left: 20px;
  }
  img{
    width: 98px;
    height: 98px;
  }
  @media @mob{
    img{
      width: 55px;
      height: 55px;
    }
  }
}
.view-big{
  font-size: 14px;
  opacity: .8;
}
</style>

<style lang="less">
  .upload{
  padding-top: 20px;
  .el-upload--picture-card{
    width: 60px;
    height: 60px;
    line-height: 56px;
    background: none;
    border: 1px dotted #999;
    .el-icon-plus{
      font-size: 30px;
      color: @blue;
      vertical-align: middle;
    }
  }
  .el-upload-list--picture-card{
    .el-upload-list__item{
      width: 60px;
      height: 60px;
      margin-right: 20px;
    }
  }
}
</style>
