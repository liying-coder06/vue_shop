<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-button type="primary">添加用户</el-button>
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="item1 in scope.row.children" :key="item1.id" class="level_one">
              <el-col :span="5">
                <el-tag>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row v-for="item2 in item1.children" :key="item2.id">
                  <el-col :span="5">
                    <el-tag type="success">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="19">
                    <el-tag
                      type="danger"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row.id, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 权限分配对话框 -->
    <el-dialog title="权限分配" :visible.sync="rightDialogVisible" width="60%">
      <el-tree
        :data="rightList"
        :props="rightsProps"
        default-expand-all
        show-checkbox
        node-key="id"
        :default-checked-keys="defaultKeys"
        ref="mytree"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allocateRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  created() {
    this.getRolesList();
  },
  data() {
    return {
      rolesList: [],
      rightDialogVisible: false,
      rightList: [],
      rightsProps: {
        children: "children",
        label: "authName"
      },
      defaultKeys: [],
      checkedKeys: [],
      // 当前分配用户的id
      roleID: ""
    };
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status != 200)
        return this.$message.error("获取角色列表失败");
      this.rolesList = res.data;
    },
    removeRightById(roleId, rightId) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `roles/${roleId}/rights/${rightId}`
          );
          if (res.meta.status != 200) return this.$message.error("删除失败");
          this.$message.success("删除成功");
          this.getRolesList();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    async showRightDialog(role) {
      this.roleID = role.id;
      var keys = [];
      // role.children.forEach(item1=>{
      //   if(item1.children) {
      //     item1.children.forEach(item2=> {
      //       if(item2.children) {
      //         item2.children.forEach(item3=>{
      //           keys.push(item3.id);
      //         })
      //       }
      //     })
      //   }
      // })
      // 递归函数就是自己调用自己，要有结束条件，否则就是死递归，内存溢出
      function getId(obj) {
        obj.children.forEach(item => {
          if (!item.children) {
            keys.push(item.id);
          } else {
            getId(item);
          }
        });
      }
      getId(role);
      this.defaultKeys = keys;

      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status != 200)
        return this.$message.error("请求权限信息失败");
      this.rightList = res.data;
      this.rightDialogVisible = true;
    },
    async allocateRight() {
      this.checkedKeys = [
        ...this.$refs.mytree.getCheckedKeys(),
        ...this.$refs.mytree.getHalfCheckedKeys()
      ];
      var keysStr = this.checkedKeys.join(",");
      const { data: res } = await this.$http.post(
        `roles/${this.roleID}/rights`,
        { rids: keysStr }
      );
      if (res.meta.status != 200) return this.$message.error("分配权限失败");
      this.$message.success("分配权限成功");
      this.getRolesList();
      this.rightDialogVisible = false;
    }
  }
};
</script>
<style scoped lang="less">
.el-tag {
  margin: 10px;
}
.level_one {
  border-bottom: 1px solid #ccc;
}
</style>    