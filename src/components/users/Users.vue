<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索和添加区域 -->
      <el-row :gutter="20">
        <!-- 搜索框 -->
        <el-col :span="10">
          <el-input placeholder="请输入内容" v-model="userInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <!-- 添加按钮 -->
        <el-col :span="14">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 表格部分 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="索引" width="60px"></el-table-column>
        <el-table-column label="姓名" prop="username" width="100px"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <!-- 如果是布尔值,显示不出来的 -->
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="change(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页部分 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="userInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="userInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <!-- 添加用户表单部分 -->
      <el-form :model="addForm" :rules="addFormRoles" ref="addFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 添加用户按钮部分 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <!-- 编辑用户表单 -->
      <el-form :model="editForm" :rules="editFormRoles" ref="editFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 编辑用户按钮部分 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户角色对话框 -->
    <el-dialog title="修改用户角色" :visible.sync="showRoleDialogVisible" width="50%" class="setRole">
      <div>
        <p>当前用户名：{{userInfomation.username}}</p>
        <p>当前用户角色：{{userInfomation.role_name}}</p>
        <p>
          分配新角色
          <el-select v-model="selectRoleId" placeholder="请选择角色">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { log } from "util";
export default {
  created() {
    this.getUserList();
  },
  data() {
    var checkEmail = (role, value, callback) => {
      var regEmail = /^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/;
      if (!regEmail.test(value)) {
        return callback(new Error("邮箱不合法"));
      }
      callback();
    };
    var checkMobile = (role, value, callback) => {
      var regMobile = /^1(3|4|5|6|7|8|9)\d{9}$/;
      if (!regMobile.test(value)) {
        return callback(new Error("手机号不合法"));
      }
      callback();
    };
    return {
      userInfo: {
        query: "",
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      addFormRoles: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 5, max: 15, message: "长度在 5 到 15 个字符", trigger: "blur" }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      editDialogVisible: false,
      editForm: {},
      editFormRoles: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      userInfomation: {},
      showRoleDialogVisible: false,
      rolesList: [],
      selectRoleId: "" // 已选中的角色id
    };
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.userInfo
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取用户列表失败");
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    handleSizeChange(newSize) {
      console.log(newSize);
      this.userInfo.pagesize = newSize;
      this.getUserList();
    },
    handleCurrentChange(newPage) {
      console.log(newPage);
      this.userInfo.pagenum = newPage;
      this.getUserList();
    },
    async change(userInfo) {
      console.log(userInfo.id, userInfo.status);
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      );
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("状态修改失败");
      }
      return this.$message.success("修改成功");
    },
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
    },
    addUser() {
      // 表单预校验
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return console.log("表单校验失败");
        console.log("表单校验成功");
        const { data: res } = await this.$http.post("users", this.addForm);
        if (res.meta.status != 201) return this.$message.error("添加失败");
        this.getUserList();
        this.addDialogVisible = false;
      });
    },
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`users/${id}`);
      if (res.meta.status != 200)
        return this.$message.error("获取用户信息失败");
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    editUser() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return console.log("验证失败");
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          { email: this.editForm.email, mobile: this.editForm.mobile }
        );
        if (res.meta.status != 200)
          return this.$message.error("用户信息修改失败");
        // 隐藏修改信息对话框
        this.editDialogVisible = false;
        // 重新加载用户列表页面
        this.getUserList();
        // 提示用户信息修改成功
        this.$message.success("用户信息修改成功");
      });
    },
    removeUserById(id) {
      this.$confirm("此操作将永久删除用户信息, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          const { data: res } = await this.$http.delete("users/" + id);
          if (res.meta.status != 200)
            return this.$message.error("删除用户失败");
          this.$message.success("删除成功!");
          this.userInfo.pagenum = 1;
          this.getUserList();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    async setRole(userInfo) {
      this.userInfomation = userInfo;
      this.showRoleDialogVisible = true;
      // 获取角色列表
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status != 200)
        return this.$message.error("获取角色列表失败");
      this.rolesList = res.data;
    },
    async saveRole() {
      console.log(this.selectRoleId);
      if (!this.selectRoleId) return this.$message.info("请选择用户角色");
      const { data: res } = await this.$http.put(
        `users/${this.userInfomation.id}/role`,
        { rid: this.selectRoleId }
      );
      if (res.meta.status !== 200)
        return this.$message.error("修改用户角色失败");
      this.$message.success("修改用户角色成功");
      this.getUserList();
      this.showRoleDialogVisible = false;
      this.selectRoleId = '';
    }
  }
};
</script>
<style scoped lang="less">
.setRole {
  p {
    margin: 18px 0;
  }
}
</style>