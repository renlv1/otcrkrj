<template>
  <div class="c-page">
    <load-more @change="getData" :list="list" :total="total">
      <div class="web-list">
        <table class="center">
          <thead>
            <tr>
              <td>订单号</td>
              <td>单价</td>
              <td>成交/挂单金额</td>
              <td>挂单时间</td>
              <td>订单状态</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in list" :key="index">
              <td>{{item.id}}</td>
              <td>{{item.rate | f}}CNY</td>
              <td>{{item.tradetotal - item.subtotal | f}}/{{item.tradetotal | f}}CNY</td>
              <td>{{item.createtime | time('/')}}</td>
              <td>
                <span v-if="item.status === 1">未完成</span>
                <span v-if="item.status === 2">已完成</span>
                <span v-if="item.status === 3">取消</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </load-more>
  </div>
</template>

<script>
export default {
  props: ['url'],
  data() {
    return {
      list: [],
      total: -1
    };
  },
  methods: {
    getData(pageIndex) {
      this.$fetch.post(this.url, {
        pageIndex,
        pageSize: 10
      }).then(res => {
        this.list = res.data.results
        this.total = res.data.totalRecord
      })
    }
  }
};
</script>
