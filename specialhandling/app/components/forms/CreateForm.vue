<template>
    <div class="row">
        <text-box id="payeeNumber" class="col-md-6" type="text" label="Payee Number:" 
                  v-model="activeCheck.payee_number" placeholder="XXXXXXX"
                  :danger="!!errors.payee_number" :danger-message="errors.payee_number">
        </text-box>
        <text-box id="payeeName" class="col-md-6" type="text" label="Payee Name:" 
                  v-model="activeCheck.payee_name" placeholder="Wilbur Wildcat"
                  :danger="!!errors.payee_name" :danger-message="errors.payee_name">
        </text-box>
        <select-single id="checkIdentifier" class="col-md-6" label="Check Identifier:"
                       v-model="activeCheck.check_identifier" :options="checkIdOptions" placeholder="Select an option..."
                       :danger="!!errors.check_identifier" :danger-message="errors.check_identifier">
        </select-single>
        <text-box id="edocNum" class="col-md-6" type="text" label="Edoc Number:" 
                  v-model="activeCheck.edoc_number" placeholder="XXXXXXX"
                  :disabled="activeCheck.check_identifier === 'payroll'"
                  :danger="!!errors.edoc_number" :danger-message="errors.edoc_number">
        </text-box>
        <text-box id="orgCode" class="col-md-6" type="text" label="Org Code:" 
                  v-model="activeCheck.org_code" placeholder="XXXX"
                  :danger="!!errors.org_code" :danger-message="errors.org_code">
        </text-box>
        <text-box id="checkNumber" class="col-md-6" type="text" label="Check Number:" 
                  v-model="activeCheck.check_number" placeholder="XXXXXXXXX"
                  :danger="!!errors.check_number" :danger-message="errors.check_number">
        </text-box>
        <text-box id="dueDate" class="col-md-6" type="date" label="Due Date:" 
                  v-model="activeCheck.due_date" placeholder="mm/dd/yyyy"
                  :danger="!!errors.dueDate" :danger-message="errors.dueDate">
        </text-box>
        <select-single id="instructions" class="col-md-6" label="Instructions:"
                       v-model="activeCheck.instructions" :options="instructionsOptions" placeholder="Select an option..."
                       :danger="!!errors.instructions" :danger-message="errors.instructions">
        </select-single>
        <text-box id="contactName" class="col-md-6" type="text" label="Contact Name:" 
                  v-model="activeCheck.contact_name" placeholder="Wilma Wildcat"
                  :danger="!!errors.contact_name" :danger-message="errors.contact_name">
        </text-box>
        <text-box id="contactNumber" class="col-md-6" type="text" label="Contact Number:" 
                  v-model="activeCheck.contact_number" placeholder="XXX-XXX-XXXX"
                  v-f-mask.jit="'999-999-9999[ ext 9999]'"
                  :danger="!!errors.contact_number" :danger-message="errors.contact_number">
        </text-box>
        <text-box id="contactEmail" class="col-md-6" type="text" label="Contact Email:" 
                  v-model="activeCheck.contact_email" placeholder="wilma@email.arizona.edu"
                  :danger="!!errors.contact_email" :danger-message="errors.contact_email">
        </text-box>
        <div class="col-md-6">
            <label for="contacted">Contacted?</label>
            <check-box id="contacted" class="align"
                       :label="activeCheck.contacted ? 'Yes': 'No'" 
                       v-model="activeCheck.contacted">
            </check-box>
        </div>
        <div class="col-12">
            <alert id="nonFieldErrors" v-if="errors.non_field_errors" type="danger" :message="errors.non_field_errors"></alert>
        </div>
        <div class="col-12">
            <alert id="serverAlert" v-if="errors.server" type="danger" :message="errors.server"></alert>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { instructionsOptions, checkIdOptions } from '../../utils/constants';

export default {
    name: 'CreateForm',
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
    }
};
</script>
