<template>
  <div id="app" @click="globalClick">
    <input type="text" autocomplete="off" style="display:none;" />
    <input type="password" style="display:none;" />
    <div class="ajax-loading" v-show="$store.state.showLoading">
      <div class="loading-content">
        <img src="@img/loading2.gif" alt="">
        <p>正在提交中...</p>
      </div>
    </div>
    <web-header></web-header>
    <transition name="zoom">
      <router-view class="main-container"/>
    </transition>
    <div class="message-wrap" @click.stop>
      <div class="wrap2">
        <div class="message" @click="showList = true" :class="{active: chatTotal}">
          <img src="@img/message.png" alt="">{{chatTotal ? chatTotal : '消息'}}
        </div>
        <div class="list" :class="{active: showList}">
          <div class="tit hCenter">
            <img src="@img/message2.png" alt="">
            <span style="flex: 1">你有{{chatTotal}}条未读消息</span>
            <div class="el-icon-close" @click="showList = false"></div>
          </div>
          <div class="message-list">
            <div class="item" @click="jumpOrder(item)" v-for="(item, index) in chatList" :key="index">
              <i class="state"></i>
              <span class="name"><div class="ell">{{item.name}}</div></span>
              <span class="badge">{{item.items.length}}</span>
            </div>
            <div class="no-more">暂无更多消息</div>
          </div>
        </div>
      </div>
    </div>
    <web-footer></web-footer>
    <!-- <loading></loading> -->

  </div>
</template>
<script>
/* eslint-disable */
export default {
  data () {
    return {
      showList: false,
      chatList: [],
      chatTotal: 0,
      user: {}
    }
  },
  created() {
    this.login()
  },
  components: {
    webHeader: require('@/components/header').default,
    webFooter: require('@/components/footer').default
  },
  methods: {
    login () {
      let c = {
        username: 'to-xwj',
        userSystemCode: 'rMt98dMZ11GFfHinLFXHwFU1r2FtcopBF6',
        sign: 'be03cfc02e5b9ee7f63d5bbef7ad01f6',
        cookie: '123',
        authentication: 1,
      }
      let h = {
        username: 'happu',
        userSystemCode: 'sadsfdsfsdfdsfsdf',
        sign: '56f772577eae375d7f27f049f2dba214',
        cookie: '123',
        authentication: 1,
      }
      this.$fetch.post('/user/userlogin', h).then(res => {
        if (res.success) {
          this.user = res.data.user
          this.$store.dispatch('getBalance')
          this.initWebSocket()
          this.getHistoryMessage()
        }
      })
    },
    globalClick () {
      if (this.showList) {
        this.showList = false
      }
    },
    getHistoryMessage () {
      this.$fetch.post('/message/getOffLineMessage', {
        messageType: 1,
        setRead: 2
      }).then(res => {
        if (res.success) {
          this.chatTotal = res.data.totalRecord
          this.createGroup(res.data.messageList)
        }
      })
    },
    createGroup (list) {
      // 按订单id分组
      let group = []
      list.forEach((item) => {
        const index = group.findIndex(groupItem => item.messageId === groupItem.messageId)
        if (index > -1) {
          group[index].items.push(item)
        } else {
          group.push({
            name: item.sendSystemCode,
            orderType: item.orderType,
            messageId: item.messageId,
            items: [item]
          })

        }
      })
          console.log(group)
      this.chatList = group
    },
    initWebSocket () {
      const socket = new WebSocket(`ws://otc.3243243242.com/ws?code=${this.user.userSystemCode}&key=${this.user.nettyToken}`)

      socket.onopen = () => {
        console.log("连接服务器成功");
        heartCheck.start()
      }

      var heartCheck = {
        timeout: 5000,
        timeoutObj: null,
        reset: function () {
          clearInterval(this.timeoutObj)
          this.start()
        },
        start: function () {
          this.timeoutObj = setInterval(() => {
            if (socket.readyState === 1) {
              socket.send('ping')
            }
          }, this.timeout)
        }
      };

      socket.onmessage = e => {
        heartCheck.reset()
        let message = {}
        if (e.data.includes('receiveSystemCode')) {
          message = JSON.parse(e.data)
        }
        this.$store.commit('SET_NEW_MESSAGE', message)
        console.log(e.data)
      }

      socket.onclose = () => {
        console.log("服务器关闭");
        console.log("正式尝试重新连接");
        this.initWebSocket()
      }

      socket.onerror = () => {
        console.log("连接出错");
      }
      window.socket = socket
      window.onbeforeunload = function() {
        socket.close()
      }
    },
    jumpOrder (item) {
      let url = ''
      switch (item.orderType) {
        case 1:
          url = '/order/rechargeDetail' // 充值订单
          break
        case 2:
          url = '/order/withdrawDetail' // 提现订单
          break
        case 3:
          url = '/order/rechargeDetail' // 市商充值订单
          break
        case 4:
          url = '/order/rechargeDetail' // 市商提现订单
          break
        default:
          this.$message.error('找不到对应的订单类型！')
          return
      }
      this.showList = false
      this.$router.push(`${url}?id=${item.messageId}`)
    }
  }
};
</script>

