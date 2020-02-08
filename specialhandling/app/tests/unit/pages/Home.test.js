import { mount, shallowMount, createLocalVue } from '@vue/test-utils';
import Vueoom, { Command } from 'vueoom';
import Home from '../../../pages/Home.vue';
import Comments from '../../../components/Comments.vue';
import agGridMock from '../__mocks__/agGrid';
import commandDropdownMock from '../__mocks__/commandDropdownMock.vue';

// Mock Comments component so that POST test will work
const commentsMock = {
    name: 'comments',
    extends: Comments,
    computed: {
        activeCheck: () => jest.fn(),
        activeComment: () => jest.fn(),
        errors: () => jest.fn(),
        disableSubmit: () => jest.fn()
    },
    methods: {
        comments:() => jest.fn(),
        post:() => jest.fn(),
        fetchUnsignedChecks:() => jest.fn(),
        setCheckById:() => jest.fn(),
        postComment:() => jest.fn(),
        postCommentAlt:() => jest.fn()
    }
};

const localVue = createLocalVue();
localVue.use(Vueoom);

describe('Home.test.js', () => {
    let wrapper;
    let formData = {
        to_modify: "1,2",
        instructions: undefined,
        contacted: undefined,
        comment: "weewoo"
    };
    let checks = [
        {
            check_number: "14567890",
            comments: [],
            contact_email: "jeff@arizona.email.edu",
            contact_name: "Jeff",
            contact_number: "000-0000",
            contacted: true,
            created: "2018-04-16T10:29:10.352129",
            edoc_number: "21324",
            id: 1,
            instructions: "do a thing",
            modified: "2018-04-16T10:29:10.352582",
            org_code: "124",
            payee_name: "Margret",
            payee_number: "520-123-4567",
            picked_up: true,
            signature: null,
            due_date: "2018-01-02",
            user: "bernard",
            archived_signatures: [
                {
                    created:"2018-11-20T13:45:38.587356",
                    first_name:"Blah",
                    id:1,
                    last_name:"Blah",
                    modified:"2018-11-20T13:45:38.587680",
                    reason:"test",
                    related_check:1,
                    signature:"blah",
                    user:"vagrant",
                }
            ],
        },
        {
            check_number: "14567891",
            comments: [
                { id: 1, comment: 'comment', created: '', modified: '', user: 'bernard' },
                { id: 2, comment: 'comment 2', created: '', modified: '', user: 'bernard' }
            ],
            contact_email: "jeff@arizona.email.edu",
            contact_name: "Jeff",
            contact_number: "000-0000",
            contacted: true,
            created: "2018-04-16T10:29:10.352129",
            edoc_number: "21324",
            id: 2,
            instructions: "do a thing again",
            modified: "2018-04-16T10:29:10.352582",
            org_code: "124",
            payee_name: "Margret",
            payee_number: "520-123-4567",
            picked_up: true,
            signature: null,
            due_date: "2018-01-02",  
            user: "bernard",
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
        }
    ];

    let actions = {
        addUnsignedCheck: jest.fn(),
        fetchUnsignedChecks: jest.fn(() => Promise.resolve()),
        setCheck: jest.fn(() => Promise.resolve()),
        clearCheck: jest.fn(),
        clearErrors: jest.fn(),
        // Because we are looking for id in response body now may need this
        postCheck: jest.fn().mockImplementation( id =>
            Promise.resolve({ 
                data: { 
                    check_number: "1237848",
                    check_identifier: "payroll",
                    contact_name: "Luke Zabonic",
                    contact_number: "520-454-1234",
                    contact_email: "nah@nope.com",
                    contacted: true,
                    comments: [],
                    created: "2018-07-31T12:47:41.179277",
                    edoc_number: null,
                    id: id,
                    instructions: "fedex",
                    modified: "2018-07-31T12:47:41.179673",
                    org_code: "4562",
                    payee_name: "Kill Him",
                    payee_number: "123456",
                    picked_up: false,
                    signature: null,
                    user: "lmz",
                    due_date: "2019-01-01"
                }
            })
        ),
        putCheck: jest.fn(() => Promise.resolve()),
        putChecks: jest.fn(() => Promise.resolve({})),
        deleteCheck: jest.fn(),
        deleteChecks: jest.fn(() => Promise.resolve()),
        deleteUnsignedCheck: jest.fn(),
        postComment: jest.fn(() => Promise.resolve()),
        clearCommentErrors: jest.fn(),
        openPrintableVersion: jest.fn(),
        verifyEdoc: jest.fn(),
        toggleColumnSelectPanel: jest.fn(),
        updateActiveCheck: jest.fn(),
        fetchCheckById: jest.fn(0)
    };

    let localMethods = {
        appendCommentToCheck: jest.fn(() => Promise.resolve()),
        archivedCreated: jest.fn()
    };

    beforeEach(() => {
        wrapper = mount(Home, {
            localVue,
            computed: {
                unsignedChecks: () => { return checks; },
                errors: () => { return {}; },
                activeCheck: () => { return checks[0]; },
                activeComment: () => { return {}; },
                signatures: () => { return {}; }
            },
            methods: {
                ...actions,
                ...localMethods
            },
            stubs: {
                'modal': true,
                'alert': true,
                'comments': commentsMock,
                'advanced-search': true,
                'export-csv': true,
                'ag-grid-vue': agGridMock,
                'command-dropdown': commandDropdownMock,
                'toast-group': true,
                'toast': true
            }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('has the expected html structure', () => {
        expect(wrapper.element).toMatchSnapshot();
    });

    it('calls fetchUnsignedChecks on mount', async next => {
        await expect(actions.fetchUnsignedChecks).toHaveBeenCalled();
        next();
    });

    // Row Selected
    // Can't seem to get this to work
    // it('behaves properly when a row is selected', () => {
    //     expect(wrapper.vm.grid.selectedRows).toBe(null);
    //     expect(wrapper.vm.grid.hasSelectedRows).toBe(false);
    //     const grid = wrapper.find(agGridMock);
    //     grid.setMethods({
    //         onSelectRow: () => {
    //             grid.vm.$emit('rowSelected', checks[0]);
    //         }
    //     });
    //     grid.find('#row').trigger('click');
    //     expect(grid.emitted).toHaveLength(1);
    //     console.log(grid.emitted());
    //     expect(wrapper.vm.grid.selectedRows).toBe(checks[0]);
    //     expect(wrapper.vm.grid.hasSelectedRows).toBe(true);
    // });

    // Quick search
    it('filters the grid when the quick search box receives input', () => {
        expect(wrapper.vm.searchString).toBe('');
        const inputString = 'Hello, my name is elder price';
        const searchBox = wrapper.find('#quickFilterBox__home');
        searchBox.element.value = inputString;
        searchBox.trigger('input');
        expect(wrapper.vm.searchString).toBe(inputString);
    });

    // Refresh grid
    it('refreshes the grid when the `Refresh` button is clicked', () => {
        wrapper.findAll(Command).at(4).trigger('click');
        expect(wrapper.vm.activeCheck.id).toBe('');
        expect(actions.clearCheck).toHaveBeenCalled();
        expect(actions.fetchUnsignedChecks).toHaveBeenCalled();
        expect(wrapper.vm.grid.hasSelectedRows).toBe(false);
    });

    // New Modal
    it('opens the New Check modal', () => {
        // Verify modal will be hidden on render
        expect(wrapper.vm.modalVisible.new).toBe(false);
        // Click the `Create` button
        wrapper.findAll(Command).at(0).trigger('click');
        expect(wrapper.vm.modalVisible.new).toBe(true);
    });

    it('clears previously edited check information when New Check modal is shown', () => {
        // Verify modal will be hidden on render
        expect(wrapper.vm.modalVisible.new).toBe(false);
        // Set the selectedRows manually since there is no grid
        wrapper.vm.grid.selectedRows = new Array(checks[0]);
        wrapper.vm.grid.hasSelectedRows = true;
        // Click the `Create` button
        wrapper.findAll(Command).at(0).trigger('click');
        expect(wrapper.vm.modalVisible.new).toBe(true);
        expect(actions.clearCheck).toHaveBeenCalled();
        expect(actions.clearErrors).toHaveBeenCalled();
        expect(wrapper.vm.grid.selectedRows).toBe(null);
        expect(wrapper.vm.grid.hasSelectedRows).toBe(false);
    });

    it('closes the New Check modal', () => {
        wrapper.vm.modalVisible.new = true;
        wrapper.vm.closeNewModal();
        expect(wrapper.vm.modalVisible.new).toBe(false);
        expect(actions.clearErrors).toHaveBeenCalled();
        expect(actions.clearCheck).toHaveBeenCalled();
    });

    // Edit Modal
    it('opens the Edit Check modal when a row is selected', () => {
        // Verify modal is hidden on render
        expect(wrapper.vm.modalVisible.edit).toBe(false);
        // Set the selectedRows manually since there is no grid
        wrapper.vm.grid.selectedRows = new Array(checks[0]);
        wrapper.vm.grid.hasSelectedRows = true;
        // Click the `Edit` button
        wrapper.findAll(Command).at(1).trigger('click');
        expect(wrapper.vm.modalVisible.edit).toBe(true);
    });

    it('prevents opening the Edit Check modal when a row is not selected', () => {
        // Verify the modal is hidden on render
        expect(wrapper.vm.modalVisible.edit).toBe(false);
        // `Edit` Button should be disabled
        expect(wrapper.vm.grid.hasSelectedRows).toBe(false);
        const btn = wrapper.findAll(Command).at(1);
        expect(btn.vm.$el.disabled).toBe(true);
        // Click the `Edit` button
        btn.trigger('click');
        expect(wrapper.vm.modalVisible.edit).toBe(false);
    });

    it('closes the Edit Check modal', () => {
        wrapper.vm.modalVisible.edit = true;
        wrapper.vm.grid.selectedRows = new Array(checks[0]);
        wrapper.vm.grid.hasSelectedRows = true;
        wrapper.vm.closeEditModal();
        expect(actions.setCheck).toHaveBeenCalled();
        expect(wrapper.vm.modalVisible.edit).toBe(false);
    });

    // Creation/Editing methods
    it('behaves properly on save', async () => {
        const closeSpy = jest.spyOn(wrapper.vm, 'closeNewModal');

        wrapper.vm.save();
        expect(actions.verifyEdoc).toHaveBeenCalled();
        await expect(actions.postCheck).toHaveBeenCalled();
        expect(actions.addUnsignedCheck).toHaveBeenCalled();
        expect(closeSpy).toHaveBeenCalled();

        closeSpy.mockClear();
    });

    it('behaves properly on save with comments', async next => {
        let cmp = shallowMount(Home, {
            localVue,
            computed: {
                unsignedChecks: () => { return checks; },
                signatures: () => { return {}; }, 
                activeCheck: () => { return checks[1]; },
                activeComment: () => { return {}; },
                errors: () => { return {}; }
            },
            methods: {
                ...actions,
                refreshGrid: jest.fn()
            },
            stubs: {
                'modal': true,
                'alert': true,
                'comments': commentsMock,
                'advanced-search': true,
                'export-csv': true,
                'ag-grid-vue': agGridMock,
                'command-dropdown': commandDropdownMock
            }
        });
        const closeSpy = jest.spyOn(cmp.vm, 'closeNewModal');

        cmp.vm.save();
        expect(actions.verifyEdoc).toHaveBeenCalled();
        await expect(actions.postCheck).toHaveBeenCalled();
        // Ensure two comments have been posted
        await expect(actions.postComment).toHaveBeenCalledTimes(1);
        await expect(actions.postComment).toHaveBeenCalledTimes(2);
        cmp.vm.$nextTick(() => {
            expect(actions.addUnsignedCheck).toHaveBeenCalled();
            expect(closeSpy).toHaveBeenCalled();
            next();
        });
        closeSpy.mockClear();
    });

    it('behaves properly on save when there are errors', async () => {
        let cmp = shallowMount(Home, {
            localVue,
            computed: {
                unsignedChecks: () => { return checks; },
                signatures: () => { return {}; }, 
                activeCheck: () => { return checks[0]; },
                activeComment: () => { return {}; },
                errors: () => { return { testerror: 'woah' }; }
            },
            methods: {
                ...actions
            },
            stubs: {
                'modal': true,
                'alert': true,
                'comments': commentsMock,
                'advanced-search': true,
                'export-csv': true,
                'ag-grid-vue': agGridMock,
                'command-dropdown': commandDropdownMock
            }
        });
        const closeSpy = jest.spyOn(cmp.vm, 'closeNewModal');
        const refreshSpy = jest.spyOn(cmp.vm, 'refreshGrid');

        cmp.vm.save();
        expect(actions.verifyEdoc).toHaveBeenCalled();
        await expect(actions.postCheck).toHaveBeenCalled();
        expect(closeSpy).not.toHaveBeenCalled();
        expect(refreshSpy).not.toHaveBeenCalled();

        closeSpy.mockClear();
        refreshSpy.mockClear();
    });

    it('behaves properly on save and copy', async () => {
        wrapper.vm.saveAndCopy();
        await expect(actions.postCheck).toHaveBeenCalled();
        expect(actions.setCheck).toHaveBeenCalled();
        expect(actions.fetchUnsignedChecks).toHaveBeenCalled();
    });

    it('behaves properly on save and copy with comments', async next => {
        let cmp = shallowMount(Home, {
            localVue,
            computed: {
                unsignedChecks: () => { return checks; },
                signatures: () => { return {}; }, 
                activeCheck: () => { return checks[1]; },
                activeComment: () => { return {}; },
                errors: () => { return {}; }
            },
            methods: {
                ...actions,
                refreshGrid: jest.fn()
            },
            stubs: {
                'modal': true,
                'alert': true,
                'comments': commentsMock,
                'advanced-search': true,
                'export-csv': true,
                'ag-grid-vue': agGridMock,
                'command-dropdown': commandDropdownMock
            }
        });

        cmp.vm.saveAndCopy();
        expect(actions.verifyEdoc).toHaveBeenCalled();
        await expect(actions.postCheck).toHaveBeenCalled();
        // Ensure two comments have been posted
        await expect(actions.postComment).toHaveBeenCalledTimes(1);
        await expect(actions.postComment).toHaveBeenCalledTimes(2);
        cmp.vm.$nextTick(() => {
            expect(actions.setCheck).toHaveBeenCalled();
            expect(actions.fetchUnsignedChecks).toHaveBeenCalled();
            next();
        });
    });

    it('behaves properly on save and copy when there are errors', async () => {
        let cmp = shallowMount(Home, {
            localVue,
            computed: {
                unsignedChecks: () => { return checks; },
                signatures: () => { return {}; }, 
                activeCheck: () => { return checks[0]; },
                activeComment: () => { return {}; },
                errors: () => { return { testerror: 'woah' }; }
            },
            methods: {
                ...actions,
            },
            stubs: {
                'modal': true,
                'alert': true,
                'comments': commentsMock,
                'advanced-search': true,
                'export-csv': true,
                'ag-grid-vue': agGridMock,
                'command-dropdown': commandDropdownMock
            }
        });
        cmp.vm.saveAndCopy();
        await expect(actions.postCheck).toHaveBeenCalled();
        expect(actions.setCheck).not.toHaveBeenCalled();
    });

    it('behaves properly on update', async () => {
        const closeSpy = jest.spyOn(wrapper.vm, 'closeEditModal');

        wrapper.vm.grid.selectedRows = new Array(checks[0]);
        wrapper.vm.grid.hasSelectedRows = true;

        wrapper.vm.update();
        expect(actions.verifyEdoc).toHaveBeenCalled();
        await expect(actions.putCheck).toHaveBeenCalled();
        await expect(actions.fetchCheckById).toHaveBeenCalled();
        await expect(actions.updateActiveCheck).toHaveBeenCalled();
        expect(closeSpy).toHaveBeenCalled();

        closeSpy.mockClear();
    });

    it('behaves properly on update when there are errors', async () => {
        let cmp = shallowMount(Home, {
            localVue,
            computed: {
                unsignedChecks: () => { return checks; },
                signatures: () => { return {}; }, 
                activeCheck: () => { return {}; },
                activeComment: () => { return {}; },
                errors: () => { return { testerror: 'woah' }; }
            },
            methods: {
                ...actions
            },
            stubs: {
                'modal': true,
                'alert': true,
                'comments': commentsMock,
                'advanced-search': true,
                'export-csv': true,
                'ag-grid-vue': agGridMock,
                'command-dropdown': commandDropdownMock
            }
        });
        const closeSpy = jest.spyOn(cmp.vm, 'closeEditModal');
        const refreshSpy = jest.spyOn(cmp.vm, 'refreshGrid');

        await cmp.vm.update();
        expect(actions.verifyEdoc).toHaveBeenCalled();
        expect(actions.putCheck).toHaveBeenCalled();
        expect(closeSpy).not.toHaveBeenCalled();
        expect(refreshSpy).not.toHaveBeenCalled();

        closeSpy.mockClear();
        refreshSpy.mockClear();
    });

    it('behaves properly on batch put', async () => {
        const refreshSpy = jest.spyOn(wrapper.vm, 'refreshGrid');
        const appendCommentSpy = jest.spyOn(wrapper.vm, 'appendCommentToCheck');

        // mock opening modal
        wrapper.vm.modalVisible.multipleEdit = true;
        wrapper.vm.grid.selectedRows = new Array(checks);
        wrapper.vm.grid.hasSelectedRows = true;

        await wrapper.vm.updateMultipleChecks(formData);
        expect(appendCommentSpy).toHaveBeenCalled();
        expect(actions.putChecks).toHaveBeenCalled();
        expect(refreshSpy).toHaveBeenCalled();

        refreshSpy.mockClear();
        appendCommentSpy.mockClear(); 
    });

    it('behaves properly on batch put when there are comment errors', async () => {
        const refreshSpy = jest.spyOn(wrapper.vm, 'refreshGrid');
        const appendCommentSpy = jest.spyOn(wrapper.vm, 'appendCommentToCheck');

        // mock opening modal
        wrapper.vm.modalVisible.multipleEdit = true;
        wrapper.vm.grid.selectedRows = new Array(checks);
        wrapper.vm.grid.hasSelectedRows = true;

        // Set the errors so that the test thinks a comment failed
        wrapper.vm.batchChecks.batchCommentErrors.comment = "Broken";

        // Test the functionality
        await wrapper.vm.updateMultipleChecks(formData);
        expect(appendCommentSpy).toHaveBeenCalled();
        expect(actions.putChecks).toHaveBeenCalled();
        expect(wrapper.vm.modalVisible.multipleEdit).toBe(true);
        expect(refreshSpy).not.toHaveBeenCalled();
        
        refreshSpy.mockClear(); 
        appendCommentSpy.mockClear();
    });

    it('behaves properly on batch put when there are check errors', async () => {
        let cmp = shallowMount(Home, {
            localVue,
            data: {
                batchChecks: {
                    to_modify: "",
                    batchComment: {
                        related_check: "",
                        comment: ""
                    },
                    batchCommentErrors: {
                        comment: undefined
                    }
                }
            },
            computed: {
                unsignedChecks: () => { return checks; },
                signatures: () => { return {}; }, 
                activeCheck: () => { return {}; },
                activeComment: () => { return {}; },
                errors: () => { return { testerror: 'woah' }; }
            },
            methods: {
                ...actions,
                ...localMethods
            },
            stubs: {
                'modal': true,
                'alert': true,
                'comments': commentsMock,
                'advanced-search': true,
                'export-csv': true,
                'ag-grid-vue': agGridMock,
                'command-dropdown': commandDropdownMock
            }
        });

        const refreshSpy = jest.spyOn(cmp.vm, 'refreshGrid');
        const appendCommentSpy = jest.spyOn(cmp.vm, 'appendCommentToCheck');

        // mock opening modal
        cmp.vm.modalVisible.multipleEdit = true;
        cmp.vm.grid.selectedRows = new Array(checks);
        cmp.vm.grid.hasSelectedRows = true;

        await cmp.vm.updateMultipleChecks(formData);
        expect(appendCommentSpy).toHaveBeenCalled();
        expect(actions.putChecks).toHaveBeenCalled();
        expect(cmp.vm.modalVisible.multipleEdit).toBe(true);
        expect(refreshSpy).not.toHaveBeenCalled();

        refreshSpy.mockClear();
        appendCommentSpy.mockClear(); 
    });
        
    it('behaves properly on single delete', async next => {
        wrapper.vm.grid.selectedRows = new Array(checks[0]);
        wrapper.vm.grid.hasSelectedRows = true;

        wrapper.vm.deleteSelected();
        await expect(actions.setCheck).toHaveBeenCalled();
        expect(actions.deleteCheck).toHaveBeenCalled();
        wrapper.vm.$nextTick(() => {
            next();
        });
    });

    it('behaves properly on batch delete', async () => {
        wrapper.vm.grid.selectedRows = new Array(checks[0],checks[1]);
        wrapper.vm.grid.hasSelectedRows = true;

        wrapper.vm.deleteSelected();
        await expect(actions.deleteChecks).toHaveBeenCalled();
    });

    it('opens the export CSV modal window when `CSV` button clicked', () => {
        wrapper.setData({
            modalVisible: {
                csv: false
            }
        });
        let mybutton = wrapper.find('#buttonExportCsv');
        mybutton.trigger('click');
        expect(wrapper.vm.showCsvModal).toBe(true);
    });

    it('opens the print window when `print` button clicked', () => {
        let mybutton = wrapper.find('#printableVersion');
        mybutton.trigger('click');
        expect(actions.openPrintableVersion).toHaveBeenCalled();
    });

    // TODO: test beforeRouteLeave hook

});
