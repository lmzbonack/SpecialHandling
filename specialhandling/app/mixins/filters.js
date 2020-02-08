/**
 * A mixin to handle common filtering functionality in the filtering components.
 */

export default {
    props: {
        /**
         * Reference to the grid api
         * @prop {Object} - ag grid api
         */
        gridApi: {
            type: Object,
            required: true
        },
        /**
         * Grid row data
         * @prop {Array} - row data used in ag grid 
         */
        rowData: {
            type: Array,
            required: true
        }
    },
    watch: {
        filters: {
            handler: function (filters) {
                let filterModel = {};
                for (let filter in filters) {
                    // if a filter isn't `''` or `null`, lets add it to the filter model. Custom filters
                    // use a `value` property instead of a standard filter model.
                    if (filters[filter].filter) {
                        filterModel[filter] = filters[filter];
                    } else if (filters[filter].value) {
                        filterModel[filter] = filters[filter];
                    }
                }
                // Apply all filters
                if (this.gridApi !== undefined) {
                    this.gridApi.setFilterModel(filterModel);
                    this.gridApi.onFilterChanged();
                } else {
                    console.warn("Grid Not Ready for Filtering");
                }
            },
            deep: true
        }
    },
    methods: {
        /**
         * Close the advanced search panel
         */
        close () {
            this.$emit('close');
        },
        /**
         * Filter the data by whether a person has been contacted or not
         * @param {String} val a stringified boolean, with `all` for indeterminate state
         */
        async filterByContacted (val) {
            if (val === 'true') {
                this.filters.contacted.value = 'true';
            } else if (val === 'false') {
                this.filters.contacted.value = 'false';
            } else if (val === 'all') {
                this.filters.contacted.value = 'none';
            }
        },
        /**
         * Filter the data by whether a check number exists or not
         * @param {String} val a stringified boolean, with `all` for indeterminate state 
         */
        filterByHasCheckNumber (val) {
            this.$emit('filterByHasCheckNumber', val);
        },
        /**
         * Filter the data by whether a check has been picked up or not
         * @param {String} val a stringified boolean, with `all` for indeterminate state 
         */
        filterByPickedUp (val) {
            if (val === 'true') {
                this.filters.picked_up.value = 'true';
            } else if (val === 'false') {
                this.filters.picked_up.value = 'false';
            } else if (val === 'all') {
                this.filters.picked_up.value = 'none';
            }
        },
        /**
         * Filter the data by User
         * @param {String} val a username 
         */
        filterByUser (val) {
            this.$emit('filterByUser', val);
        }
    }
};
