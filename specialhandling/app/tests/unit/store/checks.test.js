import checksStore from '../../../store/modules/checks';
import mockAxios from '../__mocks__/axios';
import flushPromises from 'flush-promises';

describe('checks.test.js', () => {
    describe('mutations', () => {
        
        const check = {
            payee_name: '20th Century Fox',
            payee_number: '4037579',
            edoc_number: '3854759',
            check_identifier: 'payroll',
            org_code: '4857',
            instructions: 'fedex',
            check_number: '48457537',
            contact_name: 'George Lucas',
            contact_number: '111-111-1111',
            contact_email: 'george@starwars.com',
            due_date: null,
            contacted: false,
            picked_up: false,
            signature: {},
            comments: [],
        };

        const emptyCheck = {
            payee_name: '',
            payee_number: '',
            edoc_number: '',
            check_identifier: '',
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
            comments: [],
        };

        const errors = [
            { 'picked_up': ['this needs to be a thing'] }
        ];

        test('SET_CHECK sets state.activeCheck to check', () => {
            const state = {
                activeCheck: {}
            };

            checksStore.mutations.SET_CHECK(state, check);
            expect(state.activeCheck).toEqual(check);
        });

        test('CLEAR_CHECK clears state.activeCheck', () => {
            const state = {
                activeCheck: {}
            };

            checksStore.mutations.SET_CHECK(state, check);
            expect(state.activeCheck).toEqual(check);
            checksStore.mutations.CLEAR_CHECK(state);
            expect(state.activeCheck).toEqual(emptyCheck);
        });

        test('SET_CHECK_KEEP_ID sets state.activeCheck to check and keeps previous id', () => {
            const state = {
                activeCheck: {}
            };

            const checkWithId = {
                ...check,
                id: 1
            };

            const emptyCheckWithId = {
                ...emptyCheck,
                id: 1
            };

            checksStore.mutations.SET_CHECK(state, checkWithId);
            expect(state.activeCheck).toEqual(checkWithId);
            checksStore.mutations.CLEAR_CHECK_KEEP_ID(state);
            expect(state.activeCheck).toEqual(emptyCheckWithId);
        });

        test('ADD_CHECKS sets state.checks to checks', () => {
            const state = {
                checks: []
            };

            const checks = [{ ...check }];

            checksStore.mutations.ADD_CHECKS(state, checks);
            expect(state.checks).toEqual(checks);
        });

        test('ADD_UNSIGNED_CHECKS sets state.unsignedChecks to unsignedChecks', () => {
            const state = {
                unsignedChecks: []
            };

            const unsignedChecks = [{ ...check }];

            checksStore.mutations.ADD_UNSIGNED_CHECKS(state, unsignedChecks);
            expect(state.unsignedChecks).toEqual(unsignedChecks);
        });

        test('SET_ERRORS sets state.errors to errors', () => {
            const state = {
                errors: []
            };

            checksStore.mutations.SET_ERRORS(state, errors);
            expect(state.errors).toEqual(errors);
        });

        test('CLEAR_ERRORS clears state.errors', () => {
            const state = {
                errors: []
            };

            checksStore.mutations.SET_ERRORS(state, errors);
            expect(state.errors).toEqual(errors);
            checksStore.mutations.CLEAR_ERRORS(state);
            expect(state.errors).toEqual({});
        });

        test('SET_EDOC_NULL sets state.activeCheck.edoc_number to null', () => {
            const state = {
                activeCheck: {
                    edoc_number: 'blah'
                }
            };

            checksStore.mutations.SET_EDOC_NULL(state);
            expect(state.activeCheck.edoc_number).toEqual(null);
        });
    });

    describe('getters', () => {
        test('checks returns state.checks', () => {
            const array = [{check: 1}, {check: 2}];
            const state = {
                checks: [ ...array ]
            };
            const result = checksStore.getters.checks(state);
            expect(result).toHaveLength(2);
            result.forEach((item, i) => {
                expect(item).toEqual(array[i]);
            });
        });

        test('activeCheck returns state.activeCheck', () => {
            const state = {
                activeCheck: { id: 1 }
            };
            const result = checksStore.getters.activeCheck(state);
            expect(result).toEqual(state.activeCheck);
        });

        test('errors returns state.errors', () => {
            const array = [{error: ['error']}, {error: ['error']}];
            const state = {
                errors: [ ...array ]
            };
            const result = checksStore.getters.errors(state);
            expect(result).toHaveLength(2);
            result.forEach((item, i) => {
                expect(item).toEqual(array[i]);
            });
        });

        test('signatures returns state.signatures', () => {
            const array = [{sig: 1}, {sig: 2}];
            const state = {
                signatures: [ ...array ]
            };
            const result = checksStore.getters.signatures(state);
            expect(result).toHaveLength(2);
            result.forEach((item, i) => {
                expect(item).toEqual(array[i]);
            });
        });

        test('unsignedChecks returns state.unsignedChecks', () => {
            const array = [
                { check: 1, signature: null },
                { check: 2, signature: null }
            ];
            const state = {
                unsignedChecks: [ ...array ]
            };
            const result = checksStore.getters.unsignedChecks(state);
            expect(result).toHaveLength(2);
            result.forEach(item => {
                expect(item.signature).toBeFalsy();
            });
        });

        test('signedChecks returns all signed items in state.checks', () => {
            const array = [
                { check: 1, signature: null },
                { check: 2, signature: null },
                { check: 3, signature: { sig: 1 } },
                { check: 4, signature: { sig: 2 } }
            ];
            const state = {
                checks: [ ...array ]
            };
            const result = checksStore.getters.signedChecks(state);
            expect(result).toHaveLength(2);
            result.forEach(item => {
                expect(item.signature).toBeTruthy();
            });
        });
    });

    describe('actions', () => {
        test('setCheck calls commit with check', () => {
            const check = { field: 'check data' };
            const context = {
                commit: jest.fn()
            };

            checksStore.actions.setCheck(context, check);
            expect(context.commit).toHaveBeenCalledWith('SET_CHECK', check);
        });

        test('setCheckById calls commit with the proper item, if found', () => {
            const context = {
                commit: jest.fn(),
                state: {
                    checks: [
                        { id: 1, test: 'check' }
                    ]
                }
            };
            checksStore.actions.setCheckById(context, context.state.checks[0].id);
            expect(context.commit).toHaveBeenCalledWith('SET_CHECK', context.state.checks[0]);
        });

        test('clearErrors calls commit', () => {
            const context = {
                commit: jest.fn()
            };
            checksStore.actions.clearErrors(context);
            expect(context.commit).toHaveBeenCalledWith('CLEAR_ERRORS');
        });

        test('verifyEdoc doesnt call commit when check_identifier is `accounts_payable`', async () => {
            const context = {
                state: {
                    activeCheck: {
                        check_identifier: 'accounts payable'
                    }
                },
                commit: jest.fn()
            };
            checksStore.actions.verifyEdoc(context);
            await flushPromises();
            expect(context.commit).not.toHaveBeenCalled();
        });

        test('verifyEdoc calls commit when check_identifier is `payroll`', async () => {
            const context = {
                state: {
                    activeCheck: {
                        check_identifier: 'payroll'
                    }
                },
                commit: jest.fn()
            };
            checksStore.actions.verifyEdoc(context);
            await flushPromises();
            expect(context.commit).toHaveBeenCalledWith('SET_EDOC_NULL');
        });

        test('fetchCheckById makes a detail route call to the checks api for a single check', async () => {
            const check = { id: 1 };
            const context = {
                commit: jest.fn()
            };
            checksStore.actions.fetchCheckById(context, check.id);
            expect(mockAxios.get).toHaveBeenCalledWith('checks/1/');
            const response = {data: 'response'};
            mockAxios.mockResponse(response);
            await flushPromises();
            expect(context.commit).toHaveBeenCalledWith('SET_CHECK', response.data);
            mockAxios.reset();
        });

        test('fetchChecks calls api and executes proper commits', async () => { 
            const context = {
                commit: jest.fn()
            };
            checksStore.actions.fetchChecks(context);
            // Get checks
            expect(mockAxios.get).toHaveBeenCalledWith('checks/');
            const response = { data: 'response' };
            mockAxios.mockResponse(response);
            await flushPromises();
            expect(context.commit).toHaveBeenCalledWith('ADD_CHECKS', response.data);
            mockAxios.reset();
            context.commit.mockReset();
            // Get Signatures TODO: make this work
            // expect(mockAxios.get).toHaveBeenCalledWith('signatures/');
            // const response2 = { data: 'response' };
            // mockAxios.mockResponse(response2);
            // await flushPromises();
            // expect(context.commit).toHaveBeenCalledWith('ADD_SIGNATURES', response.data);
            // mockAxios.reset();
        });

        test('fetchUnsignedChecks calls api and executes proper commits', async () => { 
            const context = {
                commit: jest.fn()
            };
            checksStore.actions.fetchUnsignedChecks(context);
            // Get checks
            expect(mockAxios.get).toHaveBeenCalledWith('checks/unsigned-checks/');
            const response = { data: 'response' };
            mockAxios.mockResponse(response);
            await flushPromises();
            expect(context.commit).toHaveBeenCalledWith('ADD_UNSIGNED_CHECKS', response.data);
            mockAxios.reset();
            context.commit.mockReset();
            // Get Signatures TODO: make this work
            // expect(mockAxios.get).toHaveBeenCalledWith('signatures/');
            // const response2 = { data: 'response' };
            // mockAxios.mockResponse(response2);
            // await flushPromises();
            // expect(context.commit).toHaveBeenCalledWith('ADD_SIGNATURES', response.data);
            // mockAxios.reset();
        });

        test('postCheck submits to api and executes proper commit', async () => { 
            const context = {
                commit: jest.fn(),
                state: {
                    activeCheck: { test: 'check' }
                }
            };
            checksStore.actions.postCheck(context);
            expect(mockAxios.post).toHaveBeenCalledWith('checks/', context.state.activeCheck);
            const response = { data: 'response' };
            mockAxios.mockResponse(response);
            await flushPromises();
            expect(context.commit).toHaveBeenCalledWith('CLEAR_ERRORS');
            mockAxios.reset();
        });

        test('postSignatures submits to api and executes proper commit', async () => { 
            const context = {
                commit: jest.fn()
            };
            const payload = { test: 'signature' };
            checksStore.actions.postSignatures(context, payload);
            expect(mockAxios.post).toHaveBeenCalledWith('signatures/create-multiple/', payload);
            const response = { data: 'response' };
            mockAxios.mockResponse(response);
            await flushPromises();
            expect(context.commit).toHaveBeenCalledWith('CLEAR_ERRORS');
            mockAxios.reset();
        });

        test('putCheck submits to api and executes proper commit', async () => { 
            const context = {
                commit: jest.fn(),
                state: {
                    activeCheck: { test: 'check', id: 1 }
                }
            };
            checksStore.actions.putCheck(context);
            expect(mockAxios.put).toHaveBeenCalledWith('checks/1/', context.state.activeCheck);
            const response = { data: 'response' };
            mockAxios.mockResponse(response);
            await flushPromises();
            expect(context.commit).toHaveBeenCalledWith('CLEAR_ERRORS');
            mockAxios.reset();
        });

        test('putChecks submits to api and executes proper commit', async () => { 
            const context = {
                commit: jest.fn()
            };
            const payload = { test: 'update checks' };
            checksStore.actions.putChecks(context, payload);
            expect(mockAxios.patch).toHaveBeenCalledWith('checks/update-multiple/', payload);
            // This isn't possible at this time due to `jest-mock-axios` not supporting .patch fully.
            // const response = { data: 'response' };
            // mockAxios.mockResponse(response);
            // await flushPromises();
            // expect(context.commit).toHaveBeenCalledWith('CLEAR_ERRORS');
            // mockAxios.reset();
            mockAxios.patch.mockReset();
        });

        test('deleteCheck submits to api and executes proper commit', async () => { 
            const context = {
                commit: jest.fn(),
                state: {
                    activeCheck: { test: 'check', id: 1 }
                }
            };
            checksStore.actions.deleteCheck(context);
            expect(mockAxios.delete).toHaveBeenCalledWith('checks/1/');
            const response = { status: 201, data: 'response' };
            mockAxios.mockResponse(response);
            await flushPromises();
            expect(context.commit).toHaveBeenCalledWith('CLEAR_ERRORS');
        });

        test('deleteChecks submits to api and executes proper commit', async () => { 
            const context = {
                commit: jest.fn(),
                state: {
                    unsignedChecks: [
                        { test: 'checkOne', id: 1 },
                        { test: 'checkTwo', id: 2 },
                        { test: 'checkThree', id: 3 }
                    ]
                }
            };
            const toDelete = '1,2,3';
            checksStore.actions.deleteChecks(context, toDelete);
            expect(mockAxios.post).toHaveBeenCalledWith(`checks/delete-checks/?delete=${toDelete}`);
            const response = { status: 201, data: 'response' };
            mockAxios.mockResponse(response);
            await flushPromises();
            expect(context.commit).toHaveBeenCalledWith('CLEAR_ERRORS');
        });
    });
});
