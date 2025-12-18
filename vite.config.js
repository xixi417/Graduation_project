import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import Pages from 'vite-plugin-pages'
import { Van } from '@element-plus/icons-vue'



export default defineConfig({
    plugins:[
      vue(),
      Pages({
      // 路由文件根目录（默认 src/pages）
        dirs: [{ dir: 'src/pages', baseRoute: './' }],
      // 支持的文件后缀
        extensions: ['vue'],
      // 忽略指定文件/目录（可选）
        exclude: ['**/components/*.vue'],
      
        importMode: 'async', // 异步导入（懒加载）
      })
     
     
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server:{
      port:5137,
      open:true,
      proxy:{
         // 匹配以 /api 开头的请求
        '/api':{
          target:'http://localhost:8080',//后端地址
          changeOrigin:true,
          rewrite:(path)=>path.replace(/^\/api/,'')
        }
      }
    },
    assetsInclude: ['**/*.svg'] 
})
