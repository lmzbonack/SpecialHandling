import Vue from 'vue';
import moment from 'moment';

/**
 * Automatically size all grid columns to fit to their content
 * @param {Object} vm the Vue component instance 
 * @param {Object} grid reference to the grid api 
 */
const autoSizeColumns = function (vm, grid) {
    if (grid == undefined)
        return;
    for (const objNum of grid.columnDefinitions) {
        if (objNum.hasOwnProperty('children')) {
            objNum.children.forEach( function(element) {
                if (element.hasOwnProperty('colId'))
                    vm.columnApi.autoSizeColumn(element.colId);
                else if (element.hasOwnProperty('field'))
                    vm.columnApi.autoSizeColumn(element.field);
            });
        }
        else if (objNum.hasOwnProperty('colId')) {
            vm.columnApi.autoSizeColumn(objNum.colId);
        }
        else if (objNum.hasOwnProperty('field')) {
            vm.columnApi.autoSizeColumn(objNum.field);
        }
    }
};

/**
 * Get column definitions from the grid
 * @param {Object} grid reference to the grid api
 */
const getColumnDefs = function (grid) {
    var colArray = [];
    for (const objNum of grid.columnDefinitions) {
        if (objNum.hasOwnProperty('children')) {
            objNum.children.forEach( function(element) {
                if (element.hasOwnProperty('colId'))
                    colArray.push({ 'headerName': element.headerName, 'field': element.colId });
                else
                    colArray.push({ 'headerName': element.headerName, 'field': element.field });
            });
        }
        else if (objNum.hasOwnProperty('colId')) {
            colArray.push({ 'headerName': objNum.headerName, 'field': objNum.colId });
        }
        else if (objNum.hasOwnProperty('field')) {
            colArray.push({ 'headerName': objNum.headerName, 'field': objNum.field });
        }
    }
    return colArray;
};

/**
 * Get displayed columns state from the grid
 * @param {Object} grid 
 */
const getDisplayDefs = function (grid) {
    const colObj = {};
    for (const objNum of grid.columnDefinitions) {
        if (objNum.hasOwnProperty('children')) {
            objNum.children.forEach( function(element) {
                var key = null;
                if (element.hasOwnProperty('colId'))
                    key = element.colId;
                else
                    key = element.field;
                colObj[key] = !element.hide;
            });
        }
        else if (objNum.hasOwnProperty('colId')) {
            const key = objNum.colId;
            colObj[key] = !objNum.hide;
        }
        else if (objNum.hasOwnProperty('field')) {
            const key = objNum.field;
            colObj[key] = !objNum.hide;
        }
    }
    return colObj;
};

/**
 * A cell renderer for ag-grid to render dates via `moment.js`
 */
const dateCellRenderer = Vue.extend({
    computed: {
        humanize () {
            if (this.params.value !== null) {
                return moment(this.params.value).format('M-D-YYYY, h:mm a');
            }
        }
    },
    template: `<p>{{ humanize }}</p>`
});

/**
 * A cell renderer for ag-grid to render the `check.check_identifier` field
 */
const checkIdCellRenderer = Vue.extend({
    computed: {
        humanize () {
            if (this.params.value == 'accounts payable') {
                return `Accounts Payable`;
            } else if (this.params.value == 'payroll') {
                return `Payroll`;
            } else {
                return this.params.value;
            }
        }
    },
    template: `<p>{{ humanize }}</p>`
});

/**
 * A cell renderer for ag-grid to render boolean values in a human readable manner
 */
const booleanCellRenderer = Vue.extend({
    computed: {
        humanize () {
            return this.params.value === true
                ? 'Yes'
                : 'No';
        }
    },
    template: `<p>{{ humanize }}</p>`
});

/**
 * A cell renderer for ag-grid to render the `check.instructions` field
 */
const instructionsCellRenderer = Vue.extend({
    computed: {
        humanize () {
            if (this.params.value !== null) {
                if (this.params.value === 'ups') {
                    return `UPS`;
                } else if (this.params.value === 'fedex') {
                    return `FedEx`;
                } else {
                    return `${this.params.value[0].toUpperCase()}${this.params.value.slice(1)}`;
                }
            }
        }
    },
    template: `<p>{{ humanize }}</p>`
});

/**
 * Custom filter component that matches true/false and provides a radio-based UI. It displays as
 * 'Yes' for true and 'No' for false, intended to be used with the booleanCellRenderer.
 */
const booleanColumnFilter = Vue.extend({
    data() {
        return {
            bool: '',
            valueGetter: null
        };
    },
    watch: {
        'bool': function (val, oldVal) {
            if (val !== oldVal) {
                this.params.filterChangedCallback();
            }
        }
    },
    created () {
        this.valueGetter = this.params.valueGetter;
    },
    methods: {
        isFilterActive () {
            return this.bool !== null && this.bool !== undefined && this.bool !== '' && this.bool !== 'none';
        },
        doesFilterPass (params) {
            if (this.bool) {
                // Show everything with 'none' selected
                if (this.bool === 'none') {
                    return true;
                }
                // evaluate if the value matches
                return this.valueGetter(params.node).toString().toLowerCase() === this.bool;
            }
            return false;
        },
        getModel () {
            return { value: this.bool };
        },
        setModel (model) {
            if (model) {
                this.bool = model.value;
            }
        },
    },
    template: `
        <div style="display: flex; flex-direction: column; margin: 5px;">
            <div style="display: inline-flex">
                <input type="radio" v-model="bool" id="true" value="true">
                <label style="margin-bottom: 0" for="yes">Yes</label>
            </div>
            <div style="display: inline-flex">
                <input type="radio" v-model="bool" id="false" value="false">
                <label style="margin-bottom: 0" for="no">No</label>
            </div>
            <div style="display: inline-flex">
                <input type="radio" v-model="bool" id="none" value="none">
                <label style="margin-bottom: 0" for="none">None</label>
            </div>
        </div>`,
});

class CustomLoadingOverlay {
    constructor () {
        this.overlay = document.createElement('div');
    }

    init () {
        this.overlay.innerHTML = `
            <i class="fa fa-spinner fa-pulse fa-3x fa-fw" style="color:#293b5d"></i>
        `;
    }

    getGui () {
        return this.overlay;
    }
}

export default {
    autoSizeColumns,
    dateCellRenderer,
    booleanCellRenderer,
    getColumnDefs,
    getDisplayDefs,
    instructionsCellRenderer,
    checkIdCellRenderer,
    booleanColumnFilter,
    CustomLoadingOverlay
};
