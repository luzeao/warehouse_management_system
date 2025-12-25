import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('../layout/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'products',
        name: 'ProductList',
        component: () => import('../views/ProductList.vue'),
        meta: { title: '商品管理' }
      },
      {
        path: 'inventory/inbound',
        name: 'InboundOrder',
        component: () => import('../views/InboundOrder.vue'),
        meta: { title: '入库单' }
      },
      {
        path: 'inventory/outbound',
        name: 'OutboundOrder',
        component: () => import('../views/OutboundOrder.vue'),
        meta: { title: '出库单' }
      },
      {
        path: 'logs',
        name: 'LogList',
        component: () => import('../views/LogList.vue'),
        meta: { title: '系统日志', role: 'admin' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 简单的路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
