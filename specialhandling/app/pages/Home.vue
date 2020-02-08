<template>
    <div class="flex-bigly m-2">
        <toolbar class="toolbar"
                 :primary-breakpoint="680" :secondary-breakpoint="850">
            <template slot="primary" class="d-flex">
                <command id="createButton" label="Create" icon="plus" type="primary" @action="openNewModal"/>
                <command id="editButton" label="Edit" icon="pencil" type="uared" @action="openEditModal" :disabled="!grid.hasSelectedRows"/>
                <div id="deleteConfirmPopup" class="delete-confirm">
                    <popover ref="pop" position="bottom left" class="h-100">
                        <button id="deleteButton" class="btn btn-danger h-100" :disabled="!grid.hasSelectedRows"
                                style="display: inline-flex; align-items: center;">
                            <i class="fa fa-trash-o mr-2" aria-hidden="true" />
                            <div class="btn-label">Delete</div>
                        </button>
                        <div slot="content" class="card delete-confirm" style="margin-top:0.125em">
                            <div class="card-block p-3">
                                <h5 class="card-title">Confirm Deletion</h5>
                                <p class="w-100">Are you sure you want to delete that check?</p>
                                <div slot="primary" class="d-flex justify-content-end">
                                    <command id="deleteButtonCancel" label="Cancel" icon="times" type="secondary" @action="closeDrop"/>
                                    <command id="deleteButtonConfirm" class="ml-1" label="Delete" icon="trash-o" type="danger" 
                                             @action="deleteSelected" :disabled="!grid.hasSelectedRows"/>
                                </div>
                            </div>
                            <alert v-if="grid.selectedRows !== null && grid.selectedRows.length > 1" 
                                   id="multipleWarning" class="mb-0"
                                   type="warning" message="You are deleting multiple checks"></alert>
                        </div>
                    </popover>
                </div>
            </template>
            <template slot="secondary">
                <text-box id="quickFilterBox__home" type="text" placeholder="Quick Search..."
                          addon="start" v-model="searchString">
                    <div slot="addon-start"><icon icon="search"/></div>
                </text-box>
                <command id="refreshButton" class="h-100" icon="refresh" @action="refreshGrid"/>
                <command-dropdown id="exportDropdown" label="Export" icon="cloud-download" type="info" align-right ref="exportDropdown">
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

        <advanced-search id="advancedSearch"
                         ref="advancedSearch" 
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
            <home-filters :grid-api="grid.gridOptions.api" 
                          :row-data="unsignedChecks"
                          @filterByUser="filterByUser"
                          @filterByHasCheckNumber="filterByHasCheckNumber"
                          @close="$refs.advancedSearch.toggleFiltersCollapse()"/>
        </advanced-search>

        <div class="flex-bigly-row grid-wrapper">
            <ag-grid-vue class="grid grid-flex ag-theme-balham" ref="grid"
                         :class="[{ 'printfont' : isPrinting }]"
                         :model-updated="columnsResize"
                         :row-data="unsignedChecks"
                         :grid-options="grid.gridOptions"
                         :column-defs="grid.columnDefinitions"
                         :row-selection="grid.selectionMode" 
                         :row-multi-select-with-click="grid.selectionMode === 'multiple' ? true : false"
                         :row-selected="onRowSelection" 
                         :row-double-clicked="openEditModal">
            </ag-grid-vue>
            <columns-panel v-show="showColumnSelect" class="panel"
                           :columndefs="columnDefs" :displayedcols="displayedCols"
                           :close="toggleColumnSelectPanel"
                           :grid="grid.gridOptions">
            </columns-panel>
        </div>
       
        <!-- Edit Modal -->
        <modal ref="editModal" id="editModal"
               title="Edit Check Entry" v-model="modalVisible.edit"
               size="custom" :max-width="900" role="dialog"
               @hidden="onModalHidden">
            <template slot="content">
                <div class="home-modal">
                    <edit-form v-if="modalVisible.edit === true">
                        <i class="col-12" v-html="lastModifiedBy"></i>
                    </edit-form>
                    <comments class="home-modal__comments" :comments="activeCheck.comments"></comments>
                </div>
            </template>    
            <template slot="footer">
                <command id="closeEditModal" icon="times" label="Cancel" type="danger"
                         @action="closeEditModal"/>
                <command id="clearEditModal" icon="eraser" label="Clear" type="warning" outline 
                         @action="clearCheckAndComments" />
                <command id="saveEditModal" icon="save" label="Save" type="success" :disabled="disableSave.edit"
                         @action="update"/>
            </template>
        </modal>

        <!-- Multiple Edit Modal -->
        <modal ref="multipleEditModal" id="multipleEditModal"
               title="Edit Multiple Check Entries" v-model="modalVisible.multipleEdit"
               hide-footer role="dialog" >
            <template slot="content">
                <multiple-edit-form :batch-comment-errors="batchChecks.batchCommentErrors" 
                                    :mod-checks="batchChecks.to_modify" 
                                    :disable-save="disableSave.multipleEdit" 
                                    v-if="modalVisible.multipleEdit === true"
                                    @close="modalVisible.multipleEdit = false"
                                    @submit="updateMultipleChecks">
                </multiple-edit-form>
            </template>
        </modal>

        <!-- Create/New Modal -->
        <modal ref="createModal" id="createModal"
               title="New Check Entry" v-model="modalVisible.new"
               size="custom" :max-width="900" role="dialog"
               @hidden="onModalHidden">
            <template slot="content">
                <div class="home-modal">
                    <create-form v-if="modalVisible.new === true"></create-form>
                    <comments ref="commentComponent" class="home-modal__comments" 
                              prevent-submission :comments="activeCheck.comments"
                              @addComment="appendCommentToCreate"></comments>
                </div>
            </template>
            <template slot="footer">
                <command id="closeCreateModal" icon="times" label="Cancel" type="danger"
                         @action="closeNewModal"/>
                <command id="clearCreateModal" icon="eraser" label="Clear" type="warning" outline 
                         @action="clearCheckAndComments"/>
                <command id="saveAndCopyCreateModal" icon="save" label="Save and Copy" type="success" outline :disabled="disableSave.new"
                         @action="saveAndCopy"/>
                <command id="saveCreateModal" icon="save" label="Save" type="success" :disabled="disableSave.new"
                         @action="save"/>
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
import { mapGetters, mapActions } from 'vuex';
import { Animation } from 'vueoom';
import moment from 'moment';
import AdvancedSearch from '@/components/AdvancedSearch.vue';
import HomeFilters from '@/components/filters/HomeFilters.vue';
import Comments from '@/components/Comments.vue';
import CreateForm from '@/components/forms/CreateForm.vue';
import ColumnsPanel from '@/components/ColumnsPanel.vue';
import EditForm from '@/components/forms/EditForm.vue';
import ExportCsv from '@/components/ExportCsv.vue';
import MultipleEditForm from '@/components/forms/MultipleEditForm.vue';
import exportMixin from '@/mixins/export';
import pageMixin from '@/mixins/page';
import CommentsService from '@/store/services/CommentsService';
import GridHelpers from '@/utils/gridHelpers';

