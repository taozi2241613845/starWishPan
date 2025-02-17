import { createApp ,reactive,ref} from 'vue'
import App from './App.vue'
import router from './router'
import '@/assets/icon/iconfont.css'
import '@/assets/base.scss'
import VueCookies from 'vue-cookies'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia'
import { SliceUploader } from './components/uploader'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
// import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css';
const app = createApp(App)
app.use(router)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
//注册全局上传器
app.config.globalProperties.uploader = ref(new SliceUploader({target:'/chunkInfo/chunk'}));
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.mount('#app')

// app.use(ElementPlus)
