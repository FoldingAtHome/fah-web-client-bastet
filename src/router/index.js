import { createRouter, createWebHistory } from 'vue-router'
import Units from '../components/Units.vue'
import UnderConstruction from '../components/UnderConstruction.vue'
import Details from '../components/Details.vue'

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
	},
	{
		path: '/todo',
		name: 'Todo',
		component: UnderConstruction
	}
]

const router = createRouter({
	history: createWebHistory(),
	routes
})

export default router
