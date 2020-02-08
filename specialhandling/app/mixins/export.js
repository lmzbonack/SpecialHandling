/**
 * This mixin encapsulates functionality for the export csv modal, which is shared among all three pages.
 * It requries that the `showCsvModal` data property exist, that the dropdown button uses the ref `exportDropdown`, and
 * that the grid api is accessible at ref `grid`.
 */

import GridHelpers from '../utils/gridHelpers';

export default {
    data () {
        return {
            isPrinting: false,
            showCsvModal: false
        };
    },
    methods: {
        /**
         * Opens the export modal component.
         */
        openExportCsvModal () {
            this.showCsvModal = true;
            this.$refs.exportDropdown.toggle();
        },
        /**
         * Closes the export modal component
         */
        closeCsvModal () {
            this.showCsvModal = false;
        },
        /**
         * Tweaks the page for best rendering while printing, and then triggers the browsers built-in printing process.
         */
        openPrintableVersion () {     
            this.isPrinting = true;
            this.$refs.exportDropdown.toggle();
            this.grid.gridOptions.enableFilter = false;
            this.$nextTick(() => {
                GridHelpers.autoSizeColumns(this.$refs.grid.gridOptions, this.grid);
                this.$refs.grid.gridOptions.api.redrawRows();
            });
            this.$nextTick(() => {
                window.print();
            });
            this.$nextTick(() => {
                this.isPrinting = false;
            });
            this.refreshGrid();
            this.$nextTick(() => {
                this.$refs.grid.gridOptions.api.redrawRows();
            });
        }
    }
};
