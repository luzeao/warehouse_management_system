<template>
  <div>
    <h2>出库管理</h2>
     <div style="margin-bottom: 20px;">
        <el-button type="warning" @click="showAddDialog">新增</el-button>
    </div>

    <!-- 搜索和分页工具栏 -->
    <div class="toolbar">
        <el-input v-model="searchQuery" placeholder="搜索单号" style="width: 200px;" clearable @input="handleSearch" />
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
    
     <el-table :data="paginatedOrders" style="width: 100%">
        <el-table-column prop="order_no" label="单号" />
        <el-table-column prop="created_at" label="日期">
             <template #default="scope">
                {{ new Date(scope.row.created_at).toLocaleString() }}
            </template>
        </el-table-column>
        <el-table-column label="商品列表">
             <template #default="scope">
                {{ scope.row.items.length }} 
            </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
            <template #default="scope">
                <el-button link type="primary" @click="viewDetail(scope.row)">详情</el-button>
            </template>
        </el-table-column>
    </el-table>

    <div class="pagination">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filteredOrders.length"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="出库详情" width="500px">
        <el-descriptions :column="1" border>
            <el-descriptions-item label="单号">{{ currentOrder?.order_no }}</el-descriptions-item>
            <el-descriptions-item label="日期">{{ currentOrder ? new Date(currentOrder.created_at).toLocaleString() : '' }}</el-descriptions-item>
            <el-descriptions-item label="操作人">{{ currentOrder?.operator || '-' }}</el-descriptions-item>
        </el-descriptions>
        
        <el-table :data="currentOrder?.items || []" style="margin-top: 20px" border>
            <el-table-column label="商品名称">
                <template #default="scope">
                    {{ getProductName(scope.row.productId) }}
                </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="100" />
        </el-table>
    </el-dialog>

     <!-- 新建出库单弹窗 (逻辑与入库类似，但要减库存) -->
      <el-dialog v-model="dialogVisible" title="新增" width="90%" style="max-width: 600px">
        <el-form>
            <el-form-item label="单号">
                <el-input v-model="form.order_no" disabled placeholder="Auto Generated" />
            </el-form-item>
            
            <div v-for="(item, index) in form.items" :key="index" class="order-item">
                <el-select v-model="item.productId" placeholder="请选择" filterable>
                    <el-option v-for="p in products" :key="p.id" :label="p.name + ' (余:' + p.stock + ')'" :value="p.id" />
                </el-select>
                <el-input-number v-model="item.quantity" :min="1" />
                <el-button type="danger" icon="Delete" circle @click="removeItem(index)" />
            </div>
            <el-button type="dashed" @click="addItem" style="width: 100%; margin-top: 10px;">+ 新增</el-button>

        </el-form>
        <template #footer>
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="warning" @click="submitOrder">确定</el-button>
        </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { inventoryApi } from '@/api/inventory'
import { productApi } from '@/api/product'
import { logApi } from '@/api/log'
import { ElMessage } from 'element-plus'

const orders = ref([])
const products = ref([])
const dialogVisible = ref(false)
const detailVisible = ref(false)
const currentOrder = ref(null)
const searchQuery = ref('')
const dateRange = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)

const form = reactive({
    order_no: '',
    items: []
})

const loadData = async () => {
    orders.value = await inventoryApi.getOrders('outbound')
    products.value = await productApi.getList()
}

const filteredOrders = computed(() => {
    let res = orders.value
    
    if (searchQuery.value) {
        const lower = searchQuery.value.toLowerCase()
        res = res.filter(o => 
            o.order_no && o.order_no.toLowerCase().includes(lower)
        )
    }

    if (dateRange.value && dateRange.value.length === 2) {
        const start = Number(dateRange.value[0])
        const end = Number(dateRange.value[1]) + 86400000
        res = res.filter(o => {
           const t = new Date(o.created_at).getTime()
           return t >= start && t < end
        })
    }
    
    return res
})

const paginatedOrders = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredOrders.value.slice(start, end)
})

const handleSearch = () => {
    currentPage.value = 1
}

const handleSizeChange = (val) => {
    pageSize.value = val
    currentPage.value = 1
}

const handleCurrentChange = (val) => {
    currentPage.value = val
}

const getProductName = (id) => {
    const p = products.value.find(item => item.id === id)
    return p ? p.name : '未知商品'
}

const viewDetail = (row) => {
    currentOrder.value = row
    detailVisible.value = true
}

const showAddDialog = () => {
    form.order_no = 'OUT-' + Date.now()
    form.items = [{ productId: null, quantity: 1 }]
    dialogVisible.value = true
}

const addItem = () => {
    form.items.push({ productId: null, quantity: 1 })
}

const removeItem = (index) => {
    form.items.splice(index, 1)
}

const submitOrder = async () => {
    if (form.items.some(i => !i.productId)) {
        ElMessage.warning('请选择商品')
        return
    }

    // 检查库存是否充足
    for (const item of form.items) {
        const product = products.value.find(p => p.id === item.productId)
        if (!product || product.stock < item.quantity) {
             ElMessage.error(`商品 ${product?.name || ''} 库存不足`)
             return
        }
    }

    try {
        const orderData = {
            order_no: form.order_no,
            type: 'outbound',
            items: JSON.parse(JSON.stringify(form.items)),
            operator: localStorage.getItem('username'),
            created_at: new Date().toISOString()
        }
        
        await inventoryApi.createOrder(orderData)

         logApi.addLog('出库', `出库单 ${form.order_no}`)

        ElMessage.success('出库成功')
        dialogVisible.value = false
        loadData()
    } catch (e) {
        ElMessage.error('出库失败: ' + e.message)
    }
}

onMounted(loadData)
</script>

<style scoped>
.order-item {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
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
