<template>
    <div class="flex-bigly m-2">
        <toolbar class="toolbar"
                 :primary-breakpoint="680" :secondary-breakpoint="850">
            <template slot="primary">
                <command id="detailsButton"
                         icon="eye" label="View Details" type="primary" 
                         @action="openDetailModal" :disabled="!grid.hasSelectedRows"/>
            </template>
            <template slot="secondary">
                <text-box id="quickFilterBox__signedChecks" type="text" placeholder="Search..."
                          addon="start" v-model="searchString">
                    <div slot="addon-start"><icon icon="search"/></div>
                </text-box>
                <command icon="refresh" class="h-100" @action="refreshGrid"/>
                <command-dropdown label="Export" icon="cloud-download" type="info" align-right ref="exportDropdown">
                    <button id="buttonExportCsv" class="dropdown-item" type="button" @click="openExportCsvModal">
                        <icon icon="file-excel-o" fixed-width/>
                        <span class="ml-1">CSV</span>
                    </button>
                    <button id="printableVersion" class="dropdown-item" type="button" @click="openPrintableVersion">
                        <icon icon="print" fixed-width/>
                        <span class="ml-1">Print</span>
                    </button>
                </command-dropdown>
            </template>
        </toolbar>

        <advanced-search ref="advancedSearch" :show-selection-options="false">
            <template slot="toolbar">
                <command type="primary" outline class="h-100 mr-1"
                         icon="arrow-up" v-tooltip.bottom="'Scroll Back to Top'"
                         @action="$refs.grid.gridOptions.api.ensureIndexVisible(0, 'top')"/>
                <command id="columnsFilterButton" label="Columns" type="primary" outline
                         icon="bars" :active="showColumnSelect"
                         @action="toggleColumnSelectPanel"/>
            </template>
            <signed-checks-filters :grid-api="grid.gridOptions.api" :row-data="signedChecks" 
                                   @close="$refs.advancedSearch.toggleFiltersCollapse()"/>
        </advanced-search>

        <div class="flex-bigly-row grid-wrapper">
            <ag-grid-vue class="grid grid-flex ag-theme-balham" ref="grid" 
                         :class="[{ 'printfont' : isPrinting }]"
                         :model-updated="columnsResize"
                         :row-data="signedChecks"
                         :grid-options="grid.gridOptions"
                         :column-defs="grid.columnDefinitions"
                         row-selection="single"
                         :row-selected="onRowSelection" 
                         :row-double-clicked="openDetailModal">
            </ag-grid-vue>
            <columns-panel v-show="showColumnSelect" class="panel"
                           :columndefs="columnDefs" :displayedcols="displayedCols"
                           :close="toggleColumnSelectPanel"
                           :grid="grid.gridOptions">
            </columns-panel>
        </div>

        <modal id="detailsModal" title="View Check Details" v-model="viewCheckModalVisible"
               size="custom" :max-width="800" @hidden="onModalHidden"
               role="dialog">
            <div slot="content">
                <div class="details-modal">
                    <div class="details-modal__data">    
                        <p><b class="mr-1">Payee Number:</b> {{ activeCheck.payee_number }}</p>
                        <p><b class="mr-1">Payee Name:</b> {{ activeCheck.payee_name }}</p>
                        <p><b class="mr-1">Check Identifier:</b>{{ checkidRenderer(activeCheck.check_identifier) }}</p>
                        <p v-if="activeCheck.edoc_number !== null"><b class="mr-1">Edoc Number:</b> {{ activeCheck.edoc_number }}</p>
                        <p><b class="mr-1">Check Number:</b> {{ activeCheck.check_number }}</p>
                        <p><b class="mr-1">Due Date:</b> {{ americanDate(activeCheck.due_date) }}</p>
                        <p><b class="mr-1">Instructions:</b> {{ instructionsRenderer(activeCheck.instructions) }}</p>
                        <p><b class="mr-1">Contact Name:</b> {{ activeCheck.contact_name }}</p>
                        <p><b class="mr-1">Contact Number:</b> {{ activeCheck.contact_number }}</p>
                        <p><b class="mr-1"> Contact Email:</b> {{ activeCheck.contact_email }}</p>
                        <p><b class="mr-1">Contacted:</b> {{ activeCheck.contacted === true ? 'Yes' : 'No' }}</p>
                        <p><b class="mr-1">Picked Up:</b> {{ activeCheck.picked_up === true ? 'Yes' : 'No' }}</p>
                        <img :src="activeCheck.signature.signature" class="img-fluid" alt="Signature image">
                        <p class="mb-0">{{ activeCheck.signature.last_name }}, {{ activeCheck.signature.first_name }}</p>
                        <small class="text-muted" v-html="created"></small>
                        <hr class="my-2">
                        <div v-if="activeCheck.archived_signatures != null">
                            <collapse-panel v-if="activeCheck.archived_signatures.length > 0" 
                                            title="Archived Signatures" :collapsed="true" class="my-2">
                                <div class="list-group-flush" v-for="value in activeCheck.archived_signatures" :key="value.id" slot="content">
                                    <li class="list-group-item align-items-start" style="flex-direction: column;">
                                        <img :src="value.signature" class="img-fluid" alt="Signature image">
                                        <p class="mb-0">{{ value.last_name }}, {{ value.first_name }}</p>
                                        <small class="text-muted" v-html="archivedCreated(value.created)"></small>
                                        <p class=" mb-0">Reason: {{ value.reason }}</p>
                                    </li>
                                </div>
                            </collapse-panel>
                        </div>
                        <i v-html="lastModifiedBy"></i>
                    </div>
                    <comments class="details-modal__comments" :comments="activeCheck.comments"></comments>
                </div>
            </div>
            <template slot="footer">
                <div id="archivePopup" class="archive-confirm">
                    <popover position="top right" class="h-100" ref="archivePopover">
                        <button v-if="activeUser.canArchive" id="deleteButton" class="btn btn-danger h-100" style="display: inline-flex; align-items: center;">
                            <i class="fa fa-archive mr-2" aria-hidden="true"/>
                            <div class="btn-label">Archive</div>
                        </button>
                        <div slot="content" class="card" style="margin-bottom:0.125em; width:400px;">
                            <div class="card-block p-3">
                                <h5 class="card-title">Archive Signature</h5>
                                <alert class="w-100" type="warning" :icon="false"
                                       message="Are you sure you want to archive this signature? This action is irreversible." />
                                <p class="w-100">The signature will not be deleted. Instead, it will be attached to the check as an "Archived Signature". The check will revert back to an un-signed state.</p>
                                <text-box id="archiveName" label="Confirm Payee Name:" v-model="archive.form.payee_name_confirm" 
                                          :placeholder="activeCheck.payee_name"
                                          description="Confirm the payee name to proceed."
                                          :danger="!!archive.errors.payee_name_confirm" :danger-message="archive.errors.payee_name_confirm" />
                                <text-view id="archiveReason" label="Reason:" v-model="archive.form.reason"
                                           description="Please provide a reason for archiving this signature. It will be attached as a comment."
                                           :danger="!!archive.errors.reason" :danger-message="archive.errors.reason" />
                                <alert v-if="!!archive.errors.check_id" 
                                       id="archiveCheckIdError" type="danger" :message="archive.errors.check_id" />
                                <alert v-if="!!archive.errors.server" 
                                       id="archiveServerError" type="danger" :message="archive.errors.server" />
                                <div class="d-flex justify-content-end">
                                    <command id="archiveCancel" label="Cancel" icon="times" type="secondary" @action="closeArchivePopover"/>
                                    <command id="archiveConfirm" class="ml-1" label="Archive" icon="archive" type="danger" 
                                             @action="archiveSignature" />
                                </div>
                            </div>
                        </div>
                    </popover>
                </div>
                <command label="Close" type="primary" icon="close" @action="closeDetailModal" />
            </template>
        </modal>

        <!-- Export Modal component -->
        <export-csv :show="showCsvModal" :grid="grid.gridOptions.api" @closeCsv="closeCsvModal"></export-csv>

        <!-- Toast nofitications -->
        <toast-group position="top right" width="350px"></toast-group>
    </div>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import AdvancedSearch from '@/components/AdvancedSearch.vue';
