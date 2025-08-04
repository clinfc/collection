import '@/assets/main.css'
import 'element-plus/theme-chalk/base.css'
import 'element-plus/theme-chalk/el-message-box.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
