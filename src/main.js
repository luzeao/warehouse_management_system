import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { initDB } from './utils/db'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// 初始化数据库
initDB().then(() => {
  console.log('Database initialized')
  app.mount('#app')
}).catch(err => {
  console.error('Failed to initialize database:', err)
  // 即使数据库失败也挂载应用，显示错误信息可能更好，但这里先简单处理
  app.mount('#app')
})
