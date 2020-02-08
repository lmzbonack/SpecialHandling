import { mount, createLocalVue } from '@vue/test-utils';
import Vueoom from 'vueoom';
import CreateForm from '../../../components/forms/CreateForm.vue';

const localVue = createLocalVue();
localVue.use(Vueoom);

describe('CreateForm.test.js', () => {
    let wrapper;

    let activeCheck = {
        payee_name: '',
        payee_number: '',
        edoc_number: '',
        check_identifier: 'payroll',
        org_code: '',
        instructions: '',
        check_number: '',
        contact_name: '',
        contact_number: '',
        contact_email: '',
        due_date: null,
        contacted: false,
        picked_up: false,
        signature: {},
        comments: []
    };

    beforeEach(() => {
        wrapper = mount(CreateForm, {
            localVue,
            computed: {
                activeCheck: () => { return activeCheck; },
                errors: () => { return {}; }
            },
            stubs: [
                'select-single'
            ]
        });
    });

    it('has the expected html structure', () => {
        expect(wrapper.element).toMatchSnapshot();
    });

    // TODO: Test form element bindings

    // TODO: Test that errors will display

    it('disables EDOC number field when check id is payroll', () => {
        wrapper.vm.activeCheck.check_identifier = 'payroll';
        const input = wrapper.find('#edocNum');
        expect(input.element.disabled).toBe(true);
    });

    // Skip for now. Have to figure out how to test computed properties with getters and setters
    // it('does not disable EDOC number field when check id is accounts payable', () => {
    //     wrapper.vm.activeCheck.check_identifier = 'accounts payable';
    //     console.log(wrapper.vm.activeCheck);
    //     const input = wrapper.find('#edocNum');
    //     console.log("AP:" + input.element.disabled);
    //     expect(input.element.disabled).toBe(false);
    // });
});
