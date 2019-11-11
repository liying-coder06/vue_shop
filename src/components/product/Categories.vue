<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-button type="primary" @click="addCate">添加分类</el-button>
      <tree-table
        :data="cateList"
        :columns="columns"
        :expand-type="false"
        :selection-type="false"
        border
        stripe
        show-index
        index-text="索引"
      >
        <template slot="isDeleted" slot-scope="scope">
          <i class="el-icon-success" style="color: green;" v-if="scope.row.cat_deleted == false"></i>
          <i class="el-icon-error" style="color: red;" v-else></i>
        </template>
        <template slot="level" slot-scope="scope">
          <el-tag type="info" v-if="scope.row.cat_level == 0" size="mini">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level == 1" size="mini">二级</el-tag>
          <el-tag type="warning" v-else size="mini">三级</el-tag>
        </template>
        <template slot="oprate" slot-scope="scope">
          <el-button icon="el-icon-edit" type="primary" size="mini">编辑</el-button>
          <el-button icon="el-icon-delete" type="danger" size="mini">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="resetCateForm">
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="{ expandTrigger: 'hover' ,label: 'cat_name',value: 'cat_id',checkStrictly :true}"
            clearable
            @change="addCateChange"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveCate">确 定</el-button>
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
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      cateList: [],
      total: 0,
      columns: [
        { prop: "cat_name", label: "分类名称" },
        {
          prop: "cat_deleted",
          label: "是否有效",
          type: "template",
          template: "isDeleted"
        },
        {
          prop: "cat_level",
          label: "排序",
          type: "template",
          template: "level"
        },
        {
          label: "操作",
          type: "template",
          template: "oprate"
        }
      ],
      addCateDialogVisible: false,
      addCateForm: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          {
            required: true,
            message: "请输入活分类名称",
            trigger: "blur"
          },
          {
            min: 3,
            max: 10,
            message: "长度在3-10之间",
            trigger: "blur"
          }
        ]
      },
      parentCateList: [],
      selectedKeys: [] // 接受用户选择好的级联的值
    };
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取商品列表失败");
      this.cateList = res.data.result;
      this.total = res.data.total;
    },
    handleSizeChange(val) {
      this.queryInfo.pagesize = val;
      // 修改每页显示的数量之后之后要重新获取列表
      this.getCateList();
    },
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val;
      // 修改页码之后要重新获取列表
      this.getCateList();
    },
    async addCate() {
      this.addCateDialogVisible = true;
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status != 200) return this.$message.error("获取列表失败");
      this.parentCateList = res.data;
    },
    addCateChange() {
      if (this.selectedKeys.length == 0) {
        this.addCateForm.cat_pid = 0;
      } else {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
      }
      this.addCateForm.cat_level = 0;
    },
    resetCateForm() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
    async saveCate(){
      const {data: res} = await this.$http.post('categories',this.addCateForm);
      if(res.meta.status != 201) return this.$message.error("添加分类失败");
      this.getCateList();
      this.addCateDialogVisible = false;
  }
  }
};
</script>
<style scoped lang="less">
</style>


<style lang="less">
.el-cascader-menu {
  height: 240px;
}
</style>