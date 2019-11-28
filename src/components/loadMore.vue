<template>
  <div class="load-list-wrap">
    <loading v-show="total < 0"></loading>
    <slot></slot>
    <div v-if="!list.length" class="empty">
      <img src="@img/empty.png" alt>
      <p>{{$t('common.empty')}}</p>
    </div>
    <div class="el-pagination-wrap" v-show="list.length">
      <el-pagination
        layout="prev, pager, next"
        @current-change="emit"
        :page-size="pageSize"
        :current-page.sync="pageIndex"
        :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      path: this.$route.path,
      pageIndex: 1
    }
  },
  props: {
    list: Array,
    total: Number,
    pageSize: {
      type: Number,
      default: 10
    }
  },
  methods: {
    emit(index) {
      this.$emit('change', index)
    }
  },
  created() {
    // 如果有历史记录的路由等于当前的路由就使用历史数据
    const history = this.$store.state.historyRecord
    if (history.path === this.$route.path) {
      this.$parent.list = history.list
      this.$parent.pageIndex = history.pageIndex
      this.$parent.total = history.total
      this.pageIndex = history.pageIndex
    } else {
      // 否则重新加载
      this.$emit('change', 1)
    }
  },
  beforeDestroy () {
    this.$store.commit('SET_LIST_RECORD', {
      path: this.path,
      list: this.list,
      y: document.scrollingElement.scrollTop,
      pageIndex: this.pageIndex
    })

  }
}
</script>

<style lang="less" scoped>
  .load-list-wrap{
    position: relative;
    min-height: 400px;
  }
</style>
