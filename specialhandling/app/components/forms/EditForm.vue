<template>
    <div class="row">
        <text-box id="payeeNumber" class="col-md-6"
                  type="text" label="Payee Number:" 
                  v-model="activeCheck.payee_number" placeholder="XXXXXXX"
                  :danger="!!errors.payee_number" :danger-message="errors.payee_number">
        </text-box>
        <text-box id="payeeName" class="col-md-6"
                  type="text" label="Payee Name:" 
                  v-model="activeCheck.payee_name" placeholder="Wilbur Wildcat"
                  :danger="!!errors.payee_name" :danger-message="errors.payee_name">
        </text-box>
        <select-single id="checkIdentifier" class="col-md-6"
                       label="Check Identifier:" :options="checkIdOptions"
                       v-model="activeCheck.check_identifier" placeholder="Select an option..."
                       :danger="!!errors.check_identifier" :danger-message="errors.check_identifier">
        </select-single>
        <text-box id="edocNum" class="col-md-6"
                  type="text" label="Edoc Number:" 
                  v-model="activeCheck.edoc_number" placeholder="XXXXXXX"
                  :disabled="activeCheck.check_identifier === 'payroll'"
                  :danger="!!errors.edoc_number" :danger-message="errors.edoc_number">
        </text-box>
        <text-box id="orgCode" class="col-md-6"
                  type="text" label="Org Code:" 
                  v-model="activeCheck.org_code" placeholder="XXXX"
                  :danger="!!errors.org_code" :danger-message="errors.org_code">
        </text-box>
        <text-box id="checkNumber" class="col-md-6"
                  type="text" label="Check Number:" 
                  v-model="activeCheck.check_number" placeholder="XXXXXXXXX"
                  :danger="!!errors.check_number" :danger-message="errors.check_number">
        </text-box>
        <text-box id="dueDate" class="col-md-6"
                  type="date" label="Due Date:" 
                  v-model="activeCheck.due_date"
                  :danger="!!errors.dueDate" :danger-message="errors.dueDate">
        </text-box>
        <select-single id="instructions" class="col-md-6"
                       label="Instructions:" :options="instructionsOptions"
                       v-model="activeCheck.instructions" placeholder="Select an option..."
                       :danger="!!errors.instructions" :danger-message="errors.instructions">
        </select-single>         
        <text-box id="contactName" class="col-md-6"
                  type="text" label="Contact Name:" 
                  v-model="activeCheck.contact_name" placeholder="Wilma Wildcat"
                  :danger="!!errors.contact_name" :danger-message="errors.contact_name">
        </text-box>
        <text-box id="contactNumber" class="col-md-6"
                  type="text" label="Contact Number:" v-f-mask.jit="'999-999-9999[ ext 9999]'"
                  v-model="activeCheck.contact_number" placeholder="XXX-XXX-XXXX"
                  :danger="!!errors.contact_number" :danger-message="errors.contact_number">
        </text-box>
        <text-box id="contactEmail" class="col-md-6"
                  type="text" label="Contact Email:" 
                  v-model="activeCheck.contact_email" placeholder="wilma@email.arizona.edu"
                  :danger="!!errors.contact_email" :danger-message="errors.contact_email">
        </text-box>
        <div class="form-group col-md-6">
            <label for="contacted">Contacted?</label>
            <check-box id="contacted" class="align"
                       :label="activeCheck.contacted ? 'Yes': 'No'" 
                       v-model="activeCheck.contacted">
            </check-box>
        </div>
        <div class="col-12">
            <alert v-if="errors.non_field_errors" id="serverAlert_NONFIELD"
                   type="danger" :message="errors.non_field_errors">
            </alert>
        </div>
        <div class="col-12">
            <alert v-if="errors.server" id="serverAlert_EDIT"
                   type="danger" :message="errors.server">
            </alert>
        </div>
        <!-- add archived signatures --> 
        <div class="col-12" v-if="activeCheck.archived_signatures != null">
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

        <!-- Slot for the "last modified by..." message -->
        <slot></slot>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import moment from 'moment';
import { instructionsOptions, checkIdOptions } from '../../utils/constants';

export default {
    name: 'EditForm',
    data () {
        return {
            instructionsOptions,
            checkIdOptions
        };
    },
    computed: {
        ...mapGetters('checks', [
            'activeCheck',
            'errors'
        ])
    },
    methods: {
        archivedCreated (tempData) {
            return `${moment(tempData).startOf('minute').fromNow()} at \
                    ${moment(tempData).format('h:mm a')}`;
        }
    }
};
</script>
