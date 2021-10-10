import { createApp } from 'vue'
import App from './App.vue'
import './index.styl'
import 'bootstrap'
import router from './router'

createApp(App).use(router).mount('#app')
