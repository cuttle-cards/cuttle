import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import LoginSignup from '../views/LoginSignup.vue';
import Lobby from '../views/Lobby.vue';
import GameView from '../views/GameView.vue';
import Rules from '../views/Rules.vue';
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
	},
	{
		path: '/rules',
		name: 'Rules',
		component: Rules,
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
