<template>
  <div class="appeal">
    <div class="section">
      <div v-if="problem">
        <div class="text">申诉原因：
          <span v-if="problem.contentType === 1">未收到款</span>
          <span v-if="problem.contentType === 2">金额与订单不符</span>
          <span v-if="problem.contentType === 3">恶意下单</span>
        </div>
        <div class="text">详情描述： {{problem.content}}</div>
        <div class="img-list">
          <!-- <ul>
            <li @click="showImg(imgItem.imageUrl)" v-for="(imgItem,index) in problem.contentimg" :key="index"><img :src="imgItem.imageUrl" alt=""></li>
          </ul> -->
        </div>
        <div v-if="problem.replycontent">
          <div class="text" style="border-top: 1px dotted #ccc;padding-top: 30px;margin-top:30px;">{{problem.replySystemCode}}已提交申诉证据</div>
          <div class="text">详情描述： {{problem.replycontent}}</div>
          <div class="img-list">
            <!-- <ul>
              <li @click="showImg(imgItem.imageUrl)" v-for="(imgItem,index) in  problem.replyimg" :key="index"><img :src="imgItem.imageUrl" alt=""></li>
            </ul> -->
          </div>
          <div class="btn plain">系统处理中</div>
        </div>
        <div v-else>
          <div v-if="user === problem.userSystemCode">
            <div class="cblue">正在等待对方提交相关证据，请等待...</div>
            <div class="btn">取消申诉</div>
          </div>
          <div v-else>
            <div class="cblue mb20">请您提交相应证据（长时间不提交证据系统将判断为您的过失，将相应金额转账到对方账户中。）</div>
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
                :limit="5"
                :on-success="getFileList"
                :on-remove="removeFileList"
                :on-preview="showImg"
                with-credentials>
                <i class="el-icon-plus"></i>
              </el-upload>
            </div>
            <button class="btn mt60" @click="showConfirm">提交证据</button>
          </div>
        </div>
      </div>

      <div v-else>
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
            :limit="5"
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
    <div class="section" v-if="problem && problem.problemStatus === 2">
      <div>
        处理结果系统已处理，
        <span v-if="problem.backup2 === problem.userSystemCode">{{problem.userSystemCode}}</span>
        <span v-else>{{problem.replySystemCode}}</span>胜诉, 已退回充值金额
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      descNum: 0,
      reason: '', // 申诉原因
      problemContent: '',
      imagesArr: [],
      bigImgSrc: '',
      showBigImg: false,
      path: process.env.VUE_APP_BASE_PATH,
      showAppeal: false
    };
  },
  props: {
    problem: [String, Object],
  },
  computed: {
    user () {
      return this.$store.state.user.userSystemCode
    }
  },
  methods: {
    showConfirm () {
      if (!this.problem && !this.reason) {
        this.$message.error('请选择申诉原因！')
      } else if (!this.problemContent) {
        this.$message.error('请填写申诉内容！')
      } else {
        this.$confirm('确认提交申诉吗？').then(() => {
          let params = {
            orderid: this.id, // 订单ID
            ordertype: 1, // 申诉来源，1.充值，2:提现
            problemtype: this.problem ? this.problem.contentType : this.reason, // 申诉类型，1.未收到款 2.金额与订单不符 3.恶意下单
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
        this.$parent.getData()
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
.text{
  margin-bottom: 24px;
}
.radio-text{
  font-size: 16px;
  margin-left: 10px;
}
.img-list{
  margin: 20px 0;
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
