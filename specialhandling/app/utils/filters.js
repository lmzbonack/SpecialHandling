/**
 * Vue.js Filters
 * 
 * To add a new filter, apply it to the global `Vue` object in the `install  function, then it will
 * be added to the application on load.
 */

/**
 * Capitalize a string
 * @param {String} value a string to capitalize
 */
let capitalizeFilter =  function (value) {
    if (!value) return '';
    value = value.toString();
    return value.charAt(0).toUpperCase() + value.slice(1);
};

// Export as a plugin
const install = (Vue) => {
    Vue.filter('capitalize', capitalizeFilter);
};

export default {
    install
};
