import VueRouter from 'vue-router';

import Home from '@/pages/Home.vue';
import SignedChecks from '@/pages/SignedChecks.vue';
import Signatures from '@/pages/Signatures.vue';

// Assign views to routes here
const routes = [
    { path: '/', redirect: '/home' },
    { path: '/home', component: Home, name: 'home' },
    { path: '/signed-checks', component: SignedChecks, name: 'signed-checks' },
    { path: '/signatures', component: Signatures, name: 'signatures' },
];

const router = new VueRouter({
    routes
});

router.beforeEach((to, from, next) => {
    // Get the Navbar's list of page navigation items
    const nav = document.getElementById("navbar-content").children[0];

    // Check the from, kill it's active in the navbar
    if (from.name && nav.children[from.name] !== undefined) {
        nav.children[from.name].classList.remove("active");
    }
    
    // Check the to, make it active in the navbar
    if (nav.children[to.name] !== undefined) {
        nav.children[to.name].classList.add("active");
    }

    next();
});

export default router;
