<template>
    <div class="flex-bigly m-2">
        <toolbar class="toolbar"
                 :primary-breakpoint="680" :secondary-breakpoint="850">
            <template slot="primary">
                <command label="Sign" id="signButton" icon="pencil-square-o" type="primary" 
                         @action="openModal" :disabled="!grid.hasSelectedRows"/>
            </template>
            <template slot="secondary">
                <text-box id="quickFilter" type="text" placeholder="Search..."
                          addon="start" v-model="searchString">
                    <div slot="addon-start"><icon icon="search"/></div>
                </text-box>
                <command id="refreshButton" class="h-100" icon="refresh" @action="refreshData"/>
            </template>
        </toolbar>

        <advanced-search ref="advancedSearch"
                         @selectAll="selectAll"
                         @selectNone="selectNone"
                         @toggleMultiSelect="toggleSelectionMode">
            <template slot="toolbar">
                <command type="primary" outline class="h-100 mr-1"
                         icon="arrow-up" v-tooltip.bottom="'Scroll Back to Top'"
                         @action="$refs.grid.gridOptions.api.ensureIndexVisible(0, 'top')"/>
                <command id="columnsFilterButton" label="Columns" type="primary" outline
                         icon="bars" :active="showColumnSelect"
                         @action="toggleColumnSelectPanel"/>
            </template>
            <signatures-filters :grid-api="grid.gridOptions.api"
                                :row-data="unsignedChecks"
                                @filterByHasCheckNumber="filterByHasCheckNumber"
                                @close="$refs.advancedSearch.toggleFiltersCollapse()"/>
        </advanced-search>

        <div class="flex-bigly-row grid-wrapper">
            <ag-grid-vue class="grid grid-flex ag-theme-balham" ref="grid"
                         :model-updated="columnsResize"
                         :row-data="unsignedChecks"
                         :grid-options="grid.gridOptions"
                         :column-defs="grid.columnDefinitions"
                         :row-selection="grid.selectionMode" 
                         :row-multi-select-with-click="grid.selectionMode === 'multiple' ? true : false"
                         :row-selected="onRowSelection" 
                         :row-double-clicked="openModal">
            </ag-grid-vue>
            <columns-panel v-show="showColumnSelect" class="panel panel-columns"
                           :columndefs="columnDefs" :displayedcols="displayedCols"
                           :close="toggleColumnSelectPanel"
                           :grid="grid.gridOptions">
            </columns-panel>
        </div>

        <modal title="Sign Back In" id="timedOutModal" role="dialog"
               v-model="timedOutModal" size="custom" :max-width="450"
               disable-backdrop-close>
            <template slot="content">
                <p>Click below to refresh the page and prevent a timeout</p>
            </template>
            <template slot="footer">
                <command id="refreshPageButton" icon="refresh" label="Refresh" type="success"
                         @action="reloadPage"/>
            </template>
        </modal>

        <!-- Modal -->
        <modal title="Sign for Checks" id="signatureModal" role="dialog" class="sign-modal"
               size="custom" :max-width="800" :min-width="500" @close="closeModal"
               v-model="showSignModal" hide-footer disable-backdrop-close>
            <div slot="content" v-if="showSignModal">
                <stepper v-model="currentStep" ref="stepper">
                    <stepper-item title="Verify" icon="eye"/>
                    <stepper-item title="Sign" icon="pencil"/>
                    <stepper-item title="Completed" icon="thumbs-up"/>
                </stepper>
                <div class="sign-modal__step">
                    <transition enter-class="sign-modal-transition-enter"
                                leave-to-class="sign-modal-transition-leave-to"
                                enter-active-class="animated fadeInRight"
                                leave-active-class="animated fadeOutLeft">
                        <!-- Confirm selection before signing -->
                        <div v-if="currentStep === 1" :key="currentStep">
                            <h5>Checks Selected: <span class="badge badge-uared">{{ grid.selectedRows.length }}</span></h5>
                            <table class="table table-striped table-hover sign-modal__confirm-table">
                                <thead class="thead-dark-silver">
                                    <tr>
                                        <th>Payee Name</th>
                                        <th>Org. Code</th>
                                        <th>Instructions</th>
                                        <th>Check #</th>
                                        <th>Contact Name</th>
                                        <th>Contact #</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(sig, key) in grid.selectedRows" :key="key">
                                        <td scope="row">{{ sig.payee_name }}</td>
                                        <td>{{ sig.org_code }}</td>
                                        <td>{{ sig.instructions | capitalize }}</td>
                                        <td>{{ sig.check_number }}</td>
                                        <td>{{ sig.contact_name }}</td>
                                        <td>{{ sig.contact_number }}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div class="sign-modal__commands">
                                <command id="confirmButton" type="primary" label="Confirm" icon="thumbs-up" @action="$refs.stepper.next()"/>
                            </div>
                        </div>
                        <!-- Finished -->
                        <div v-else-if="currentStep === 3" :key="currentStep"
                             class="d-flex flex-column align-items-center" style="margin:5em">
                            <icon class="text-success" icon="check" size="5x"/>
                            <p class="lead">You have successfully signed for all checks</p>
                            <command type="primary" label="Finish" @action="closeModal"/>
                        </div>
                        <!-- Signature form -->
                        <div v-else :key="currentStep">
                            <signature-form ref="signatureForm"></signature-form>
                            <div v-if="emptySignatureError">
                                <alert id="noSignatureError" type="danger" message="The Signature cannot be blank!"/>
                            </div>
                            <div class="sign-modal__commands">
                                <command id="clearButton" label="Clear" type="warning" icon="eraser" outline
                                         @action="clearForm"/>
                                <command id="nextButton" type="primary" label="Next" icon="arrow-right" 
                                         @action="post"/>
                            </div>
                        </div>
                    </transition>
                </div>
            </div>
        </modal>

        <!-- Toast nofitications -->
        <toast-group position="top right" width="350px"></toast-group>

    </div>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue';
