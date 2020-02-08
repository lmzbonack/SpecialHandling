import { mount, createLocalVue } from '@vue/test-utils';
import Vueoom, { Command } from 'vueoom';
import SignedChecks from '../../../pages/SignedChecks.vue';
import agGridMock from '../__mocks__/agGrid.js';
import commandDropdownMock from '../__mocks__/commandDropdownMock.vue';

const localVue = createLocalVue();
localVue.use(Vueoom);

describe('SignedChecks.test.js', () => {
    let wrapper;
    let dateNowSpy;
    let signedChecks = [
        {
            id: 1,
            user: "lmz",
            created: "2018-04-06T13:14:04.634963",
            modified: "2018-04-06T13:14:06.298420",
            payee_name: "Tyrion Lannister",
            payee_number: "123456",
            check_identifier: "accounts payable",
            edoc_number: "1123214",
            org_code: "1",
            instructions: "FedEx",
            check_number: "465768413846532",
            contact_name: "Tywin Lannister",
            contact_number: "520-123-4567",
            contact_email: "tlan@caterlyrock.net",
            contacted: true,
            picked_up: false,
            signature: {
                first_name: 'Bob',
                last_name: 'Ross',
                signature: 'dsfsdfasefsdfasefsxcvasfawesfdfaesfd',
                related_check: 1,
                created: "2018-04-07T13:14:04.634963",
                modified: "2018-04-07T13:14:06.298420",
                id: 1,
                user: 'lmz'
            },
        },
        {
            id: 2,
            user: "lmz",
            created: "2018-04-16T20:16:57.547891",
            modified: "2018-04-16T20:16:57.548294",
            payee_name: "Thaddeus Thopterboy",
            payee_number: "1238992",
            check_identifier: "payroll",
            edoc_number: null,
            org_code: "4444",
            instructions: "Call for pickup",
            check_number: "63461874632187463218743",
            contact_name: "Ya boy Timmy",
            contact_number: "623-123-4567",
            contact_email: "timmy@aol.com",
            contacted: false,
            picked_up: false,
            archived_signatures: [
                {
                    created:"2018-11-20T13:45:38.587356",
                    first_name:"Blah",
                    id:2,
                    last_name:"Blah",
                    modified:"2018-11-20T13:45:38.587680",
                    reason:"test",
                    related_check:2,
                    signature:"blah",
                    user:"vagrant",
                }
            ],
            signature: {
                first_name: 'Bob',
                last_name: 'Ross',
                signature: 'dsfsdfasefsdfasefsxcvasfawesfdfaesfd',
                related_check: 2,
                created: "2018-04-07T13:14:04.634963",
                modified: "2018-04-07T13:14:06.298420",
                id: 2,
                user: 'lmz'
            }
        }
    ];

    let actions = {
        post: jest.fn(() => Promise.resolve({})),
        fetchChecks: jest.fn(() => Promise.resolve({})),
        setCheck: jest.fn(() => Promise.resolve()),
        setUser: jest.fn(),
        clearCheck: jest.fn(),
        setCheckById: jest.fn(),
        clearErrors: jest.fn(),
        openPrintableVersion: jest.fn(),
        toggleColumnSelectPanel: jest.fn()
    };

    let localMethods = {
        refreshGrid: jest.fn(),
        archivedCreated: jest.fn(),
        retrieveUserStatus: jest.fn(() => Promise.resolve())
    };

    beforeAll(() => {
        // This allows us to use moment by making `new Date.now()` always return a single date.
        dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 1487076708000);
    });

    afterAll(() => {
        dateNowSpy.mockReset();
        dateNowSpy.mockRestore();
    });

    beforeEach(() => {
        wrapper = mount(SignedChecks, {
            localVue,
            computed: {
                signedChecks: () => { return signedChecks; },
                activeCheck: () => { return signedChecks[1]; },
                errors: () => { return {}; },
                activeComment: () => {
                    return {
                        comment: ''
                    };
                },
                activeUser: () => {
                    return {
                        canArchive: true,
                        username: 'jeff'
                    };
                }
            },
            methods: {
                ...actions,
                ...localMethods
            },
            stubs: {
                'ag-grid-vue': agGridMock,
                'command-dropdown': commandDropdownMock,
                'comments': true,
                'advanced-search': true,
                'export-csv': true,
                'toast': true,
                'toast-group': true
            }
        });
    });

    it('has the expected html structure', () => {
        expect(wrapper.element).toMatchSnapshot();
    });

    it('calls fetchChecks on mount', async next => {
        await expect(actions.fetchChecks).toHaveBeenCalled();
        next();

    });

    it('calls refreshGrid when the refresh button is clicked', () => {
        wrapper.findAll(Command).at(1).trigger('click');
        expect(localMethods.refreshGrid).toHaveBeenCalled();
    });

    it('has fuzzy search functionality that works', () => {
        expect(wrapper.vm.searchString).toBe('');
        const inputString = 'Life is pain';
        const searchBox = wrapper.find('#quickFilterBox__signedChecks');
        searchBox.element.value = inputString;
        searchBox.trigger('input');
        expect(wrapper.vm.searchString).toBe(inputString);
    });

    it('opens the Details modal when the button is clicked', () => {
        expect(wrapper.vm.viewCheckModalVisible).toBe(false);
        wrapper.vm.grid.selectedRows = new Array(signedChecks[0]);
        wrapper.vm.grid.hasSelectedRows = true;
        wrapper.find('#detailsButton').trigger('click');
        expect(wrapper.vm.viewCheckModalVisible).toBe(true);
    });
    
    it('Hides the edoc number in the Details modal when the edoc number is null', () => {
        expect(wrapper.vm.viewCheckModalVisible).toBe(false);
        wrapper.vm.grid.selectedRows = new Array(signedChecks[1]);
        wrapper.vm.grid.hasSelectedRows = true;
        wrapper.find('#detailsButton').trigger('click');
        expect(wrapper.vm.viewCheckModalVisible).toBe(true);
        expect(wrapper.find('.details-modal__data').findAll('b')).toHaveLength(11);
    });

    // TODO: Here we need to be able to change the computed property to get this to work
    // it('Does not hide the edoc number in the Details modal when the edoc number is not null', () => {
    //     expect(wrapper.vm.viewCheckModalVisible).toBe(false);
    //     wrapper.vm.grid.selectedRows = new Array(signedChecks[0]);
    //     wrapper.vm.grid.hasSelectedRows = true;
    //     wrapper.findAll(Command).at(0).trigger('click');
    //     expect(wrapper.vm.viewCheckModalVisible).toBe(true);
    //     expect(wrapper.findAll('p')).toHaveLength(12);
    // });

    it('prevents opening the Details modal when a row is not selected', () => {
        // Set data as it should be on render
        wrapper.vm.grid.selectedRows = null;
        wrapper.vm.grid.hasSelectedRows = false;
        // Verify the modal is hidden on render
        expect(wrapper.vm.viewCheckModalVisible).toBe(false);
        // `Edit` Button should be disabled
        expect(wrapper.vm.grid.hasSelectedRows).toBe(false);
        const btn = wrapper.findAll(Command).at(0);
        expect(btn.vm.$el.disabled).toBe(true);
        // Click the `Edit` button
        btn.trigger('click');
        expect(wrapper.vm.viewCheckModalVisible).toBe(false);
    });

    it('opens the export CSV modal window when `CSV` button clicked', () => {
        wrapper.setData({
            modalVisible: {
                csv: false
            }
        });
        wrapper.find('#buttonExportCsv').trigger('click');
        expect(wrapper.vm.showCsvModal).toBe(true);
    });

    it('opens the print window when `print` button clicked', () => {
        wrapper.find('#printableVersion').trigger('click');
        expect(actions.openPrintableVersion).toHaveBeenCalled();
    }); 

    it('the collapse panel is visible when signatures are archived', () => {
        expect(wrapper.vm.viewCheckModalVisible).toBe(false);
        wrapper.vm.grid.selectedRows = new Array(signedChecks[0]);
        wrapper.vm.grid.hasSelectedRows = true;
        wrapper.find('#detailsButton').trigger('click');
        expect(wrapper.vm.viewCheckModalVisible).toBe(true);
        expect(localMethods.archivedCreated).toHaveBeenCalled();
    }); 

});
