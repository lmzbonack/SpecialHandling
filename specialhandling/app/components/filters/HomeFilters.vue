<template>
    <div class="search-form">
        <div class="row mx-0">
            <text-box id="selectPayeeName" class="col-6 col-sm-4 col-lg-3" label="Payee Name"
                      v-model="filters.payee_name.filter" placeholder="Wilbur Wildcat">
            </text-box>
            <text-box id="selectPayeeNumber" class="col-6 col-sm-4 col-lg-3" label="Payee Number"
                      v-model="filters.payee_number.filter" placeholder="XXXXXXXXXX">
            </text-box>
            <select-single id="selectCheckIdentifier" class="col-6 col-sm-4 col-lg-3" label="Check Identifier"
                           v-model="filters.check_identifier.filter" :options="options.checkIdentifier"
                           placeholder="">
            </select-single>
            <text-box id="selectCheckNumber" class="col-6 col-sm-4 col-lg-3" label="Check Number"
                      v-model="filters.check_number.filter" placeholder="XXXXXXX">
            </text-box>
            <select-single id="selectInstructions" class="col-12 col-sm-4 col-lg-3" label="Instructions" 
                           v-model="filters.instructions.filter" :options="options.instructions"
                           placeholder="">
            </select-single>
            <text-box id="selectEdocNumber" class="col-4 col-sm-4 col-lg-3" label="Edoc #"
                      v-model="filters.edoc_number.filter" placeholder="XXXXXXX">
            </text-box>
            <text-box id="selectOrgCode" class="col-4 col-sm-4 col-lg-3" label="Org Code"
                      v-model="filters.org_code.filter" placeholder="XXXX">
            </text-box>
            <text-box id="selectDueDate" type="date" class="col-4 col-sm-4 col-lg-3" label="Due Date"
                      v-model="filters.due_date.filter">
            </text-box>
            <text-box id="selectContactName" class="col-4 col-sm-4 col-lg-3" label="Contact Name"
                      v-model="filters.contact_name.filter" placeholder="Wilma Wildcat">
            </text-box>
            <text-box id="selectContactNumber" class="col-4 col-sm-4 col-lg-3" label="Contact Phone"
                      v-model="filters.contact_number.filter" placeholder="1-234-567-8910"
                      v-f-mask.jit="'999-999-9999[ ext 9999]'">
            </text-box>
            <text-box id="selectContactEmail" class="col-4 col-sm-4 col-lg-3" label="Contact Email"
                      v-model="filters.contact_email.filter" placeholder="wilma@email.arizona.edu">
            </text-box>
            <div class="form-group col-6 col-sm-4 col-lg-3">
                <label class="form-control-label">Contacted</label>
                <segmented-toggle ref="contacted" type="primary" outline full-width
                                  name="contacted" :options="options.contacted"
                                  value="all" @input="filterByContacted"/>
            </div>
            <div class="form-group col-6 col-sm-4 col-lg-3">
                <label class="form-control-label">Has Check Number</label>
                <segmented-toggle ref="hasCheckNumber" type="primary" outline full-width
                                  name="hasCheckNumber" :options="options.hasCheckNumber"
                                  value="all" @input="filterByHasCheckNumber"/>
            </div>
            <text-box id="selectDateCreated" type="date" class="col-6 col-sm-4 col-lg-3" label="Date Created"
                      v-model="filters.created.filter">
            </text-box>
            <text-box id="selectCreatedBy" class="col-6 col-sm-4 col-lg-3" label="Created By"
                      value="" @input="filterByUser" placeholder="FSO username">
            </text-box>
        </div>
        <div class="form-buttons">
            <command type="warning" outline icon="eraser" label="Clear" @action="resetFiltering"/>
            <command class="ml-1" icon="close" label="Close" @action="close"/>
        </div>
    </div>
</template>

<script>
import { instructionsOptions } from '../../utils/constants';
import filtersMixin from '../../mixins/filters.js';

export default {
    name: 'HomeFilters',
    mixins: [filtersMixin],
    data () {
        return {
            options: {
                contacted: [
                    { value: 'true', label: 'Yes' },
                    { value: 'false', label: 'No' },
                    { value: 'all', label: 'All', checked: true }
                ],
                hasCheckNumber: [
                    { value: 'true', label: 'Yes' },
                    { value: 'false', label: 'No' },
                    { value: 'all', label: 'All', checked: true }
                ],
                instructions: instructionsOptions,
                checkIdentifier: [ 
                    { text: 'Accounts Payable', value: 'accounts payable' },
                    { text: 'Payroll', value: 'payroll' }
                ]
            },
            filters: {
                check_number: {
                    type: 'contains',
                    filter: '',
                    filterType: 'text'
                },
                check_identifier: {
                    type: 'contains',
                    filter: '',
                    filterType: 'text'
                },
                contact_email: {
                    type: 'contains',
                    filter: '',
                    filterType: 'text'
                },
                contact_name: {
                    type: 'contains',
                    filter: '',
                    filterType: 'text'
                },
                contact_number: {
                    type: 'contains',
                    filter: '',
                    filterType: 'text'
                },
                contacted: {
                    value: ''
                },
                created: {
                    type: 'contains',
                    filter: '',
                    filterType: 'text'
                },
                due_date: {
                    type: 'contains',
                    filter: '',
                    filterType: 'text'
                },
                edoc_number: {
                    type: 'contains',
                    filter: '',
                    filterType: 'text'
                },
                instructions: {
                    type: 'contains',
                    filter: '',
                    filterType: 'text'
                },
                org_code: {
                    type: 'contains',
                    filter: '',
                    filterType: 'text'
                },
                payee_name: {
                    type: 'contains',
                    filter: '',
                    filterType: 'text'
                },
                payee_number: {
                    type: 'contains',
                    filter: '',
                    filterType: 'text'
                }
            }
        };
    },
    methods: {
        resetFiltering () {
            // Clear all the inputs
            for (let f in this.filters) {
                if (this.filters[f].filter) {
                    this.filters[f].filter = '';
                } else if (this.filters[f].value) {
                    this.filters[f].value = '';
                }
            }
            // Reset segmented toggles to their default values
            this.$refs.contacted.setToDefault();
            this.$refs.hasCheckNumber.setToDefault();
            // Reset grid api to no filtering
            this.gridApi.setFilterModel(null);
            this.gridApi.onFilterChanged();
        }
    }
};
</script>
