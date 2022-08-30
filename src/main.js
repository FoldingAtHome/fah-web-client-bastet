import {createApp} from 'vue'
import App     from './App.vue'
import router  from './router'
import Button  from './Button.vue'
import Dialog  from './Dialog.vue'
import FAHLogo from './FAHLogo.vue'


const app = createApp(App);
app.use(router)
app.component('Button',  Button)
app.component('Dialog',  Dialog)
app.component('FAHLogo', FAHLogo)
app.mount('#app');
