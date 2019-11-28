<template>
  <div class="chat-wrap" @keypress.enter.prevent="send">
    <div class="chat-head"><i class="state"></i>与<div class="ell">{{receive}}</div>聊天中</div>
    <div class="chat-body" ref="chatWrap">
      <div class="item" v-for="(item, index) in messageList" :key="index" :class="{self: item.receiveSystemCode === receive}">
        <span class="time" v-show="index === 0 || (item.createTime - messageList[index - 1].createTime > 100000)">{{item.createTime | time('-')}}</span>
        <div class="signle"><div class="message">{{item.messageBody}}</div><span class="el-icon-loading" v-if="item.hasLoading && !sendFinish"></span></div>
      </div>
    </div>
    <div class="chat-foot">
      <textarea placeholder="输入后按Enter发送" v-model="message"></textarea>
      <img src="@img/img_bg.png" @click="triggerUpload" alt="">
      <input type="file" ref="upload" @change="uploadImg" style="display:none">
    </div>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  props: {
    order: Object
  },
  data () {
    return {
      loading: false,
      message: '',
      id: this.$route.query.id,
      messageList: [],
      sendFinish: true
    }
  },
  computed: {
    receive () {
      const user = this.$store.state.user.userSystemCode
      if (user === this.order.userSystemCode) {
        return this.order.buySystemCode
      } else {
        return this.order.userSystemCode
      }
    },
    newMessage () {
      return this.$store.state.newMessage
    }
  },
  watch: {
    newMessage () {
      const newMessage = this.$store.state.newMessage
      const user = this.$store.state.user.userSystemCode
      // 如果新消息的订单id等于当前的订单id，就添加当前页面消息列表
      if (newMessage.messageId === this.id) {
        // 如果新消息的发送者是自己
        if (newMessage.sendSystemCode === user) {
          this.sendFinish = true
        } else {
          this.messageList.push(newMessage)
          this.scrollBottom()
        }
      }
    }
  },
  created () {
    this.getHistoryMessage()
  },
  methods: {
    send () {
      let msg = this.message
      let orderType = 0
      let messageData = null

      if (msg) {
        // 有buySystemCode说明是充值订单
        if (this.order.buySystemCode) {
          // 如果对方的code和userSystemCode一样，说明是用户订单， 否则为市商订单
          if (this.user === this.order.userSystemCode) {
            orderType = 1
          } else {
            orderType = 3
          }
        } else {
          if (this.user === this.order.userSystemCode) {
            orderType = 2
          } else {
            orderType = 4
          }
        }
        let messageData = {
          messageBody: msg, // 消息内容
          messageSource: 1, // 消息来源  1 聊天消息  2 系统消息  3 消息回执
          messageType: 1, // 消息类型 1.文字 2 图片 3 语音 4 视频 5 红包 6 文件
          receiveSystemCode: this.receive, // 消息接收方用户编码
          messageId: this.id, // 订单id
          orderType // 订单类型 1充值 2提现 3市商充值 4市商提现
        }
        // 判断消息是否发送成功
        let selfMessageData = {
          ...messageData,
          hasLoading: true,
          createTime: new Date().getTime()
        }
        this.seedFinish = false
        this.messageList.push(selfMessageData)
        this.message = ''
        socket.send(JSON.stringify(messageData))
        this.scrollBottom()
      }
    },
    htmlEncode (str) {
      let el = document.createElement('p')
      let output = ''
      el.appendChild(document.createTextNode(str))
      output = el.innerHTML
      el = null
      return output
    },
    scrollBottom () {
      const el = this.$refs.chatWrap
      if (el) {
        this.$nextTick(() => {
          el.scrollTop = el.scrollHeight
        })
      }
    },
    triggerUpload () {
      this.$refs.upload.click()
    },
    uploadImg (e) {
      console.log(e.target.value)
    },
    getHistoryMessage () {
      this.$fetch.post('/message/getOffLineMessage', {
        messageType: 2,
        orderId: this.id,
        pageIndex: 1,
        pageSize: 20,
        setRead: 2
      }).then(res => {
        if (res.success) {
          this.messageList = res.data.messageList ? res.data.messageList.reverse() : []
          this.scrollBottom()
        }
      })
    }
  },
  mounted() {

  }
}
</script>

<style lang="less" scoped>
  .chat-wrap{
    display: flex;
    flex-direction: column;
    height: 100%;
    font-size: 14px;
    .chat-head{
      padding: 20px;
      .state{
        width: 8px;
        height: 8px;
        background: #37fe3d;
        border-radius: 50%;
        margin-right: 5px;
        display: inline-block;
      }
    }
    .chat-body{
      flex: 1;
      border-top: 1px solid @bc;
      border-bottom: 1px solid @bc;
      padding: 30px 10px 0;
      overflow-y: auto;

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
      .item{
        text-align: center;
        margin-bottom: 20px;
        .el-icon-loading{
          font-size: 16px;
          margin: 0 5px;
          opacity: .5;
        }
        .signle{
          display: flex;
          align-items: center;
        }
        .time{
          border-radius: 10px;
          background: #f0f0f0;
          color: #aaa;
          font-size: 12px;
          display: inline-block;
          margin-bottom: 10px;
          padding: 5px 10px;
          transform: scale(.9);
        }
        .message{
          max-width: 92%;
          padding: 10px 16px;
          border-radius: 6px;
          border: 1px solid @bc;
          line-height: 1.4;
        }
        &.self{
          .signle{
            justify-content: flex-end;
          }
          .el-icon-loading{
            order: 1;
          }
          .message{
            order: 2;
            background: @blue;
            color: #fff;
            border: none;
          }
        }
      }
    }
    .chat-foot{
      position: relative;
      textarea{
        width: 100%;
        border: none;
        padding: 10px;
        padding-right: 60px;
        box-sizing: border-box;
        font-family: Arial;
        font-size: 14px;
        resize:none;
        &::-webkit-input-placeholder{
          color: #ccc;
        }
      }
      img{
        position: absolute;
        top: 17px;
        right: 20px;
      }
    }
  }
  .ell{
    max-width: 200px;
    display: inline-block;
    vertical-align: -2px;
  }

</style>
