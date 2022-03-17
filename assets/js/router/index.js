import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import LoginSignup from '../views/LoginSignup.vue';
import Lobby from '../views/Lobby.vue';
import GameView from '../views/GameView.vue';
import store from '../store/store.js';

Vue.use(VueRouter);

const routes = [
	{
		path: '/',
		name: 'Home',
		component: Home,
		beforeEnter: (to, from, next) => {
			if (store.state.auth.authenticated) {
				next();
			} else {
				next('/login');
			}
		}
	},
	{
		path: '/login',
		name: 'Login',
		component: LoginSignup

		// route level code-splitting
		// this generates a separate chunk (about.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
		// component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
	},
	{
		path: '/lobby/:gameId',
		component: Lobby
	},
	{
		path: '/game/:gameId',
		component: GameView,
	},
];

const router = new VueRouter({
	routes
});

export default router;