import Comments from '@/components/Comments.vue';
import ColumnsPanel from '@/components/ColumnsPanel.vue';
import ExportCsv from '@/components/ExportCsv.vue';
import SignedChecksFilters from '@/components/filters/SignedChecksFilters.vue';
import GridHelpers from '@/utils/gridHelpers.js';
import moment from 'moment';
import exportMixin from '@/mixins/export';
import pageMixin from '@/mixins/page';
import ChecksService from '@/store/services/ChecksService';

export default {
    name: 'SignedChecks',
    components: {
        AdvancedSearch,
        AgGridVue,
        Comments,
        ColumnsPanel,
        ExportCsv,
        SignedChecksFilters
    },
    mixins: [exportMixin, pageMixin],
    data () {
        return {
            viewCheckModalVisible: false,
            modalVisible: {
                new: false,
                edit: false
            },
            archive: {
                form: {
                    confirmPayeeName: '',
                    reason: ''
                },
                errors: {}
            },
            grid: {
                selectedRows: null,
                hasSelectedRows: false,
                gridOptions: {
                    enableFilter: false,
                    enableSorting: true,
                    enableColResize: true,
                    animateRows: true,
                    suppressPropertyNamesCheck: true,
                    suppressColumnVirtualisation: true,
                    paginationAutoPageSize: true,
                    loadingOverlayComponent: GridHelpers.CustomLoadingOverlay
                },
                columnDefinitions: [
                    {
                        headerName: "SIGNED CHECK INFO",
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
                            },
                            {
                                headerName: "Picked Up?",
                                field: "picked_up",
                                cellRendererFramework: GridHelpers.booleanCellRenderer,
                                filterFramework: GridHelpers.booleanColumnFilter
                            }
                        ]
                    },
                    {
                        headerName: "SIGNATURE INFO",
                        children: [
                            { 
                                headerName: "Received By",
                                colId: 'received_by',
                                valueGetter: function (params) {
                                    return `${params.data.signature.first_name} ${params.data.signature.last_name}`;
                                }
                            }, 
                            { 
                                headerName: "Date/Time Received", 
                                field: "signature.created",
                                colId: 'date_received',
                                cellRendererFramework: GridHelpers.dateCellRenderer
                            }
                        ]
                    }
                ]
            }
        };
    },
    computed: {
        ...mapGetters('checks', [
            'activeCheck',
            'signedChecks',
            'errors'
        ]),
        ...mapGetters('comments', [
            'activeComment'
        ]),
        ...mapState('checks', [
            'activeUser'
        ]),
        /**
         * Returns a string containing the user and time (humanized) an item was last modified
         * @returns {String}
         */
        lastModifiedBy () {
            return `Last modified by <b>${this.activeCheck.user}</b> \
                    ${moment(this.activeCheck.modified).startOf('minute').fromNow()} \
                    at ${moment(this.activeCheck.modified).format('h:mm a')}`;
        },
        /**
         * Returns a string containing the (humanized) time of signature creation
         * @returns {String}
         */
        created () {
            this.retrieveUserStatus();
            return `${moment(this.activeCheck.signature.created).startOf('minute').fromNow()} at \
                    ${moment(this.activeCheck.signature.created).format('h:mm a')}`;
        },
    },
    async mounted () {
        this.$refs.grid.gridOptions.api.showLoadingOverlay();
        await this.fetchChecks();
        this.$refs.grid.gridOptions.api.hideOverlay();
    },

    beforeRouteLeave (to, from, next) {
        this.grid.selectedRows = null;
        this.grid.hasSelectedRows = false;
        this.clearCheck();
        this.clearErrors();
        this.clearCommentErrors();
        next();
    },
    methods: {
        ...mapActions('checks', [
            'fetchChecks',
            'setCheck',
            'setUser',
            'clearCheck',
            'setCheckById',
            'clearErrors'
        ]),
        ...mapActions('comments', {
            clearCommentErrors: 'clearErrors',
            post: 'post'
        }),
        async retrieveUserStatus () {
            const response = await ChecksService.userCanArchive();
            this.setUser(response.data);
        },
        // Event Handlers

        /**
         * Open the check detail modal
         */
        openDetailModal () {
            this.clearErrors();
            this.setCheck(this.grid.selectedRows[0]);
            this.activeComment.related_check = this.activeCheck.id;
            this.viewCheckModalVisible = true;
        },
        /**
         * Close the check detail modal
         */
        closeDetailModal () {
            this.viewCheckModalVisible = false;
        },
        /**
         * Refresh page data when the detail modal is hidden
         */
        onModalHidden () {
            this.$refs.grid.gridOptions.api.redrawRows();
            this.activeComment.comment = "";
        },
        /**
         * Reset page data for no selection and fetch fresh data from the api
         */
        refreshGrid () {
            this.fetchChecks()
                .then(() => this.$refs.grid.gridOptions.api.redrawRows())
                .catch((error) => {
                    this.$toast({
                        type: 'danger',
                        title: 'Whoops!',
                        message: 'Unable to fetch data, please try again.',
                        duration: 3000
                    });
                    console.error("something went wrong on Refresh:");
                    console.error(error);
                });
            //Make sure that after refresh View Details button does not still open modal for last selected row
            this.hasRowSelected = false;
        },
        /**
         * Close the archive popover
         */
        closeArchivePopover () {
            this.$refs.archivePopover.popover.close();
        },
        /**
         * Archive a signature
         */
        async archiveSignature () {
            // Reset the error warnings
            this.archive.errors = {};

            // Build the payload and make the api call
            if (this.activeCheck.payee_name === this.archive.form.payee_name_confirm) {
                let payload = {
                    check_id: this.activeCheck.id,
                    reason: this.archive.form.reason
                };

                try {
                    const response = await ChecksService.archiveSignature(payload);
                    this.closeArchivePopover();
                    this.$toast({
                        title: 'Success!',
                        type: 'success',
                        message: response.data,
                        duration: 5000
                    });
                } catch (error) {
                    if (error.response.status == 400) {
                        for (const err in error.response.data) {
                            this.$set(this.archive.errors, err, error.response.data[err]);
                        }
                    } else if (error.response.status == 500) {
                        this.$toast({
                            title: 'Error',
                            type: 'error',
                            message: error.response.data,
                            duration: 5000
                        });
                    }
                }
            } else {
                this.archive.errors['payee_name_confirm'] = 'Payee name does not match!';
            }
        },

        // Functions to help format things

        /**
         * Render instructions in correct format
         */
        instructionsRenderer (instr) {
            if (instr !== null) {
                if (instr === 'ups') {
                    return `UPS`;
                } else if (instr === 'fedex') {
                    return `FedEx`;
                } else {
                    return `${instr.charAt(0).toUpperCase()}${instr.slice(1)}`;
                }
            }
        },
        /**
         * Render check identifier in correct format
         */
        checkidRenderer (cid) {
            if (cid == 'accounts payable') {
                return `Accounts Payable`;
            } else if (cid == 'payroll') {
                return `Payroll`;
            } else {
                return cid;
            }
        },
        /**
         * Render due date in correct format
         */
        americanDate (badDate) {
            if (badDate!== null) {
                return moment(badDate).format('M-D-YYYY');
            }
        },
        /**
         * Format the archived created date properly
         */
        archivedCreated (tempData) {
            return `${moment(tempData).startOf('minute').fromNow()} at \
                    ${moment(tempData).format('h:mm a')}`;
        }
    }
};
</script>


<style lang="scss">
.details-modal {
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    @media screen and (max-width: 576px) {
        flex-direction: column;       
    }

    .details-modal__comments {
        margin-left: 0.5rem;
        // Ignore modal-content margin
        margin-right: -15px;
        // Ignore modal-content y-axis padding
        margin-top: -15px;
        margin-bottom: -15px;

        @media screen and (max-width: 576px) {
            margin-left: 0;     
        }
    }
}

.archive-confirm {
    z-index: 1060;
    margin-right: 0px !important;

    .drop-target {
        height: 100% !important;
    }

    @media screen and (max-width: 600px) {
        .btn {
            i {
                margin-right: 0px !important;
            }

            .btn-label {
                display: none;
            }
        }
    }
}
</style>