import { mapGetters, mapActions } from 'vuex';
import AdvancedSearch from '@/components/AdvancedSearch.vue';
import ColumnsPanel from '@/components/ColumnsPanel.vue';
import SignatureForm from '@/components/forms/SignatureForm.vue';
import SignaturesFilters from '@/components/filters/SignaturesFilters.vue';
import GridHelpers from '@/utils/gridHelpers.js';
import exportMixin from '@/mixins/export';
import pageMixin from '@/mixins/page';

export default {
    name: 'Signatures',
    components: {
        AdvancedSearch,
        AgGridVue,
        ColumnsPanel,
        SignatureForm,
        SignaturesFilters
    },
    mixins: [exportMixin, pageMixin],
    data () {
        return {
            timedOutModal: false,
            showSignModal: false,
            currentStep: 1,
            emptySignatureError: false,
            grid: {
                selectedRows: null,
                hasSelectedRows: false,
                selectionMode: 'single',
                externalFilters: {
                    hasCheckNumber: 'all'
                },
                gridOptions: {
                    enableFilter: false,
                    enableSorting: true,
                    enableColResize: true,
                    animateRows: true,
                    suppressPropertyNamesCheck: true,
                    suppressColumnVirtualisation: true,
                    paginationAutoPageSize: true,
                    isExternalFilterPresent: this.isExternalFilterPresent,
                    doesExternalFilterPass: this.doesExternalFilterPass,
                    loadingOverlayComponent: GridHelpers.CustomLoadingOverlay,
                },
                columnDefinitions: [
                    { 
                        headerName: "CHECK INFO", 
                        children: [
                            { headerName: "Payee Name", field: "payee_name" },
                            { headerName: "Payee #", field: "payee_number" },
                            { headerName: "Check Identifier", field: "check_identifier", cellRendererFramework: GridHelpers.checkIdCellRenderer },
                            { headerName: "Check #", field: "check_number" },
                            { headerName: "Instructions", field: "instructions", cellRendererFramework: GridHelpers.instructionsCellRenderer },
                            { headerName: "Edoc #", field: "edoc_number" },
                            { headerName: "Org. Code", field: "org_code" }
                        ]
                    },
                    {
                        headerName: "CONTACT INFO",
                        children: [
                            { headerName: "Contact Name", field: "contact_name" },
                            { headerName: "Contact Phone", field: "contact_number" },
                            { headerName: "Contact Email", field: "contact_email" },
                            { 
                                headerName: "Contacted?",
                                field: "contacted",
                                cellRendererFramework: GridHelpers.booleanCellRenderer,
                                filterFramework: GridHelpers.booleanColumnFilter
                            }
                        ]
                    },
                    { headerName: "Date/Time Created", field: "created", cellRendererFramework: GridHelpers.dateCellRenderer }
                ]
            }
        };
    },
    computed: {
        ...mapGetters('checks', [
            'unsignedChecks',
            'errors'
        ])
    },
    created () {
        // Set timeout for 55 minutes.
        setInterval(() => this.timedOutModal = true, 3300000);
    },
    async mounted () {
        this.$refs.grid.gridOptions.api.showLoadingOverlay();
        await this.fetchUnsignedChecks();
        this.$refs.grid.gridOptions.api.hideOverlay();
    },
    beforeRouteLeave (to, from, next) {
        this.grid.selectedRows = null;
        this.grid.hasSelectedRows = false;
        this.clearErrors();
        next();
    },
    methods: {
        ...mapActions('checks', [
            'fetchUnsignedChecks',
            'postSignatures',
            'clearErrors',
        ]),

        // Modal Functions

        /**
         * Open the signing modal
         */
        openModal () {
            if(this.showSignModal === false){
                this.currentStep = 1;
            }
            this.showSignModal = true;
            this.clearErrors();
            this.emptySignatureError = false;
        },
        /**
         * Close the signing modal
         */
        closeModal () {
            this.showSignModal = false;
            this.currentStep = 1;
            this.clearErrors();
            this.refreshData();
            this.emptySignatureError = false;
        },

        // Event Handling

        /**
         * Return signature data from the signature form
         * @returns {Object}
         */
        getSignatureData () {
            return this.$refs.signatureForm.getSignature();
        },
        /**
         * Clear the signature from
         */
        clearForm () {
            this.$refs.signatureForm.clear();
        },
        /**
         * Validate that a signature exists in the form
         * @returns {Boolean}
         */
        sigValidationCheck () {
            if(this.$refs.signatureForm.checkIfEmpty()){
                console.error("Error - Something went wrong on post:");
                this.emptySignatureError = true;
                return this.emptySignatureError;
            }
            else {
                this.emptySignatureError = false;
                return this.emptySignatureError;
            }
        },
        /**
         * Reload the page when the user agrees to do so for re-auth
         */
        reloadPage () {
            window.location.reload(true);
        },

        // API-related Methods

        /**
         * Reset page data for no selection and fetch fresh data from the api
         */
        refreshData () {
            this.fetchUnsignedChecks()
                .then(() => this.$refs.grid.gridOptions.api.redrawRows())
                .catch((error) => {
                    this.$toast({
                        type: 'danger',
                        title: 'Whoops!',
                        message: 'Unable to fetch data, please try again.',
                        duration: 3000
                    });
                    console.error("Error - Something went wrong on refresh:");
                    console.error(error);
                });
            // Make sure that after refresh Sign button does not still open modal for last selected row
            this.grid.selectedRows = null;
            this.grid.hasSelectedRows = false;
        },
        /**
         * Create signatures in the api
         */
        async post () {
            // Get the signature
            const sig = this.getSignatureData();
            // Get the checks to sign
            const toSign = this.grid.selectedRows.map(s => s.id);
            sig['checks'] = toSign;
            if (!this.sigValidationCheck()) {
                try {
                    await this.postSignatures(sig);
                    if (!Object.keys(this.errors).length) {
                        // Clear the form
                        this.clearForm();
                        // Move on to the next step
                        this.$refs.stepper.next();
                    }
                } catch (error) {
                    this.$toast({
                        type: 'danger',
                        title: 'Whoops!',
                        message: 'Unable to create a signature, please try again.',
                        duration: 3000
                    });
                    console.error("Error - Something went wrong on post:");
                    console.error(error);
                }
            }
        },

        // Grid External Filtering

        /**
         * Grid api function to determine if external filtering is needed.
         * @returns {Boolean}
         */
        isExternalFilterPresent () {
            return this.grid.externalFilters.hasCheckNumber != 'all' || this.grid.externalFilters.user;
        },
        /**
         * Grid api functionality to filter the grid externally
         * @param {*} node passed in by aggrid
         * @returns {Boolean}
         */
        doesExternalFilterPass (node) {
            // HasCheckNumber filtering - If the filter is not 'all', it'll be 'true' or 'false'
            if (this.grid.externalFilters.hasCheckNumber === 'true') { 
                return node.data.check_number;
            } else if (this.grid.externalFilters.hasCheckNumber === 'false') {
                return !node.data.check_number;
            }
        },
        /**
         * Toggle filtering by presence of a check number
         * @param {Number} val a check number
         */
        filterByHasCheckNumber (val) {
            this.grid.externalFilters.hasCheckNumber = val;
            this.grid.gridOptions.api.onFilterChanged();
        }
    }
};
</script>

<style lang="scss">
.sign-modal {

    .sign-modal__step {
        margin: 1em 0 0;
        overflow-x: hidden;
        position: relative;
    }

    .sign-modal__confirm-table {
        font-size: 0.9rem;
        line-height: 1;
    }

    .check-info {
        display: flex;
        flex: auto;
        justify-content: space-between;
        align-items: center;
        border: 1px solid rgba(0, 0, 0, 0.125);
        border-radius: 0.25rem;
        padding: 1em;
    }

    .sign-modal__commands {
        display: flex;
        justify-content: flex-end;
        align-content: center;

        button {
            margin-left: 0.25em;
        }
    }
}

.thead-dark-silver th {
    color: #fff;
    background-color: #49595e;
}

// Transition classes for Sign Modal
.sign-modal-transition-enter, .sign-modal-transition-leave-to {
    position: absolute;
    top: 0;
}
</style>
