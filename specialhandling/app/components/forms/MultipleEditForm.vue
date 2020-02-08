<template>
    <div class="edit-form_wrapper">
        <select-single id="instructions" label="Instructions:" :options="instructionsOptions"
                       v-model="formData.instructions" placeholder="Select an option..."
                       :danger="!!errors.instructions" :danger-message="errors.instructions">
        </select-single>
        <check-box id="contacted" label="Contacted" 
                   v-model="formData.contacted">
        </check-box>
        <text-view id="multiComment" type="text" label="Comment:" v-model="formData.comment"
                   :danger="!!batchCommentErrors.comment" :danger-message="batchCommentErrors.comment">
        </text-view>
        <alert id="multipleEditWarning" type="warning" message="You are editing multiple checks"></alert>
        <div class="d-flex justify-content-end align-items-center">
            <command id="multipleEditCancel" icon="times" label="Cancel" type="danger"
                     @action="close"/>
            <command id="multipleEditSave" icon="save" label="Save" type="success" :disabled="disableSave"
                     @action="submit"/>
        </div> 
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { instructionsOptions } from '../../utils/constants';

export default {
    name: 'MultipleEditForm',
    props: {
        modChecks: {
            type: String,
            required: true
        },
        batchCommentErrors: {
            type: Object,
            required: true
        },
        disableSave: {
            type: Boolean,
            required: true
        }
    },
    data () {
        return {
            instructionsOptions,
            formData: {
                to_modify: this.modChecks,
                instructions: undefined,
                contacted: undefined,
                comment: undefined
            }
        };
    },
    computed: {
        ...mapGetters('checks', [
            'errors'
        ]),
    },
    methods: {
        /**
         * Close the form
         */
        close () {
            this.$emit("close");
        },
        /**
         * Submit the form
         */
        submit () {
            this.$emit("submit", this.formData);
        } 

    }
};
</script>

<style lang="scss" scoped>

.edit-form__wrapper {
    display: flex;
    flex: auto;
    flex-direction: column;
}

#multipleEditSave {
    margin-left: .5em; 
}

</style>
