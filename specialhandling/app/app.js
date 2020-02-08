/* global SENTRY_DSN_PROD SENTRY_DSN_DEV */

import Vue from 'vue';
import VueRouter from 'vue-router';
import { sync } from 'vuex-router-sync';
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';
import Vueoom from 'vueoom/dist/vueoom.es.js';
import 'vueoom/dist/vueoom.css';
import VueSignature from "vue-signature";
import VTooltip from 'v-tooltip';

import router from '@/router.js';
import store from '@/store';
import filters from '@/utils/filters';

// Lets use everything so that vue can use it. Yes.
Vue.use(VueRouter);
Vue.use(Vueoom);
Vue.use(VueSignature);
Vue.use(VTooltip);
Vue.use(filters);

// Sync up the router as a vuex module
sync(store, router);

// Sentry Configuration
// The `SENTRY_DSN_*` variables are defined in the webpack config. `raven-js` uses the public dsn for the project.
let sentryDsn = window.location.hostname == 'specialhandling.fso.arizona.edu'
    ? SENTRY_DSN_PROD
    : SENTRY_DSN_DEV;

Raven
    .config(sentryDsn)
    .addPlugin(RavenVue, Vue)
    .install();

// Import the main app styles
import '@/sass/app.scss';

new Vue({
    el: '#app',
    template: `
        <transition name="fade" mode="out-in">
            <router-view></router-view>
        </transition>
    `,
    router,
    store
});
