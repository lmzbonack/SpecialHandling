import { mount, createLocalVue } from '@vue/test-utils';
import Vueoom from 'vueoom';
import ColumnsPanel from '../../../components/ColumnsPanel.vue';


const localVue = createLocalVue();
localVue.use(Vueoom);

describe('ColumnsPanel.test.js', () => {
    let wrapper;

    let methods = {
        close: jest.fn(),
        updateVisibility: jest.fn()
    };

    beforeEach(() => {
        wrapper = mount(ColumnsPanel, {
            localVue,
            propsData: {
                columndefs: [ 
                    { headerName: "test1", field: "test_1" },
                    { headerName: "test2", field: "test_2" }
                ],
                displayedcols: {
                    test_1: true,
                    test_2: true
                },
                grid: {}
            },
            computed: {
                colApi: jest.fn()
            },
            methods: {
                ...methods
            }
        });
    });

    it('has the expected html structure', () => {
        expect(wrapper.element).toMatchSnapshot();
    });

    // checkbox button
    it('changes the visibility of a column when checkbox is clicked', () => {
        let checkbox = wrapper.findAll('#test_1').at(0);
        checkbox.trigger('click');
        expect(methods.updateVisibility).toBeCalled();
    });
});
