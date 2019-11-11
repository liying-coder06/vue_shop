<template>
  <el-container class="home-container">
    <!-- 头部部分 -->
    <el-header>
      <div class="left">
        <img src="../assets/heima.png" alt />
        <h3>电商管理后台</h3>
      </div>
      <!-- 退出按钮 -->
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 主体部分 -->
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <a href="javascript:;" class="toggle_button" @click="toggleCollapse">|||</a>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="pink"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <el-submenu :index="item.id + '' " v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i class="iconfont" :class="iconObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item
              :index="'/' +subItem.path "
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="toggleActivePath('/' +subItem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
import { log } from "util";
export default {
  name: "home",
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem("activePath");
  },
  // 数据一定要在data中初始化, 否则不是响应式
  data() {
    return {
      menuList: [],
      iconObj: {
        "125": "icon-users",
        "103": "icon-tijikongjian",
        "101": "icon-3702mima",
        "102": "icon-danju",
        "145": "icon-baobiao"
      },
      isCollapse: false,
      activePath: ""
    };
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status != 200) return this.$message(res.meta.msg);
      this.menuList = res.data;
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    toggleActivePath(activePath) {
      this.activePath = activePath;
      window.sessionStorage.setItem("activePath", activePath);
    }
  }
};
</script>
<style scoped lang="less">
.home-container {
  height: 100%;
  .el-header {
    background: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 0;
    color: #fff;
    font-size: 20px;
    .left {
      display: flex;
      align-items: center;
      h3 {
        font-weight: 400;
        margin-left: 20px;
      }
    }
  }
  .el-aside {
    background: #333744;
  }
  .el-main {
    background: #eaedf1;
  }
  .el-button {
    float: right;
  }
}
.iconfont {
  margin-right: 10px;
}
.el-menu {
  border-right: none;
}
.toggle_button {
  display: block;
  height: 24px;
  line-height: 24px;
  font-size: 12px;
  text-align: center;
  color: #fff;
  background-color: #445566;
  letter-spacing: 4px;
  text-decoration: none;
}
</style>