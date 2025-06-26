import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from './Home_page.vue';
import  Main  from './Login_page.vue';
import NotFound from './Error.vue'; 
const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/',
    name: 'Login',
    component: Main,
  },
  {
    path: '/:pathMatch(.*)*', 
    name: 'NotFound',
    component: NotFound, 
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;