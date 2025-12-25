<template>
  <div>
    <h1>仪表盘</h1>
    <el-row :gutter="20">
      <el-col
        :xs="24"
        :sm="8"
      >
        <el-card shadow="hover">
          <template #header>商品总数</template>
          <div class="stat-value">{{ stats.productCount }}</div>
        </el-card>
      </el-col>
      <el-col
        :xs="24"
        :sm="8"
        class="mt-xs-20"
      >
        <el-card shadow="hover">
          <template #header>总库存</template>
          <div class="stat-value">{{ stats.totalStock }}</div>
        </el-card>
      </el-col>
      <el-col
        :xs="24"
        :sm="8"
        class="mt-xs-20"
      >
        <el-card shadow="hover">
          <template #header>总出库单</template>
          <div class="stat-value">{{ stats.outboundCount }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { productApi } from "@/api/product";
import { inventoryApi } from "@/api/inventory";

const stats = ref({
  productCount: 0,
  totalStock: 0,
  outboundCount: 0,
});

onMounted(async () => {
  try {
    const products = await productApi.getList();
    stats.value.productCount = products.length;
    stats.value.totalStock = products.reduce(
      (sum, p) => sum + (Number(p.stock) || 0),
      0
    );

    const outbounds = await inventoryApi.getOrders("outbound");
    stats.value.outboundCount = outbounds.length;
  } catch (e) {
    console.error(e);
  }
});
</script>

<style scoped>
.stat-value {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  color: #409eff;
}
.mt-xs-20 {
  /* 仅在超小屏幕下增加 margin-top */
}
@media (max-width: 768px) {
  .mt-xs-20 {
    margin-top: 20px;
  }
}
</style>
