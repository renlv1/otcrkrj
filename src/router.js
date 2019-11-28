import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  linkActiveClass: 'active',
  routes: [
    {
      path: '/',
      redirect: '/recharge'
    },
    {
      path: '/recharge',
      component: require('./views/trade/recharge').default
    },
    {
      path: '/withdraw',
      component: require('./views/trade/withdraw').default
    },
    {
      path: '/applyBoss',
      component: require('./views/boss/applyBoss').default
    },
    {
      path: '/boss',
      component: require('./views/boss/boss').default,
      redirect: '/boss/bossPre',
      children: [
        {
          path: '/boss/bossPre',
          component: require('./views/boss/bossPre').default,
        },
        {
          path: '/boss/bossSetInfo',
          component: require('./views/boss/bossSetInfo').default,
        },
        {
          path: '/boss/bossSell',
          component: require('./views/boss/bossSell').default,
        },
        {
          path: '/boss/bossBuy',
          component: require('./views/boss/bossBuy').default,
        },
        {
          path: '/boss/bossSetInfo/bossSetting',
          component: require('./views/boss/bossSetting').default,
        }
      ]
    },
    {
      path: '/account',
      component: require('./views/account/account').default
    },
    {
      path: '/order',
      component: require('./views/account/order').default
    },
    {
      path: '/order/rechargeDetail',
      component: require('./views/account/rechargeDetail').default
    },
    {
      path: '/order/withdrawDetail',
      component: require('./views/account/withdrawDetail').default
    },
  ]
})

router.afterEach(() => {
  window.scrollTo(0, 0)
})

export default router
