import Vue from 'vue';
import { config } from '@vue/test-utils';
/* eslint-disable */

// Configure jQuery
import $ from 'jquery';
global.$ = global.jQuery = $;

import './__utils__/helpers';

// Vue Config
Vue.config.silent = true;

// Silence modified components warnings. This just warns that any component mocks
// that are extended (Vue.extends()) need to be implemented in stubs rather than
// added via localVue().
config.logModifiedComponents = false;
