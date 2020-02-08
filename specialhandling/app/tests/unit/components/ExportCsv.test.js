import { mount, createLocalVue } from '@vue/test-utils';
import Vueoom, { Command } from 'vueoom';
import ExportCsv from '../../../components/ExportCsv.vue';
import agGridMock from '../__mocks__/agGrid.js';


const localVue = createLocalVue();
localVue.use(Vueoom);

describe('ExportCsv.test.js', () => {
    let wrapper;

    let actions = {
        exportCSV: jest.fn()
    };

    beforeEach(() => {
        wrapper = mount(ExportCsv, {
            localVue,
            propsData: {
                grid: {
                    exportDataAsCsv: jest.fn()
                }
            },
            data: {
                csv: {
                    skipHeader: false,
                    skipFooters: false,
                    skipGroups: false,
                    allColumns: false,
                    fileName: 'sasdf',
                    columnSeparator: 0
                }    
            },
            methods: {
                ...actions
            },
            stubs: {
                'ag-grid-vue': agGridMock
            }
        });
    });

    // X button
    it('closes the modal window when `X` button clicked', () => {
        let mybutton = wrapper.findAll('button').at(0);
        mybutton.trigger('click');
        expect(wrapper.emitted().closeCsv).toBeTruthy();
    });

    // close button
    it('closes the modal window when `Close` button clicked', () => {
        let mybutton = wrapper.findAll(Command).at(0);
        mybutton.trigger('click');
        expect(wrapper.emitted().closeCsv).toBeTruthy();
    });
    
    // save button
    it('saves the CSV data when `save` button clicked', () => {
        wrapper.setData({
            csv: {
                skipHeader: false,
                skipFooters: false,
                skipGroups: false,
                allColumns: false,
                fileName: 'export',
                columnSeparator: 0
            }
        });
        let mybutton = wrapper.findAll(Command).at(1);
        expect(wrapper.vm.csv.fileName).toBe('export');
        wrapper.vm.csv.fileName = "";
        expect(wrapper.vm.disableSave).toBeTruthy();
        wrapper.vm.csv.fileName = "test";
        expect(wrapper.vm.disableSave).toBeFalsy();
        mybutton.trigger('click');
        expect(actions.exportCSV).toHaveBeenCalled();
    });
});
