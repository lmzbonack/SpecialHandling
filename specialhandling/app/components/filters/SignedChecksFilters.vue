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
            <select-single id="selectInstructions" class="col-6 col-sm-4 col-lg-3" label="Instructions" 
                           :options="options.instructions" v-model="filters.instructions.filter"
                           placeholder="">
            </select-single>
            <text-box id="selectEdocNumber" class="col-6 col-sm-4 col-lg-3" label="Edoc #"
                      v-model="filters.edoc_number.filter" placeholder="XXXXXXX">
            </text-box>
            <text-box id="selectOrgCode" class="col-4 col-sm-4 col-lg-3" label="Org Code"
                      v-model="filters.org_code.filter" placeholder="XXXX">
            </text-box>
            <text-box id="selectContactName" class="col-4 col-sm-4 col-lg-3" label="Contact Name"
                      v-model="filters.contact_name.filter" placeholder="Wilma Wildcat">
            </text-box>
            <text-box id="selectContactNumber" class="col-4 col-sm-4 col-lg-3" label="Contact Phone"
                      v-model="filters.contact_number.filter" placeholder="1-234-567-8910"
                      v-f-mask.jit="'999-999-9999[ ext 9999]'">
            </text-box>
            <text-box id="selectContactEmail" class="col-6 col-sm-4 col-lg-3" label="Contact Email"
                      v-model="filters.contact_email.filter" placeholder="wilma@email.arizona.edu">
            </text-box>
            <div class="form-group col-6 col-sm-4 col-lg-3">
                <label class="form-control-label">Contacted</label>
                <segmented-toggle ref="contacted" type="primary" outline full-width
                                  name="contacted" :options="options.contacted"
                                  value="all" @input="filterByContacted"/>
            </div>
            <div class="form-group col-6 col-sm-4 col-lg-3">
                <label class="form-control-label">Picked Up</label>
                <segmented-toggle ref="pickedup" type="primary" outline full-width
                                  name="pickedup" :options="options.pickedUp"
                                  value="all" @input="filterByPickedUp"/>
            </div>
            <text-box id="selectReceivedBy" class="col-6 col-sm-4 col-lg-3" label="Received By"
                      v-model="filters.received_by.filter" placeholder="Wilma Wildcat">
            </text-box>
            <text-box id="selectDateReceived" type="date" class="col-6 col-sm-4 col-lg-3" label="Date Received"
                      v-model="filters.date_received.filter" placeholder="11-25-2018">
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
    name: 'SignedChecksFilters',
    mixins: [filtersMixin],
    data () {
        return {
            options: {
                contacted: [
                    { value: 'true', label: 'Yes' },
                    { value: 'false', label: 'No' },
                    { value: 'all', label: 'All', checked: true }
                ],
                pickedUp: [
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
            // Bindings for the filter values
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
                date_received: {
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
                },
                picked_up: {
                    value: ''
                },
                received_by: {
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
            // Reset grid api to no filtering
            this.gridApi.setFilterModel(null);
            this.gridApi.onFilterChanged();
        }
    }
};
</script>
