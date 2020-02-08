import { mount, createLocalVue } from '@vue/test-utils';
import Vueoom, { Command, SegmentedToggle, SegmentedToggleOption } from 'vueoom';
import SignaturesFilters from '../../../components/filters/SignaturesFilters.vue';

const localVue = createLocalVue();
localVue.use(Vueoom);

describe('SignaturesFilters.test.js', () => {
    let wrapper;

    let props = {
        gridApi: {
            setFilterModel: jest.fn(),
            onFilterChanged: jest.fn()
        },
        rowData: [
            {
                check_number: "484772946",
                check_identifier: "accounts payable",
                comments: [],
                contact_email: "everyone@america.com",
                contact_name: "Students Everywhere",
                contact_number: "123-456-7891",
                contacted: false,
                created: "2018-06-08T14:33:56.171611",
                edoc_number: 3834782,
                id: 5,
                instructions: "payroll distribution",
                modified: "2018-06-12T14:49:28.573192",
                org_code: "3847",
                payee_name: "Bernie Sanders",
                payee_number: "15343515",
                picked_up: false,
                signature: null,
                user: "r"
            }
        ]
    };

    beforeEach(() => {
        wrapper = mount(SignaturesFilters, {
            localVue,
            propsData: {
                ...props
            },
            stubs: [
                'select-single'
            ]
        });
    });

    it('has the expected html structure', () => {
        expect(wrapper.element).toMatchSnapshot();
    });

    // Events
    it('emits the close event when the close button is clicked', () => {
        expect(wrapper.emitted().close).toBeFalsy();
        wrapper.findAll(Command).at(1).trigger('click');
        expect(wrapper.emitted().close).toBeTruthy();
    });

    it('resets filtering when the `reset` button is clicked', () => {
        wrapper.findAll(Command).at(0).trigger('click');
        expect(wrapper.vm.gridApi.setFilterModel).toHaveBeenCalled();
        expect(wrapper.vm.gridApi.onFilterChanged).toHaveBeenCalled();
    });

    // Form elements
    it('filters `check_number`', () => {
        const input = wrapper.find('#selectCheckNumber');
        const value = '484772946';
        input.element.value = value;
        input.trigger('input');
        expect(wrapper.vm.filters.check_number.filter).toBe(value);
        const expectedFilterModel = {
            check_number: {
                type: 'contains',
                filter: value,
                filterType: 'text'
            }
        };
        expect(wrapper.vm.gridApi.setFilterModel).toHaveBeenCalledWith(expectedFilterModel);
    });

    it('filters `check_identifier`', () => {
        // We won't test clicking around in the multiselect since that produces errors when run in jest.
        // Instead we will just set the value and make sure the watcher runs and applies the filtering.
        const value = 'accounts payable';
        wrapper.vm.filters.check_identifier.filter = value;
        const expectedFilterModel = {
            check_identifier: {
                type: 'contains',
                filter: value,
                filterType: 'text'
            },
        };
        expect(wrapper.vm.gridApi.setFilterModel).toHaveBeenCalledWith(expectedFilterModel);
    });

    it('filters `contact_email`', () => {
        const input = wrapper.find('#selectContactEmail');
        const value = 'everyone@america.com';
        input.element.value = value;
        input.trigger('input');
        expect(wrapper.vm.filters.contact_email.filter).toBe(value);
        const expectedFilterModel = {
            contact_email: {
                type: 'contains',
                filter: value,
                filterType: 'text'
            }
        };
        expect(wrapper.vm.gridApi.setFilterModel).toHaveBeenCalledWith(expectedFilterModel);
    });

    it('filters `contact_name`', () => {
        const input = wrapper.find('#selectContactName');
        const value = 'Students Everywhere';
        input.element.value = value;
        input.trigger('input');
        expect(wrapper.vm.filters.contact_name.filter).toBe(value);
        const expectedFilterModel = {
            contact_name: {
                type: 'contains',
                filter: value,
                filterType: 'text'
            }
        };
        expect(wrapper.vm.gridApi.setFilterModel).toHaveBeenCalledWith(expectedFilterModel);
    });

    it('filters `contact_number`', () => {
        const input = wrapper.find('#selectContactNumber');
        const value = '123-456-7891';
        input.element.value = value;
        input.trigger('input');
        expect(wrapper.vm.filters.contact_number.filter).toBe(value);
        const expectedFilterModel = {
            contact_number: {
                type: 'contains',
                filter: value,
                filterType: 'text'
            }
        };
        expect(wrapper.vm.gridApi.setFilterModel).toHaveBeenCalledWith(expectedFilterModel);
    });

    it('filters `contacted`', () => {
        const input = wrapper.findAll(SegmentedToggle).at(0);
        input.findAll(SegmentedToggleOption).at(0).trigger('click');
        const value = 'true';
        expect(wrapper.vm.filters.contacted.value).toBe(value);
        const expectedFilterModel = {
            contacted: {
                value: value
            }
        };
        expect(wrapper.vm.gridApi.setFilterModel).toHaveBeenCalledWith(expectedFilterModel);
    });

    it('filters `created`', () => {
        const input = wrapper.find('#selectDateCreated');
        const value = '2018-06-08';
        input.element.value = value;
        input.trigger('input');
        expect(wrapper.vm.filters.created.filter).toBe(value);
        const expectedFilterModel = {
            created: {
                type: 'contains',
                filter: value,
                filterType: 'text'
            },
        };
        expect(wrapper.vm.gridApi.setFilterModel).toHaveBeenCalledWith(expectedFilterModel);
    });

    it('filters `edoc_number`', () => {
        const input = wrapper.find('#selectEdocNumber');
        const value = '3834782';
        input.element.value = value;
        input.trigger('input');
        expect(wrapper.vm.filters.edoc_number.filter).toBe(value);
        const expectedFilterModel = {
            edoc_number: {
                type: 'contains',
                filter: value,
                filterType: 'text'
            }
        };
        expect(wrapper.vm.gridApi.setFilterModel).toHaveBeenCalledWith(expectedFilterModel);
    });

    it('filters `instructions`', () => {
        // We won't test clicking around in the multiselect since that produces errors when run in jest.
        // Instead we will just set the value and make sure the watcher runs and applies the filtering.
        const value = 'payroll distribution';
        wrapper.vm.filters.instructions.filter = value;
        const expectedFilterModel = {
            instructions: {
                type: 'contains',
                filter: value,
                filterType: 'text'
            }
        };
        expect(wrapper.vm.gridApi.setFilterModel).toHaveBeenCalledWith(expectedFilterModel);
    });

    it('filters `org_code`', () => {
        const input = wrapper.find('#selectOrgCode');
        const value = '3847';
        input.element.value = value;
        input.trigger('input');
        expect(wrapper.vm.filters.org_code.filter).toBe(value);
        const expectedFilterModel = {
            org_code: {
                type: 'contains',
                filter: value,
                filterType: 'text'
            }
        };
        expect(wrapper.vm.gridApi.setFilterModel).toHaveBeenCalledWith(expectedFilterModel);
    });

    it('filters `payee_name`', () => {
        const input = wrapper.find('#selectPayeeName');
        const value = 'Bernie Sanders';
        input.element.value = value;
        input.trigger('input');
        expect(wrapper.vm.filters.payee_name.filter).toBe(value);
        const expectedFilterModel = {
            payee_name: {
                type: 'contains',
                filter: value,
                filterType: 'text'
            }
        };
        expect(wrapper.vm.gridApi.setFilterModel).toHaveBeenCalledWith(expectedFilterModel);
    });

    it('filters `payee_number`', () => {
        const input = wrapper.find('#selectPayeeNumber');
        const value = '15343515';
        input.element.value = value;
        input.trigger('input');
        expect(wrapper.vm.filters.payee_number.filter).toBe(value);
        const expectedFilterModel = {
            payee_number: {
                type: 'contains',
                filter: value,
                filterType: 'text'
            }
        };
        expect(wrapper.vm.gridApi.setFilterModel).toHaveBeenCalledWith(expectedFilterModel);
    });

});
