import { createRouter, createWebHistory } from 'vue-router'
import Units from '../views/Units.vue'

const routes = [
	{
		path: '/',
		name: 'Home',
		component: Units
	},
	{
		path: '/config',
		name: 'Config',
		component: () => import(/* webpackChunkName: "config" */ '../views/Config.vue')
	},
	{
		path: '/workunit',
		name: 'WorkUnit',
		component: () => import(/* webpackChunkName: "workunit" */ '../views/WorkUnit.vue')
	}
]

const router = createRouter({
	history: createWebHistory(),
	routes
})

export default router
