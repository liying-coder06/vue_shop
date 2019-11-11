<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning"></el-alert>
      <div>
        请选择商品分类：
        <el-cascader
          v-model="selectedKeys"
          :options="cateList"
          :props="{ expandTrigger: 'hover' ,label: 'cat_name',value: 'cat_id'}"
          @change="handleChange"
        ></el-cascader>
      </div>

      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态属性" name="many">
          <el-button :disabled="isDisabled" type="primary" @click="showAddDialog">添加属性</el-button>
          <el-table :data="manyTableData" stripe border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="removeInput(id, scope.row)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  class="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  class="el-icon-delete"
                  size="mini"
                  @click="removeCate(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button :disabled="isDisabled" type="primary" @click="showAddDialog">添加属性</el-button>
          <el-table :data="onlyTableData" stripe border>
            <el-table-column type="expand"></el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  class="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  class="el-icon-delete"
                  size="mini"
                  @click="removeCate(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加属性对话框 -->
    <el-dialog
      :title="'添加'+currentTtitle"
      :visible.sync="addAttrDialogVisible"
      width="50%"
      @close="reseAddAttrForm"
    >
      <el-form
        :model="addAttrForm"
        :rules="addAttrFormRules"
        ref="addAttrFormRef"
        label-width="100px"
      >
        <el-form-item :label="currentTtitle" prop="attr_name">
          <el-input v-model="addAttrForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addAttrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addAttr">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改属性对话框 -->
    <el-dialog
      :title="'添加'+currentTtitle"
      :visible.sync="editAttrDialogVisible"
      width="50%"
      @close="reseteditAttrForm"
    >
      <el-form
        :model="editAttrForm"
        :rules="addAttrFormRules"
        ref="editAttrFormRef"
        label-width="100px"
      >
        <el-form-item :label="currentTtitle" prop="attr_name">
          <el-input v-model="editAttrForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editAttrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAttr">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  created() {
    this.getCateList();
  },
  data() {
    return {
      cateList: [],
      selectedKeys: [],
      activeName: "many",
      onlyTableData: [],
      manyTableData: [],
      addAttrDialogVisible: false,
      addAttrForm: {
        arrt_name: ""
      },
      addAttrFormRules: {
        attr_name: [
          { required: true, message: "请输入动态属性名称", trigger: "blur" },
          { min: 2, max: 10, message: "长度要求在2-10位之间", trigger: "blur" }
        ]
      },
      editAttrDialogVisible: false,
      editAttrForm: {
        arrt_name: ""
      }
    };
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200)
        return this.$message.error("获取分类列表失败");
      this.cateList = res.data;
      console.log(this.cateList);
    },
    handleChange(value) {
      this.getParamsData();
      this.manyTableData= [];
      this.onlyTableData = [];
    },

    handleClick() {
      this.getParamsData();
    },
    async getParamsData() {
      if (this.selectedKeys.length != 3) {
        this.selectedKeys = [];
        return;
      }
      //var cartid = this.selectedKeys[2];
      const { data: res } = await this.$http.get(
        `categories/${this.cartId}/attributes`,
        { params: { sel: this.activeName } }
      );
      if (res.meta.status != 200)
        return this.$message.error("获取参数信息失败");
      res.data.forEach(item => {
        if (item.attr_vals == "") {
          item.attr_vals = [];
        } else {
          item.attr_vals = item.attr_vals.split(",");
        }
        item.inputVisible = false;
        item.inputValue = "";
      });
      console.log(res.data);
      if (this.activeName == "only") {
        this.onlyTableData = res.data;
      } else {
        this.manyTableData = res.data;
      }
    },
    showAddDialog() {
      this.addAttrDialogVisible = true;
    },
    async addAttr() {
      // 表单校验
      this.$refs.addAttrFormRef.validate(async valid => {
        const { data: res } = await this.$http.post(
          `categories/${this.cartId}/attributes`,
          { attr_name: this.addAttrForm.attr_name, attr_sel: this.activeName }
        );
        if (res.meta.status != 201)
          return this.$message.error("添加动态分类失败");
        this.getParamsData();
        this.addAttrDialogVisible = false;
      });
    },
    reseAddAttrForm() {
      this.$refs.addAttrFormRef.resetFields();
    },
    reseteditAttrForm() {
      this.$refs.editAttrFormRef.resetFields();
    },
    showEditDialog(editInfo) {
      // 这里不需要发送ajax请求，因为scope.row中已经包含了当前数据的信息了
      this.editAttrForm = editInfo;
      this.editAttrDialogVisible = true;
    },
    async editAttr() {
      const { data: res } = await this.$http.put(
        `categories/${this.cartId}/attributes/${this.editAttrForm.attr_id}`,
        { attr_name: this.editAttrForm.attr_name, attr_sel: this.activeName }
      );
      if (res.meta.status != 200)
        return this.$message.error("修改分类信息失败");
      this.$message.success("修改成功");
      this.editAttrDialogVisible = false;
      this.getParamsData();
    },
    removeCate(id) {
      this.$confirm("此操作将永久删除当前属性, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `categories/${this.cartId}/attributes/${id}`
          );
          if (res.meta.status != 200)
            return this.$message.error("删除分类信息失败");
          this.$message.success("删除成功");
          this.getParamsData();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    async handleInputConfirm(row) {
      if (row.inputValue.trim == "") {
        row.inputVisible = false;
        row.inputValue = "";
        return;
      }
      row.attr_vals.push(row.inputValue);
      row.inputVisible = false;
      row.inputValue = "";

      const { data: res } = await this.$http.put(
        `categories/${this.cartId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(",")
        }
      );
      if (res.meta.status != 200) return this.$message.error("修改失败");
      this.$message.success("修改成功");
      //this.getParamsData();
    },
    showInput(row) {
      row.inputVisible = true;
      this.$nextTick(() => {
        //console.log(this.$refs.save)
      });
    },
    async removeInput(index, row){
      row.attr_vals.splice(index, 1);
       const { data: res } = await this.$http.put(
        `categories/${this.cartId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(",")
        }
      );
      if (res.meta.status != 200) return this.$message.error("修改失败");
      this.$message.success("修改成功");
      //this.getParamsData();
    }
  },
  computed: {
    isDisabled() {
      return this.selectedKeys.length != 3;
    },
    // 分类id
    cartId() {
      if (this.selectedKeys.length == 3) {
        return this.selectedKeys[2];
      }
    },
    currentTtitle() {
      if (this.activeName == "only") {
        return "静态属性";
      } else {
        return "动态属性";
      }
    }
  }
};
</script>
<style scoped lang="less">
.el-alert {
  margin-bottom: 20px;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 150px;
}
</style>    