import {createRouter, createWebHistory} from 'vue-router'
import HomeView      from './HomeView.vue'
import SettingsView  from './SettingsView.vue'
import Visualization from './Visualization.vue'
import LogView       from './LogView.vue'


export default createRouter({
  history: createWebHistory(),
  routes: [
    {path: '/',         component: HomeView},
    {path: '/settings', component: SettingsView},
    {path: '/view/:id', component: Visualization, props: true},
    {
      path: '/log',
      component: LogView,
      props: route => ({query: route.query.q})
    },
  ]
})
