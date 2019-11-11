import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcom from '@/components/Welcom.vue'
import Users from "@/components/users/Users.vue"
import Rights from "@/components/rights/Rights.vue"
import Roles from "@/components/rights/Roles.vue"
import Categories from "@/components/product/Categories.vue"
import Params from "@/components/product/Params.vue"
import Goods from "@/components/product/Goods.vue"
import GoodsAdd from "@/components/product/GoodsAdd.vue"
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home', component: Home, redirect: '/welcom', children: [
      { path: '/welcom', component: Welcom },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights},
      { path: '/roles', component: Roles},
      { path: '/categories', component: Categories},
      { path: '/params', component: Params},
      { path: '/goods', component: Goods},
      { path: '/goods/add', component: GoodsAdd},
    ]
  }
]

const router = new VueRouter({
  routes
})

//本质就是改写了element内部的push方法
//对错误进行了捕获
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

router.beforeEach(function (to, from, next) {
  // 如果用户想访问登录页面, 直接放行
  if (to.path == '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  // 如果用户访问其他页面, 判断是否登录, 没有登录, 强制跳转到登录页面
  if (!tokenStr) return next('/login')
  // 登录状态, 直接放行
  next()
})
export default router
