import { mount, createLocalVue } from '@vue/test-utils';
import Vueoom from 'vueoom';
import SignatureForm from '../../../components/forms/SignatureForm.vue';

const localVue = createLocalVue();
localVue.use(Vueoom);

describe('SignatureForm.test.js', () => {
    let wrapper;

    let activeSignature = {
        first_name: '',
        last_name: '',
        signature: '',
        related_check: undefined
    };

    beforeEach(() => {
        wrapper = mount(SignatureForm, {
            localVue,
            propsData: {
                relatedCheck: 1
            },  
            computed: {
                activeSignature: () => { return activeSignature; },
                errors: () => { return {}; }
            },
            stubs: [
                'vue-signature'
            ]
        });
    });

    it('has the expected html structure', () => {
        expect(wrapper.element).toMatchSnapshot();
    });

    // TODO: Test form element bindings

    // TODO: Test that errors will display
});
