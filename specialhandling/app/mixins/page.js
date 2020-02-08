/**
 * A mixin for common functions among the three main application pages, including selection,
 * quick search, columns panel utility functions. This relies on plenty of configuration in the data
 * of the page and that the grid api is accessible at the ref `grid`.
 */

import GridHelpers from '@/utils/gridHelpers';
import Browser from '@/utils/browserDetection';

export default {
    data () {
        return {
            searchString: '',
            showColumnSelect: false,
        };
    },
    computed: {
        /**
         * Returns column definitions from the grid
         * @returns {Object}
         */
        columnDefs () {
            return GridHelpers.getColumnDefs(this.grid);
        },
        /**
         * Returns column visiblity from the grid
         * @returns {Object}
         */
        displayedCols () {
            return GridHelpers.getDisplayDefs(this.grid);
        }
    },
    watch: {
        /**
         * Set a quick filter on the grid
         * @param {String} searchContent a string to filter the grid by
         */
        searchString: function (searchContent) {
            this.$refs.grid.gridOptions.api.setQuickFilter(searchContent);
        }
    },
    mounted () {
        this.screwIE();
    },
    methods: {
        /**
         * Get selected rows from the grid
         */
        onRowSelection () {
            this.grid.selectedRows = this.$refs.grid.gridOptions.api.getSelectedRows();
            if (this.grid.selectedRows && this.grid.selectedRows.length) {
                this.grid.hasSelectedRows = true;
            }
        },
        /**
         * Toggle selection in the grid by `single` or `multiple`
         * @param {String} mode selection type
         */
        toggleSelectionMode (mode) {
            if (this.grid.selectionMode !== mode) {
                this.grid.selectionMode = mode;
                this.$refs.grid.gridOptions.api.deselectAll();
                this.grid.selectedRows = null;
                this.grid.hasSelectedRows = false;
            }
        },
        /**
         * Select no rows in the grid
         */
        selectNone () {
            this.$refs.grid.gridOptions.api.deselectAll();
            this.grid.hasSelectedRows = false;
        },
        /**
         * Select all rows in the grid
         */
        selectAll () {
            this.$refs.grid.gridOptions.api.selectAllFiltered();
            this.grid.hasSelectedRows = true;
        },

        // Columns panel

        /**
         * Resize grid columns q 
         */
        async columnsResize () {
            await new Promise((resolve) => setTimeout(resolve, 500));
            try {
                GridHelpers.autoSizeColumns(this.$refs.grid.gridOptions, this.grid);
            } catch (err) {
                console.log(err);
                this.$toast({
                    title: "Error",
                    type: "danger",
                    message: err.message
                });
            }
        },

        /**
         * Toggle visibility of the column selection panel component
         */
        toggleColumnSelectPanel () {
            this.showColumnSelect = !this.showColumnSelect;
        },

        /**
         * Warn users if they are using IE, since it's unsupported. This requires a toast-group
         * on every page.
         */
        screwIE () {
            let browser = new Browser();
            if (browser.screwIE === true) {
                this.$toast({
                    type: 'warning',
                    content: `
                        <h4>Unsupported Browser</h4>
                        <span>This app may not function properly in Internet Explorer! Please use another browser such as Chrome, Edge, or Firefox.</span>`
                });
            }
        }
    }
};
