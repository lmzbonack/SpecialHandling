import { mount, createLocalVue } from '@vue/test-utils';
import Vueoom, { Command } from 'vueoom';
import MultipleEditForm from '../../../components/forms/MultipleEditForm.vue';

const localVue = createLocalVue();
localVue.use(Vueoom);

describe('MultipleEditForm.test.js', () => {
    let wrapper;

    let props = {
        batchCommentErrors: {
            comment: "It Is All Busted"
        },
        modChecks: "1,2",
        disableSave: false,
    };

    beforeEach(() => {
        wrapper = mount(MultipleEditForm, {
            localVue,
            propsData: {
                ...props
            },
            computed: {
                errors: () => { return {}; }       
            },
            stubs: [
                'alert',
                'select-single'
            ]
        });
    });

    it('has the expected html structure', () => {
        expect(wrapper.element).toMatchSnapshot();
    });

    // Events
    // Close
    it('emits the close event when the cancel button is clicked', () => {
        expect(wrapper.emitted().close).toBeFalsy();
        wrapper.findAll(Command).at(0).trigger('click');
        expect(wrapper.emitted().close).toBeTruthy();
    }); 
    // Submit
    it('emits the submit event when the submit button is clicked', () => {
        expect(wrapper.emitted().submit).toBeFalsy();
        wrapper.findAll(Command).at(1).trigger('click');
        expect(wrapper.emitted().submit).toBeTruthy();
    }); 

    // Form Bindings
    // instructions - not tested at this time because select-single is not Jest friendly
    // it('binds to instructions properly', () => {
    //     const input = wrapper.find('#instructions');
    //     const value = 'ups';
    //     input.element.value = value;
    //     input.trigger('input');
    //     expect(wrapper.vm.formData.instructions).toBe(value);
    // });

    it('binds to contacted properly', () => {
        const input = wrapper.find('#contacted');
        const value = true;
        input.element.checked = value;
        input.trigger('change');
        expect(wrapper.vm.formData.contacted).toBe(value);
    });

    it('binds to multiComment properly', () => {
        const input = wrapper.find('#multiComment');
        const value = 'Look at all these comments';
        input.element.value = value;
        input.trigger('input');
        expect(wrapper.vm.formData.comment).toBe(value);
    });

    it('Does not allow submission if disableSave is true', () => {
        wrapper.vm.disableSave = true;
        wrapper.findAll(Command).at(1).trigger('click');
        expect(wrapper.emitted().submit).toBeFalsy();
    });

    it('Allows submission if disableSave is false', () => {
        wrapper.vm.disableSave = false;
        wrapper.findAll(Command).at(1).trigger('click');
        expect(wrapper.emitted().submit).toBeTruthy();
    });
});