<style lang="less">
@import "assets/css/reset.less";
@import "assets/css/common.less";
#app {
  font-size: 16px;
  color: #191919;
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
}
.message-wrap{
  position: fixed;
  bottom: 90px;
  right: 60px;
  z-index: 99;
  .wrap{
    position: relative;
  }
  .message{
    .vCenter;
    position: absolute;
    width: 150px;
    bottom: 0;
    right: 0;
    padding: 0 32px ;
    height: 60px;
    border-radius: 30px;
    background: #fff;
    box-shadow:  2px 2px 10px rgba(0,0,0,.15);
    color: #cfcfcf;
    border: 1px solid #cfcfcf;
    cursor: default;
    img{
      margin-right: 10px;
    }
    &.active{
      background: @blue;
      color: #fff;
      img{
        filter: brightness(100);
      }
    }
  }
  .list{
    position: absolute;
    bottom: 0;
    height: 0;
    right: 0;
    background: #fff;
    width: 370px;
    padding: 0 10px;
    transition: height .2s;
    overflow: hidden;
    &.active{
      height: 400px;
      .shadow;
    }
    .tit{
      .vCenter;
      padding: 18px 10px;
      font-size: 14px;
      border-bottom: 1px solid @bc;
      img{
        margin-right: 16px;
      }
    }
    .message-list{
      height: 310px;
      overflow: auto;
      margin-right: -8px;
      padding-right: 10px;
      margin-top: 10px;
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
    .item{
      padding: 18px 10px;
      border-bottom: 1px solid @bc;
      cursor: pointer;
      .vCenter;
      .name{
        flex: 1;
      }
      .state{
        width: 8px;
        height: 8px;
        background: #37fe3d;
        border-radius: 50%;
        margin-right: 5px;
        display: inline-block;
      }
      &:hover{
        background: #f9f9f9;
      }
      .badge{
        background: @blue;
        color: #fff;
        border-radius: 20px;
        padding: 0 10px;
        line-height: 22px;
        font-size: 16px;
      }
    }
    .no-more{
      text-align: center;
      font-size: 14px;
      color: #aaa;
      line-height: 50px;
    }
  }
}

.ajax-loading{
  position: fixed;
  z-index: 999999;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  .loading-content{
    position: absolute;
    width: 150px;
    height: 150px;
    background: rgba(0,0,0,.8);
    text-align: center;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .vCenter;
    flex-direction: column;
    justify-content: center;
    color: #fff;
    border-radius: 10px;
    padding-bottom: 0.2rem;
  }

  img{
    width: 80px;
    text-align: left;
    margin-bottom: .16rem;
  }
}
.main-container{
  min-height: calc(100vh - 79px);
}
.zoom-leave{
  display: none;
}
.zoom-enter-to{
  transition: .35s;
}
.zoom-enter{
  // transform: scale(.88);
  transform: translateY(5px);
  opacity: .2;
}

.v-modal{
  background: radial-gradient(#ebf4fd, #a7bcdc) !important;
}
</style>


