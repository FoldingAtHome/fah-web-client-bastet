import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import packageJson from './package.json'


export default defineConfig({
  preview: {port: 5173},

  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => ['tt', 'center'].includes(tag)
        }
      }
    })
  ],

  define: {
   'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version)
  }
})
