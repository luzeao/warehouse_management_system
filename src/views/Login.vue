<template>
  <div class="login-container">
    <div class="login-bg"></div>
    <el-card class="login-card">
      <div class="login-header">
        <div class="logo-circle">
            <el-icon><Box /></el-icon>
        </div>
        <h2>库存管理系统</h2>
        <p class="subtitle">专业的企业级库存解决方案</p>
      </div>
      
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" size="large" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" class="w-100 submit-btn" @click="handleLogin">
            {{ isRegister ? '注册并登录' : '登 录' }}
          </el-button>
        </el-form-item>
        <div class="actions">
           <el-button link type="primary" @click="isRegister = !isRegister">
             {{ isRegister ? '已有账号? 返回登录' : '没有账号? 免费注册' }}
           </el-button>
        </div>
      </el-form>
      
      <div v-if="isRegister" class="register-tip">
          <el-alert title="新注册用户默认为 Staff 角色" type="info" :closable="false" show-icon />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { userApi } from '@/api/user'
import { logApi } from '@/api/log'
import { User, Lock, Box } from '@element-plus/icons-vue'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)
const isRegister = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (isRegister.value) {
            // 注册
            await userApi.register(loginForm)
            ElMessage.success('注册成功，请登录')
            isRegister.value = false
        } else {
            // 登录
            const { token, user } = await userApi.login(loginForm.username, loginForm.password)
            
            localStorage.setItem('token', token)
            localStorage.setItem('username', user.username)
            localStorage.setItem('role', user.role)
            
            // 记录日志
            logApi.addLog('登录', `用户 ${user.username} 登录成功`)

            ElMessage.success('登录成功')
            router.push('/dashboard')
        }
      } catch (error) {
        console.error(error)
        ElMessage.error(error.message || '操作失败')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  position: relative;
  overflow: hidden;
}

/* 增加动态背景效果 */
.login-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%);
    opacity: 0.2;
    z-index: 0;
}

.login-card {
  width: 100%;
  max-width: 420px;
  z-index: 1;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo-circle {
    width: 48px;
    height: 48px;
    background: #1677ff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    color: white;
    font-size: 24px;
    box-shadow: 0 4px 10px rgba(22, 119, 255, 0.3);
}

.login-header h2 {
    margin: 0 0 8px;
    color: #1f1f1f;
    font-size: 24px;
}

.subtitle {
    margin: 0;
    color: #8c8c8c;
    font-size: 14px;
}

.login-form {
    padding: 0 10px;
}

.w-100 {
  width: 100%;
}

.submit-btn {
    height: 44px;
    font-size: 16px;
    margin-top: 10px;
}

.actions {
    text-align: center;
    margin-top: 16px;
}

.register-tip {
    margin-top: 20px;
}
</style>
