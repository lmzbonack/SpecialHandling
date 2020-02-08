<template>
    <div class="row">
        <text-box id="firstNameTextBox" class="col-sm-6"
                  type="text" label="First Name:"
                  v-model="formData.first_name" placeholder="Wilbur"
                  :danger="!!errors.first_name" :danger-message="errors.first_name"/>
        <text-box id="lastNameTextBox" class="col-sm-6"
                  type="text" label="Last Name:"
                  v-model="formData.last_name" placeholder="Wildcat"
                  :danger="!!errors.last_name" :danger-message="errors.last_name"/>
        <div class="form-group col-12" :class="[{'has-danger': errors.signature}]">
            <label for="signature">Signature:</label>
            <vue-signature id="signature" ref="signature" :sig-option="options" :h="'200px'"></vue-signature>
            <div v-if="errors.signature" class="form-control-feedback">{{ errors.signature }}</div>
            <small class="form-text text-muted">Draw your signature in the area above.</small>
        </div>
        <div v-if="errors.related_check" class="col-12 mb-1">
            <alert id="related-check-error" type="danger">
                This check appears to have previously been signed!
                <hr>
                Please refresh the page and try again to ensure updated data from the server and report this error if it persists.
            </alert>
        </div>
        <div v-if="errors.server" class="col-12">
            <alert id="serverAlert_SIGN" type="danger" :message="errors.server"/>
        </div>
    </div>
</template>
<script>
import { mapGetters } from 'vuex';
export default {
    name: 'SignatureForm',
    data () {
        return {
            options: {
                penColor: "rgb(0, 0, 0)",
                backgroundColor: "rgba(255, 255, 255, 0)"
            },
            formData: {
                first_name: '',
                last_name: '',
                signature: ''
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
         * Render the signature
         */
        render () {
            const canvas = document.getElementById(this.$refs.signature.uid);
            canvas.width = 468;
            canvas.height = 200;
            // This doesn't work for some reason, should let us set the width
            // to the same as the canvas' parent element.
            // canvas.width = document.getElementById('sig').offsetWidth;
            // canvas.height = document.getElementById('sig').offsetHeight;
            this.clear();
        },
        /**
         * Return the signature from data
         * @returns {Object}
         */
        getSignature () {
            this.formData.signature = this.$refs.signature.save('image/svg');
            return this.formData;
        },
        /**
         * Clear the form
         */
        clear () {
            this.$refs.signature.clear();
            this.formData = {
                first_name: '',
                last_name: '',
                signature: ''
            };
        },
        /**
         * Check that a signature has been drawn
         * @return {Boolean}
         */
        checkIfEmpty () {
            return this.$refs.signature.isEmpty();
        }
    }
};
</script>
<style lang="scss">
#signature {
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 0.25em;
}
</style>
