<template>
  <div class="common-layout">
    <el-container>
      <el-aside
        width="220px"
        class="hidden-xs-only app-aside"
      >
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          router
          background-color="#001529"
          text-color="rgba(255, 255, 255, 0.65)"
          active-text-color="#fff"
        >
          <div class="logo">
            <el-icon class="logo-icon"><Box /></el-icon>
            <span class="logo-text">库存管理系统</span>
          </div>

          <el-menu-item index="/dashboard">
            <el-icon><DataBoard /></el-icon>
            <span>控制台</span>
          </el-menu-item>

          <el-sub-menu index="products">
            <template #title>
              <el-icon><Goods /></el-icon>
              <span>商品管理</span>
            </template>
            <el-menu-item index="/products">商品管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="inventory">
            <template #title>
              <el-icon><Box /></el-icon>
              <span>库存管理</span>
            </template>
            <el-menu-item index="/inventory/inbound">入库管理</el-menu-item>
            <el-menu-item index="/inventory/outbound">出库管理</el-menu-item>
          </el-sub-menu>

          <el-menu-item
            index="/logs"
            v-if="userRole === 'admin'"
          >
            <el-icon><List /></el-icon>
            <span>系统日志</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header class="app-header">
          <div class="header-left">
            <div class="toggle-menu md-only">
              <el-button
                @click="drawer = true"
                icon="Menu"
                circle
                text
              />
            </div>
            <el-breadcrumb
              separator="/"
              class="hidden-xs-only"
            >
              <el-breadcrumb-item :to="{ path: '/' }">控制台</el-breadcrumb-item>
              <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>

          <div
            class="header-right"
            style="display: flex; align-items: center"
          >
            <el-dropdown trigger="click">
              <span class="el-dropdown-link user-profile">
                <el-avatar
                  :size="32"
                  class="user-avatar"
                  >{{ username.charAt(0).toUpperCase() }}</el-avatar
                >
                <span class="username">{{ username }}</span>
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <el-main class="app-main">
          <div class="main-content">
            <router-view v-slot="{ Component }">
              <transition
                name="fade-transform"
                mode="out-in"
              >
                <component :is="Component" />
              </transition>
            </router-view>
          </div>
        </el-main>
      </el-container>
    </el-container>

    <!-- 移动端抽屉菜单 -->
    <el-drawer
      v-model="drawer"
      title="菜单"
      direction="ltr"
      size="60%"
      class="mobile-drawer"
    >
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        router
        @select="drawer = false"
      >
        <el-menu-item index="/dashboard">
            <el-icon><DataBoard /></el-icon>
            <span>控制台</span>
          </el-menu-item>

          <el-sub-menu index="products">
            <template #title>
              <el-icon><Goods /></el-icon>
              <span>商品管理</span>
            </template>
            <el-menu-item index="/products">商品管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="inventory">
            <template #title>
              <el-icon><Box /></el-icon>
              <span>库存管理</span>
            </template>
            <el-menu-item index="/inventory/inbound">入库管理</el-menu-item>
            <el-menu-item index="/inventory/outbound">出库管理</el-menu-item>
          </el-sub-menu>

          <el-menu-item
            index="/logs"
            v-if="userRole === 'admin'"
          >
            <el-icon><List /></el-icon>
            <span>系统日志</span>
          </el-menu-item>
      </el-menu>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  DataBoard,
  Goods,
  Box,
  List,
  Menu,
  ArrowDown,
} from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const drawer = ref(false);

const activeMenu = computed(() => route.path);
const username = localStorage.getItem("username") || "User";
const userRole = localStorage.getItem("role") || "staff";

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  router.push("/login");
};
</script>

<style scoped>
.common-layout {
  height: 100vh;
  display: flex;
}
.el-container {
  height: 100%;
}

/* 侧边栏样式 */
.app-aside {
  background-color: #001529;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #002140;
  color: white;
  font-size: 18px;
  font-weight: 600;
  gap: 10px;
}
.logo-icon {
  font-size: 24px;
  color: #1677ff;
}

.el-menu {
  border-right: none;
}

/* 选中项样式优化 */
:deep(.el-menu-item.is-active) {
  background-color: #1677ff !important;
  color: #fff !important;
}

/* 顶部导航样式 */
.app-header {
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 9;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}
.user-profile:hover {
  background-color: rgba(0, 0, 0, 0.025);
}
.user-avatar {
  background-color: #1677ff;
  color: white;
}
.username {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
}

/* 主内容区域 */
.app-main {
  background-color: #f0f2f5;
  padding: 24px;
}

.main-content {
  /* 可以在这里添加最大宽度限制等 */
}

/* 过渡动画 */
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 响应式 */
@media (max-width: 768px) {
  .hidden-xs-only {
    display: none;
  }
  .md-only {
    display: block;
  }
  .app-main {
    padding: 16px;
  }
  .app-header {
    padding: 0 16px;
  }
}
@media (min-width: 769px) {
  .md-only {
    display: none;
  }
}
</style>
