/* global module, require */

import Vue from 'vue';
import Vuex from 'vuex';

import checks from './modules/checks';
import comments from './modules/comments';

Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        checks,
        comments
    }
});

// Allow hot reloading of modules with webpack
if (module.hot) {
    module.hot.accept([
        './modules/checks',
        './modules/comments'
    ], () => {
        store.hotUpdate({
            modules: {
                /* eslint-disable */
                checks: require('./modules/checks').default,
                comments: require('./modules/comments').default
            }
        });
    });
}

export default store;
