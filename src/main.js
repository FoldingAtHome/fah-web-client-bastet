import { createApp } from 'vue'
import App from './App.vue'
import './index.styl'
import 'bootstrap'
import '@popperjs/core/dist/umd/popper.min.js'
import router from './router'
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { fas } from '@fortawesome/free-solid-svg-icons'
import { dom } from "@fortawesome/fontawesome-svg-core";

library.add(fas);
dom.watch();

const app = createApp(App);

app.component("font-awesome-icon", FontAwesomeIcon);
app.use(router).mount('#app');
