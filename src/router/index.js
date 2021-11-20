import { createRouter, createWebHistory } from 'vue-router'
import Units from '../components/Units.vue'

const routes = [
	{
		path: '/',
		name: 'Home',
		component: Units
	},
	{
		path: '/config',
		name: 'Config',
		component: () => import(/* webpackChunkName: "config" */ '../components/Config.vue')
	},
	{
		path: '/workunit',
		name: 'WorkUnit',
		component: () => import(/* webpackChunkName: "workunit" */ '../components/WorkUnit.vue')
	}
]

const router = createRouter({
	history: createWebHistory(),
	routes
})

export default router
