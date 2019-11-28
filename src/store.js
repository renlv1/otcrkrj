import Vue from 'vue'
import Vuex from 'vuex'
import api from '@/api/api'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: {},
    balance: '',
    allUserInfo: {},
    tabIndex: 0,
    historyRecord: {},
    showLoading: false,
    bossInfo: {},
    newMessage: {}
  },
  mutations: {
    SET_ACCOUNT (state, data) {
      state.user = data.user
      state.balance = data.userAccount.CNY.balance
      state.allUserInfo = data
    },
    CLEAR_ACCOUNT (state) {
      state.user = {}
    },
    SET_TAB_INDEX (state, data) {
      state.tabIndex = data
    },
    SET_LIST_RECORD (state, data) {
      state.historyRecord = data
    },
    SET_LOADING (state, data) {
      state.showLoading = data
    },
    SET_NEW_MESSAGE (state, data) {
      state.newMessage = data
    }

  },
  actions: {
    getBalance ({commit}) {
      api.post('/user/balance').then(res => {
        if (res.success) {
          commit('SET_ACCOUNT', res.data)
        }
      })
    }
  }
})
