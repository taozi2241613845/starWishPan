import { defineConfig } from 'vite'
import {fileURLToPath,URL} from 'node:url'
import vue from '@vitejs/plugin-vue'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ],
  resolve :{
    alias:{
      '@': fileURLToPath(new URL('./src' ,import.meta.url))
    }
  },
  server:{
    port:1024,
    hmr:true,
    proxy:{
      "/api":{
        target: "http://localhost:7090",
        changeOrgin: true,
        pathRewrite:{
          "api": "/api"
        }
      }
    }
  },
  
})
