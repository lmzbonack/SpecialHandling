import { mount, createLocalVue } from '@vue/test-utils';
import Vueoom, { CommandDropdown } from 'vueoom';
import AdvancedSearch from '../../../components/AdvancedSearch.vue';
import VTooltip from 'v-tooltip';
import filters from '../../../utils/filters';
import commandDropdownMock from '../__mocks__/commandDropdownMock.vue';

const localVue = createLocalVue();
localVue.use(Vueoom);
localVue.use(filters);
localVue.use(VTooltip);

describe('AdvancedSearch.test.js', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(AdvancedSearch, {
            localVue,
            stubs: {
                'command-dropdown': commandDropdownMock
            }
        });
    });

    it('has the expected html structure', () => {
        expect(wrapper.element).toMatchSnapshot();
    });

    it('toggles the collapse area when the `Advanced Search` button is clicked', () => {
        expect(wrapper.vm.filters).toBe(false);
        wrapper.find('.expand-toggle').trigger('click');
        expect(wrapper.vm.filters).toBe(true);
    });

    it('toggles select type when the select dropdown button is clicked', () => {
        const btn = wrapper.find(CommandDropdown).findAll('.btn').at(0);
        expect(wrapper.vm.multiselect).toBe(false);
        btn.trigger('click');
        expect(wrapper.vm.multiselect).toBe(true);
        btn.trigger('click');
        expect(wrapper.vm.multiselect).toBe(false);
        // Ensure event has been emitted as many times as it should
        expect(wrapper.emitted().toggleMultiSelect).toHaveLength(2);
    });

    it('toggles selection mode and shows the user the current selection mode', () => {
        const btn = wrapper.find(CommandDropdown);
        wrapper.setData({
            multiselect: false
        });
        expect(wrapper.vm.selectionMode).toBe('single');
        expect(btn.vm.label).toBe('Single');
        wrapper.setData({
            multiselect: true
        });
        expect(wrapper.vm.selectionMode).toBe('multiple');
        expect(btn.vm.label).toBe('Multiple');
    });

    it('hides the selection dropdown if `showSelectionOptions` is false', () => {
        expect(wrapper.vm.showSelectionOptions).toBe(true);
        wrapper.setProps({
            showSelectionOptions: false
        });
        expect(wrapper.vm.showSelectionOptions).toBe(false);
        expect(wrapper.find(CommandDropdown).exists()).toBeFalsy();
    });
    
    it('emits `selectAll` event', () => {
        wrapper.vm.selectAll();
        expect(wrapper.emitted().selectAll).toBeTruthy();
    });

    it('emits `selectNone` event', () => {
        wrapper.vm.selectNone();
        expect(wrapper.emitted().selectNone).toBeTruthy();
    });
});
