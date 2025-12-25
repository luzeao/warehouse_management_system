<template>
  <div>
    <h2>系统日志</h2>
    
    <!-- 搜索和分页工具栏 -->
    <div class="toolbar">
        <el-input 
            v-model="searchQuery" 
            placeholder="搜索动作/详情/操作人" 
            style="width: 250px;" 
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

    <el-table :data="paginatedLogs" style="width: 100%">
        <el-table-column prop="created_at" label="时间" width="180">
            <template #default="scope">
                {{ new Date(scope.row.created_at).toLocaleString() }}
            </template>
        </el-table-column>
        <el-table-column prop="user_id" label="操作人" width="120" />
        <el-table-column prop="action" label="动作" width="120" />
        <el-table-column prop="details" label="详情" />
    </el-table>

    <div class="pagination">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filteredLogs.length"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { logApi } from '@/api/log'

const logs = ref([])
const searchQuery = ref('')
const dateRange = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)

onMounted(async () => {
    logs.value = await logApi.getLogs()
})

const filteredLogs = computed(() => {
    let res = logs.value
    
    if (searchQuery.value) {
        const lower = searchQuery.value.toLowerCase()
        res = res.filter(log => 
            (log.action && log.action.toLowerCase().includes(lower)) ||
            (log.details && log.details.toLowerCase().includes(lower)) ||
            (log.user_id && log.user_id.toLowerCase().includes(lower))
        )
    }

    if (dateRange.value && dateRange.value.length === 2) {
        const start = Number(dateRange.value[0])
        const end = Number(dateRange.value[1]) + 86400000 // Add 1 day to include the end date fully
        res = res.filter(log => {
             const t = new Date(log.created_at).getTime()
             return t >= start && t < end
        })
    }
    
    return res
})

const paginatedLogs = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredLogs.value.slice(start, end)
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
</script>

<style scoped>
.toolbar {
    margin-bottom: 15px;
}
.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}
</style>
