<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-alert title="添加商品信息" type="info" center show-icon></el-alert>
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="动态属性"></el-step>
        <el-step title="静态属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="{ expandTrigger: 'hover' ,label: 'cat_name', value:'cat_id'}"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="动态属性" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id"></el-form-item>
          </el-tab-pane>
          <el-tab-pane label="静态属性" name="2">静态属性</el-tab-pane>
          <el-tab-pane label="商品图片" name="3">商品图片</el-tab-pane>
          <el-tab-pane label="商品内容" name="4">商品内容</el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>
<script>
export default {
  created() {
    this.getCateList();
  },
  data() {
    return {
      activeIndex: "0",
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        goods_cat: [
          { required: true, message: "请输入商品分类", trigger: "blur" }
        ]
      },
      cateList: [],
      manyTableData: []
    };
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status != 200) return this.$message.error("获取列表失败");
      this.cateList = res.data;
    },
    handleChange() {
      if (this.addForm.goods_cat.length < 3) {
        this.addForm.goods_cat = [];
        this.$message.error("只能选三级分类");
        return;
      }
    },
    beforeLeave(activeIndex, oldActiveIndex) {
      if (oldActiveIndex == "0" && this.addForm.goods_cat.length < 3) {
        this.$message.error("请先选择三级分类");
        return false;
      }
    },
    async tabClicked() {
      if (this.activeIndex == "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cartId}/attributes`,
          { params: { sel: "many" } }
        );
        // 
        res.data.forEach(item => {
          if (item.attr_vals == "") {
            item.attr_vals = [];
          } else {
            item.attr_vals = item.attr_vals.split(",");
          }
        });
        if (res.meta.status != 200) return this.$message.error("失败");
        this.manyTableData = res.data;
      }
    }
  },
  computed: {
    cartId() {
      return this.addForm.goods_cat[2];
    }
  }
};
</script>
<style lang="less">
.el-steps {
  margin: 20px 0;
}

.el-step__title {
  font-size: 12px !important;
}
</style>