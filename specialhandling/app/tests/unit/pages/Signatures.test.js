import { mount, createLocalVue } from '@vue/test-utils';
import Vueoom, { Command, Stepper } from 'vueoom';
import Signatures from '../../../pages/Signatures.vue';
import agGridMock from '../__mocks__/agGrid.js';
import SignatureForm from '../../../components/forms/SignatureForm.vue';
import filters from '../../../utils/filters';

// Mock the Signature Form so that we can pull data from it via $ref
const sigFormMock = {
    name: 'signature-form',
    extends: SignatureForm,
    components: {
        'vue-signature': {
            render (h) {
                return h('div');
            }
        }
    },
    computed: {
        errors: () => jest.fn()
    },
    methods: {
        getSignature: () => jest.fn(),
        clear: () => jest.fn(),
        render: () => jest.fn(),
        toggleSuccess: () => jest.fn()
    }
};

const stepperMock = {
    name: 'stepper',
    extends: Stepper,
    computed: {
        max: () => { return 1; }
    },
    methods: {
        previous: () => jest.fn(),
        next: () => jest.fn(),
        onChange: () => jest.fn()
    }
};

const localVue = createLocalVue();
localVue.use(Vueoom);
localVue.use(filters);

describe('Signature.test.js', () => {
    let wrapper;
    let checks = [
        {
            id: 1,
            user: "bernard",
            created: "2018-04-16T13:52:18.5",
            modified: "2018-04-16T13:52:18.532764",
            payee_name: "Bobby",
            payee_number: "124-3456",
            edoc_number: "13445",
            org_code: "123",
            instructions: "Call for pickup",
            check_number: "141519121",
            contact_name: "Jake",
            contact_number: "111-1111",
            contact_email: "test@email.com",
            contacted: false,
            picked_up: false,
            signature: null
        },
        {
            id: 2,
            user: "bernard",
            created: "2018-04-16T13:56:37.283012",
            modified: "2018-04-16T13:56:37.283371",
            payee_name: "Will",
            payee_number: "7777777",
            edoc_number: "12314",
            org_code: "567",
            instructions: "Call for pickup",
            check_number: "124717899",
            contact_name: "Ralph",
            contact_number: "4235677",
            contact_email: "ralphy@email.com",
            contacted: false,
            picked_up: false,
            signature: 1
        }
    ];

    let actions = {
        fetchUnsignedChecks: jest.fn(() => Promise.resolve([])),
        postSignatures: jest.fn(() => Promise.resolve()),
        clearErrors: jest.fn(() => Promise.resolve()),
        toggleColumnSelectPanel: jest.fn()
    };

    let getters = {
        unsignedChecks: () => { return checks; },
        errors: () => { return {}; }
    };

    let localMethods = {
        refreshData: jest.fn(),
        getSignatureData: jest.fn(() => {
            return {
                related_check: 1,
                first_name: 'Albert',
                last_name: 'Einstein',
                signature: 'blah'
            };
        }),
        sigValidationCheck: jest.fn(() => { return false; }),
        clearForm: jest.fn()
    };

    beforeEach(() => {
        wrapper = mount(Signatures, {
            localVue,
            data: {
                searchString: '',
                showSignModal: false,
                currentStep: 1,
                grid: {
                    selectedRows: checks,
                    hasSelectedRows: true,
                    selectionMode: 'single',
                    gridOptions: {},
                    columnDefinitions: []
                }
            },
            computed: {
                ...getters
            },
            methods: {
                ...actions,
                ...localMethods
            },
            stubs: {
                'advanced-search': true,
                'ag-grid-vue': agGridMock,
                'stepper': stepperMock,
                'signature-form': sigFormMock,
                'toast': true,
                'toast-group': true
            }
        });
    });

    it('has the expected html structure', () => {
        expect(wrapper.element).toMatchSnapshot();
    });

    it('calls fetchUnsignedChecks on mount',async next => {
        await expect(actions.fetchUnsignedChecks).toHaveBeenCalled();
        next();
    });

    it('calls refreshData when the refresh button is clicked', () => {
        wrapper.findAll(Command).at(1).trigger('click');
        expect(localMethods.refreshData).toHaveBeenCalled();
    });

    it('filters the grid when the quick search box receives input', () => {
        expect(wrapper.vm.searchString).toBe('');
        const inputString = 'Bob';
        const searchBox = wrapper.find('#quickFilter');
        searchBox.element.value = inputString;
        searchBox.trigger('input');
        expect(wrapper.vm.searchString).toBe(inputString);
    });

    it('opens the Signature modal when the button is clicked', () => {
        expect(wrapper.vm.showSignModal).toBe(false);
        wrapper.vm.grid.selectedRows = new Array(checks[0]);
        wrapper.vm.grid.hasSelectedRows = true;
        wrapper.findAll(Command).at(0).trigger('click');
        expect(wrapper.vm.showSignModal).toBe(true);
    });

    it('prevents opening the Signature modal when a row is not selected', () => {
        // Set data as it should be on render
        wrapper.vm.grid.selectedRows = null;
        wrapper.vm.grid.hasSelectedRows = false;
        // Verify the modal is hidden on render
        expect(wrapper.vm.showSignModal).toBe(false);
        // `Edit` Button should be disabled
        expect(wrapper.vm.grid.hasSelectedRows).toBe(false);
        const btn = wrapper.findAll(Command).at(0);
        expect(btn.vm.$el.disabled).toBe(true);
        // Click the `Edit` button
        btn.trigger('click');
        expect(wrapper.vm.showSignModal).toBe(false);

    });

    it.skip('closes the Signature modal', () => {
        // Open the modal
        wrapper.vm.showSignModal = true;
        wrapper.vm.currentStep = 1;
        wrapper.vm.grid.selectedRows = checks;
        wrapper.vm.grid.hasSelectedRows = true;

        wrapper.vm.closeModal();
        expect(wrapper.vm.showSignModal).toBe(false);
    });

    it.skip('behaves properly on post', async () => {
        // Open the modal to the signature page
        wrapper.vm.showSignModal = true;
        wrapper.vm.currentStep = 2;
        wrapper.vm.grid.selectedRows = checks;
        wrapper.vm.grid.hasSelectedRows = true;

        await wrapper.vm.post();
        expect(localMethods.getSignatureData).toHaveBeenCalled();
        expect(actions.postSignatures).toHaveBeenCalled();
        expect(localMethods.clearForm).toHaveBeenCalled();
    });
});