export default {
    name: 'Home',
    components: {
        AdvancedSearch,
        AgGridVue,
        Comments,
        CreateForm,
        ColumnsPanel,
        EditForm,
        ExportCsv,
        MultipleEditForm,
        HomeFilters
    },
    mixins: [exportMixin, pageMixin],
    data () {
        return {
            disableSave: {
                new: false,
                edit: false,
                multipleEdit: false
            },
            modalVisible: {
                new: false,
                edit: false,
                multipleEdit: false
            },
            batchChecks: {
                to_modify: "",
                batchComment: {
                    related_check: "",
                    comment: ""
                },
                batchCommentErrors: {
                    comment: undefined
                }
            },
            grid: {
                selectedRows: null,
                hasSelectedRows: false,
                selectionMode: 'single',
                externalFilters: {
                    hasCheckNumber: 'all',
                    user: ''
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
                            { headerName: "Payee Name", field: "payee_name", hide: false },
                            { headerName: "Payee #", field: "payee_number", hide: false },
                            { headerName: "Check Identifier", field: "check_identifier", hide: false, cellRendererFramework: GridHelpers.checkIdCellRenderer },
                            { headerName: "Check #", field: "check_number", hide: false },
                            { headerName: "Instructions", field: "instructions", hide: false, cellRendererFramework: GridHelpers.instructionsCellRenderer },
                            { headerName: "Edoc #", field: "edoc_number", hide: false },
                            { headerName: "Org. Code", field: "org_code", hide: false },
                            { headerName: "Due Date", field: "due_date", hide: false, cellRendererFramework: GridHelpers.dateCellRenderer }
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
                    { headerName: "Date/Time Created", field: "created", hide: false, cellRendererFramework: GridHelpers.dateCellRenderer }
                ],
            }
        };
    },
    computed: {
        ...mapGetters('checks', [
            'unsignedChecks',
            'activeCheck', 
            'errors'
        ]),
        ...mapGetters('comments', [
            'activeComment'
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
    },
    async mounted () {
        this.$refs.grid.gridOptions.api.showLoadingOverlay();
        await this.fetchUnsignedChecks();
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
            'addUnsignedCheck',
            'fetchUnsignedChecks',
            'setCheck',
            'clearCheck',
            'clearErrors',
            'postCheck',
            'putCheck',
            'putChecks',
            'deleteCheck',
            'deleteChecks',
            'updateActiveCheck',
            'verifyEdoc',
            'fetchCheckById'
        ]),
        ...mapActions('comments', {
            clearCommentErrors: 'clearErrors',
            postComment: 'post'
        }),

        // Modal Functions

        /**
         * Open the edit modal
         */
        openEditModal () {
            // Opening a new item
            if (this.grid.selectedRows[0].id !== this.activeCheck.id) {
                this.setCheck(this.grid.selectedRows[0]);
                this.activeComment.related_check = this.activeCheck.id;
                this.clearErrors();
                this.clearCommentErrors();
            }
            if (this.grid.selectedRows.length === 1) {
                this.modalVisible.edit = true;
            }
            else {
                this.modalVisible.multipleEdit = true;
                let idArray = this.grid.selectedRows.map(rowObject => rowObject.id);
                this.batchChecks.to_modify = idArray.toString();
                this.batchChecks.batchCommentErrors.comment = undefined;
            }
        },
        /**
         * Close the edit modal
         */
        closeEditModal () {
            // Restore the items data (useful if it was previously cleared)
            this.setCheck(this.grid.selectedRows[0]);
            this.clearErrors();
            this.activeComment.comment = "";
            // Hide the modal
            this.modalVisible.edit = false;
        },
        /** 
         * Open the create/new modal 
         */
        openNewModal () {
            // If a row is selected, clear the item before opening the Modal
            if (this.grid.selectedRows) {
                // Clear store data
                this.clearCheck();
                this.clearErrors();
                // Unselect the previously selected row in AgGrid
                this.$refs.grid.gridOptions.api.deselectAll();
                this.grid.selectedRows = null;
                this.grid.hasSelectedRows = false;
            }
            this.modalVisible.new = true;
        },
        /**
         * Close the create/new modal
         */
        closeNewModal () {
            // Clear errrors and reset check when close button is clicked
            this.clearErrors();
            this.clearCheck(true);
            this.activeComment.comment = "";
            // Hide the modal
            this.modalVisible.new = false;
        },
        /**
         * Clear the create/new modal or the edit check modal
         */
        clearCheckAndComments () {
            this.clearCheck(true);
            this.activeComment.comment = "";
        },
        
        // API-related Methods

        /**
         * Reset page data for no selection and fetch fresh data from the api
         */
        refreshGrid () {
            this.activeCheck.id = '';
            this.clearCheck();
            this.fetchUnsignedChecks()
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
            // Make sure that after refresh View edit doesn't open modal for last selected row
            this.grid.selectedRows = null;
            this.grid.hasSelectedRows = false;
            // Reset multiple updating
            this.batchChecks.to_modify = "";
            // Reset comments so that next check has no comments associated with it
            this.activeCheck.comments = [];
        },
        /**
         * Refresh page data when the detail modal is hidden
         */
        onModalHidden () {
            this.$refs.grid.gridOptions.api.redrawRows();
            this.activeComment.comment = "";
        },
        /**
         * Delete the selected check entry/entries
         */
        async deleteSelected () {
            if (this.grid.selectedRows.length === 1) {
                this.$refs.pop.popover.close();
                try {
                    await this.setCheck(this.grid.selectedRows[0]);
                    await this.deleteCheck();
                    this.$refs.grid.gridOptions.api.redrawRows();
                } catch (error) {
                    this.$toast({
                        type: 'danger',
                        title: 'Whoops!',
                        message: 'Unable to delete the check, please try again.',
                        duration: 3000
                    });
                    console.error('Error: Something went wrong while deleting an item!');
                    console.error(error);
                }
            }  
            else {
                let checksString = "";
                this.grid.selectedRows.forEach(check => {
                    checksString += check.id + ',';
                });
                checksString = checksString.replace(/,\s*$/, "");
                this.$refs.pop.popover.close();
                try {
                    await this.deleteChecks(checksString);
                    this.$refs.grid.gridOptions.api.redrawRows();
                } catch (error) {
                    this.$toast({
                        type: 'danger',
                        title: 'Whoops!',
                        message: 'Unable to delete the selected checks, please try again.',
                        duration: 3000
                    });
                    console.error('Error: Something went wrong while deleting multiple items!');
                    console.error(error);
                }
            }
        },
        /**
         * Save a new check instance to the api
         */
        async save () {
            // intercept blank value and change it to null
            this.verifyEdoc();
            this.disableSave.new = true;
            // Get the comments, if there are any
            let comments = this.fetchComments();
            try {
                const response = await this.postCheck();
                if (response !== null && !Object.keys(this.errors).length) {
                    // Post comments, if they exist
                    if (comments) {
                        await this.postCommentsAfterCreate(comments, response.data.id);
                    }
                    this.closeNewModal();
                    await this.addUnsignedCheck(response.data);
                    await this.$refs.grid.gridOptions.api.redrawRows();
                }
            } catch (error) {
                this.$toast({
                    type: 'danger',
                    title: 'Whoops!',
                    message: 'Unable to save, please try again.',
                    duration: 3000
                });
                console.error("something went wrong on Save:");
                console.error(error);
            }
            this.disableSave.new = false;
        },
        /**
         * Save a new check instance to the api and open a new create modal with some fields copied over
         */
        async saveAndCopy () {
            this.verifyEdoc();
            this.disableSave.new = true;
            // Get the comments, if there are any
            let comments = this.fetchComments();
            try {
                const response = await this.postCheck();
                if (response !== null && !Object.keys(this.errors).length) {
                    // Post comments, if they exist
                    if (comments) {
                        await this.postCommentsAfterCreate(comments, response.data.id);
                    }
                    // Deep copy the item and modify contents
                    let savedState = JSON.parse(JSON.stringify(this.activeCheck));
                    // Clear everything that we don't want to keep
                    savedState.id = undefined;
                    savedState.check_identifier = undefined;
                    savedState.payee_name = '';
                    savedState.payee_number = '';
                    savedState.edoc_number = '';
                    savedState.due_date = null;
                    savedState.org_code = '';
                    savedState.instructions = '';
                    savedState.check_number = '';
                    savedState.contacted = false;
                    this.setCheck(savedState);
                    // Reset comments so that next check has no comments associated with it
                    this.activeCheck.comments = [];
                    // Reset comment submission box text
                    this.activeComment.comment = "";
                    // Partially refresh the grid                         
                    this.addUnsignedCheck(response.data)
                        .then(() => this.$refs.grid.gridOptions.api.redrawRows())
                        .catch((error) => {
                            console.error("something went wrong on Refresh:");
                            console.error(error);
                        });
                    Animation.animateTwice('#createModal .modal .modal-dialog .modal-content', 'bounceOutDown', 'bounceInDown');
                }
            } catch (error) {
                this.$toast({
                    type: 'danger',
                    title: 'Whoops!',
                    message: 'Unable to save and copy, please try again.',
                    duration: 3000
                });
                console.error("Something went wrong on Save and Copy:");
                console.error(error);
            }
            this.disableSave.new = false;
        },
        /**
         * Update a check in the api
         */
        async update () {
            // intercept blank value and change it to null
            this.verifyEdoc();
            this.disableSave.edit = true;
            try {
                let response = await this.putCheck();
                if (response !== null && !Object.keys(this.errors).length) {
                    this.closeEditModal();
                    await this.fetchCheckById(this.activeCheck.id);
                    await this.updateActiveCheck(this.activeCheck);
                    await this.$refs.grid.gridOptions.api.redrawRows();
                }
            } catch (error) {
                this.$toast({
                    type: 'danger',
                    title: 'Whoops!',
                    message: 'Unable to update the check, please try again.',
                    duration: 3000
                });
                console.error("something went wrong on Save:");
                console.error(error);
            }
            this.disableSave.edit = false;
        },
        /**
         * Update multiple checks in the api
         */
        async updateMultipleChecks (data) {
            this.disableSave.multipleEdit = true;
            // Handle looping through and POSTing new comments first
            await this.appendCommentToCheck(data.comment);
            // Then update the Contacted and Instructions field
            try {
                let response = await this.putChecks(data);
                if (response !== null && !Object.keys(this.errors).length) {
                    // If the vuex checks module and the local batchChecks.batchCommentErrors.comment have no errors/content
                    if (this.batchChecks.batchCommentErrors.comment === undefined) {
                        this.modalVisible.multipleEdit = false;
                        this.batchChecks.to_modify = "";
                        this.refreshGrid();
                    }
                }
            } catch (error) {
                this.$toast({
                    type: 'danger',
                    title: 'Whoops!',
                    message: 'Unable to update the selected check, please try again.',
                    duration: 3000
                });
                console.error("something went wrong on Save:");
                console.error(error);
            }
            this.disableSave.multipleEdit = false;
        },

        // Utility Functions

        /**
         * When a comment is created for a check that is not yet created, we need to temporarily store it
         * and display it, then post them later. Temporary `created` and `user` properties are added for display
         * purposes, and will be replaced before posting.
         * @param {Object} comment a comment object
         */
        appendCommentToCreate (comment) {
            let newComment = {
                created: Date.now(),
                user: 'You',
                ...comment
            };
            this.activeCheck.comments.push(newComment);
        },
        /**
         * Grab the comments from the activeCheck (via a deep copy) for posting after creation
         * @returns {(Array | undefined)}
         */
        fetchComments () {
            let comments = (Array.isArray(this.activeCheck.comments) && this.activeCheck.comments.length > 0)
                ? JSON.parse(JSON.stringify(this.activeCheck.comments))
                : undefined;
            return comments;
        },
        /**
         * After creating a new check, post any comments that were added.
         * @param {Array} comments an array of comment objects
         * @param {Number} checkId the check id to post comments for
         * @returns {Promise}
         */
        async postCommentsAfterCreate (comments, checkId) {
            let cleanedComments = comments.map(c => {
                return {
                    comment: c.comment,
                    related_check: checkId
                };
            });
            try {
                for (let comment of cleanedComments) {
                    await this.postComment(comment);
                }
            } catch (error) {
                this.$toast({
                    type: 'danger',
                    title: 'Whoops!',
                    message: 'Something went wrong posting comments! Please edit the check to add comments.'
                });
                console.error('Something went wrong posting comments:');
                console.error(error);
            }
        },
        /**
         * Append a comment to the check, only used by `updateMultipleChecks`.
         * @param {Object} comment a comment object
         */
        async appendCommentToCheck (comment) {
            // Reset so that correcting the post after failure
            let idArray = this.grid.selectedRows.map(rowObject => rowObject.id);
            for (var item of idArray) {
                this.batchChecks.batchComment.related_check = item;
                this.batchChecks.batchComment.comment = comment;
                if (this.batchChecks.batchComment.comment !== undefined) {
                    try {
                        let response = await CommentsService.create(this.batchChecks.batchComment);
                        if (response.status != 201) {
                            // Break comment when first error is reported by API. Otherwise the same error will repeat for every item in the loop
                            break;
                        }
                    } catch (error) {
                        this.batchChecks.batchCommentErrors.comment = error.response.data.comment[0];
                    }
                }

            }
        },
        /**
         * Close the deletion warning popover
         */
        closeDrop () {
            this.$refs.pop.popover.close();
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
            let passes = true;

            // User filtering - filter by username
            node.data.user.includes(this.grid.externalFilters.user)
                ? passes = true
                : passes = false;

            // HasCheckNumber filtering - If the filter is not 'all', it'll be 'true' or 'false'
            if (this.grid.externalFilters.hasCheckNumber === 'true') { 
                node.data.check_number
                    ? passes = true
                    : passes = false;
            } else if (this.grid.externalFilters.hasCheckNumber === 'false') {
                node.data.check_number
                    ? passes = false
                    : passes = true;
            }
            return passes;
        },
        /**
         * Toggle filtering by presence of a check number
         * @param {Number} val a check number
         */
        filterByHasCheckNumber (val) {
            this.grid.externalFilters.hasCheckNumber = val;
            this.grid.gridOptions.api.onFilterChanged();
        },
        /**
         * Toggle filtering by username
         * @param {String} val a username
         */
        filterByUser (val) {
            this.grid.externalFilters.user = val;
            this.grid.gridOptions.api.onFilterChanged();
        }
    }
};
</script>

<style lang="scss">
#quickFilterBox__home {
    @media screen and (max-width: 700px) {
        width: 130px;
    }
}

#multipleWarning {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    margin-bottom: 0px;
}

.home-modal {
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    @media screen and (max-width: 576px) {
        flex-direction: column;       
    }

    .home-modal__comments {
        margin-left: 0.5em;
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

.delete-confirm {
    margin-left: 0.125em;
    margin-right: 0.125em;
    z-index: 10;

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
.card-block{
        padding: 0rem;
}
.comments__header {
    padding-right: 30px;
}
</style>
