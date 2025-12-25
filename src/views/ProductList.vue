<template>
  <div>
    <div class="header-actions">
      <h2>商品管理</h2>
      <el-button
        type="primary"
        @click="showAddDialog"
        >新增</el-button
      >
    </div>

    <!-- 搜索和分页工具栏 -->
    <div class="toolbar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索名称/SKU"
        style="width: 200px"
        clearable
        @input="handleSearch"
      />
      
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="margin-left: 10px; width: 260px;"
        @change="handleSearch"
        value-format="x"
      />
    </div>

    <el-table
      :data="paginatedProducts"
      style="width: 100%"
      v-loading="loading"
    >
      <el-table-column label="Image" width="100">
        <template #default="scope">
           <el-image 
             v-if="scope.row.image"
             style="width: 50px; height: 50px"
             :src="scope.row.image" 
             :preview-src-list="[scope.row.image]"
             preview-teleported
           />
           <span v-else>No Image</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="name"
        label="商品名称"
      />
      <el-table-column
        prop="sku"
        label="SKU"
      />
      <el-table-column
        prop="category"
        label="分类"
      />
      <el-table-column
        prop="price"
        label="价格"
      />
      <el-table-column
        prop="stock"
        label="库存"
      />
      <el-table-column
        prop="created_at"
        label="日期"
        width="160"
      >
        <template #default="scope">
          {{ scope.row.created_at ? new Date(scope.row.created_at).toLocaleDateString() : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="150"
      >
        <template #default="scope">
          <el-button
            size="small"
            @click="handleEdit(scope.row)"
            >编辑</el-button
          >
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filteredProducts.length"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 添加/编辑商品弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑' : '新增'"
      width="90%"
      style="max-width: 500px"
    >
      <el-form
        :model="form"
        label-width="80px"
      >
        <el-form-item label="图片">
          <input type="file" accept="image/*" @change="handleFileChange" />
          <div v-if="form.image" style="margin-top: 10px;">
             <el-image :src="form.image" style="width: 100px; height: 100px;" />
             <el-button type="text" @click="form.image = ''" style="color: red; margin-left: 10px;">Remove</el-button>
          </div>
          <div style="font-size: 12px; color: #999;">支持 jpg/png 格式</div>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="SKU">
          <el-input v-model="form.sku" />
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="form.category" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number
            v-model="form.price"
            :min="0"
          />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number
            v-model="form.stock"
            :min="0"
            :disabled="isEdit"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="saveProduct"
            >保存</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { productApi } from "@/api/product";
import { logApi } from "@/api/log";
import { ElMessage, ElMessageBox } from "element-plus";

const products = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const searchQuery = ref("");
const dateRange = ref(null);
const currentPage = ref(1);
const pageSize = ref(10);

const form = reactive({
  id: null,
  name: "",
  sku: "",
  category: "",
  price: 0,
  stock: 0,
  image: ""
});

const filteredProducts = computed(() => {
  let res = products.value;
  
  if (searchQuery.value) {
    const lower = searchQuery.value.toLowerCase();
    res = res.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(lower)) ||
        (p.sku && p.sku.toLowerCase().includes(lower))
    );
  }
  
  if (dateRange.value && dateRange.value.length === 2) {
    const start = Number(dateRange.value[0]);
    // 结束时间需要加一天（或者覆盖当天）
    // el-date-picker 返回的时间戳通常是0点
    const end = Number(dateRange.value[1]) + 86400000; 
    res = res.filter(p => {
       const t = new Date(p.created_at).getTime();
       return t >= start && t < end;
    });
  }
  
  return res;
});

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  if (file.size > 500 * 1024) {
     ElMessage.warning("图片大小建议小于 500kb");
  }
  
  const reader = new FileReader();
  reader.onload = (evt) => {
    form.image = evt.target.result;
  };
  reader.readAsDataURL(file);
};

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredProducts.value.slice(start, end);
});

const handleSearch = () => {
  currentPage.value = 1;
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
};

const fetchProducts = async () => {
  loading.value = true;
  try {
    products.value = await productApi.getList();
  } catch (e) {
    ElMessage.error("获取商品失败");
  } finally {
    loading.value = false;
  }
};

const showAddDialog = () => {
  isEdit.value = false;
  Object.assign(form, {
    id: null,
    name: "",
    sku: "",
    category: "",
    price: 0,
    stock: 0,
    image: ""
  });
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  isEdit.value = true;
  Object.assign(form, row);
  dialogVisible.value = true;
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm("确定删除该商品吗?", "提示", {
      type: "warning",
    });
    await productApi.delete(row.id);
    logApi.addLog("删除商品", `删除商品 ${row.name}`);
    ElMessage.success("删除成功");
    fetchProducts();
  } catch (e) {
    // cancel
  }
};

const saveProduct = async () => {
  try {
    const data = { ...form };
    // 简单校验
    if (!data.name || !data.sku) {
      ElMessage.warning("请填写必填项");
      return;
    }

    if (isEdit.value) {
      await productApi.update(data);
      logApi.addLog("更新商品", `更新商品 ${data.name}`);
    } else {
      delete data.id;
      await productApi.create(data);
      logApi.addLog("创建商品", `创建商品 ${data.name}`);
    }
    dialogVisible.value = false;
    ElMessage.success("保存成功");
    fetchProducts();
  } catch (e) {
    ElMessage.error("保存失败: " + e.message);
  }
};

onMounted(fetchProducts);
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.toolbar {
  margin-bottom: 15px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
