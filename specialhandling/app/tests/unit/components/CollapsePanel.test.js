import { mount, createLocalVue } from '@vue/test-utils';
import CollapsePanel from '../../../components/CollapsePanel.vue';
import Vueoom from 'vueoom';

const localVue = createLocalVue();
localVue.use(Vueoom);

describe('CollapsePanel.test.js', () => {
    let wrapper;

    wrapper = mount(CollapsePanel, {
        localVue,
        propsData: {
            title: "Thicc",
            collapsed: false
        }
    });
    
    test('has the expected html structure', () => {
        expect(wrapper.element).toMatchSnapshot();
    });

    // This also tests the collapsed watcher and the created event hook
    test('toggleCollapse method toggles collapsedState', () => {
        expect(wrapper.vm.collapsedState).toEqual(false);
        wrapper.vm.toggleCollapse();
        expect(wrapper.vm.collapsedState).toEqual(true);
    });

    test('Make sure computed returns the correct iconState string', () => {
        // rest collapsed state
        wrapper.vm.toggleCollapse();
        expect(wrapper.vm.iconState).toEqual("chevron-down");
        // toggle collapsed state again to make sire iconState changes
        wrapper.vm.toggleCollapse();
        expect(wrapper.vm.iconState).toEqual("chevron-up");
    });
}); 
