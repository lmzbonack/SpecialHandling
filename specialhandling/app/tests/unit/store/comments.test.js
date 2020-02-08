import commentsStore from '../../../store/modules/comments';
import mockAxios from '../__mocks__/axios';
import flushPromises from 'flush-promises';

describe('comments.test.js', () => {
    describe('mutations', () => {
        const comment = {
            related_check: '',
            comment: ''
        };

        const errors = [
            { 'comment': ['this needs to be a thing'] }
        ];

        test('ADD_COMMENTS sets state.comments to comments', () => {
            const state = {
                comments: []
            };

            const comments = [
                { related_check: '2', comment: 'a comment' },
                { related_check: '2', comments: 'another comment' }
            ];

            commentsStore.mutations.ADD_COMMENTS(state, comments);
            expect(state.comments).toEqual(comments);
        });

        test('SET_ITEM sets state.activeComment to comment', () => {
            const state = {
                activeComment: {}
            };

            commentsStore.mutations.SET_ITEM(state, comment);
            expect(state.activeComment).toEqual(comment);
        });

        test('SET_ERRORS sets state.errors to errors', () => {
            const state = {
                errors: []
            };

            commentsStore.mutations.SET_ERRORS(state, errors);
            expect(state.errors).toEqual(errors);
        });

        test('CLEAR_ERRORS clears state.errors', () => {
            const state = {
                errors: []
            };

            commentsStore.mutations.SET_ERRORS(state, errors);
            expect(state.errors).toEqual(errors);
            commentsStore.mutations.CLEAR_ERRORS(state);
            expect(state.errors).toEqual({});
        });
    });

    describe('getters', () => {
        test('comments returns state.comments', () => {
            const array = [{comment: 1}, {comment: 2}];
            const state = {
                comments: [ ...array ]
            };
            const result = commentsStore.getters.comments(state);
            expect(result).toHaveLength(2);
            result.forEach((item, i) => {
                expect(item).toEqual(array[i]);
            });
        });

        test('activeComment returns state.activeComment', () => {
            const state = {
                activeComment: { id: 1 }
            };
            const result = commentsStore.getters.activeComment(state);
            expect(result).toEqual(state.activeComment);
        });

        test('errors returns state.errors', () => {
            const array = [{error: ['error']}, {error: ['error']}];
            const state = {
                errors: [ ...array ]
            };
            const result = commentsStore.getters.errors(state);
            expect(result).toHaveLength(2);
            result.forEach((item, i) => {
                expect(item).toEqual(array[i]);
            });
        });
    });

    describe('actions', () => {
        test('setItem calls commit with item', () => {
            const comment = { field: 'comment data' };
            const context = {
                commit: jest.fn()
            };

            commentsStore.actions.setItem(context, comment);
            expect(context.commit).toHaveBeenCalledWith('SET_ITEM', comment);
        });

        test('clearErrors calls commit', () => {
            const context = {
                commit: jest.fn()
            };
            commentsStore.actions.clearErrors(context);
            expect(context.commit).toHaveBeenCalledWith('CLEAR_ERRORS');
        });

        test('fetchAll calls api and executes proper commit', async () => {
            const context = {
                commit: jest.fn()
            };
            commentsStore.actions.fetchAll(context);
            expect(mockAxios.get).toHaveBeenCalledWith('comments/');
            const response = { data: 'response' };
            mockAxios.mockResponse(response);
            await flushPromises();
            expect(context.commit).toHaveBeenCalledWith('ADD_COMMENTS', response.data);
            mockAxios.reset();
        });

        test('fetchOne calls api and executes proper commit', async () => { 
            const context = {
                commit: jest.fn()
            };
            commentsStore.actions.fetchOne(context, 1);
            expect(mockAxios.get).toHaveBeenCalledWith('comments/1/');
            const response = { data: 'response' };
            mockAxios.mockResponse(response);
            await flushPromises();
            expect(context.commit).toHaveBeenCalledWith('SET_ITEM', response.data);
            mockAxios.reset();
        });

        test('post submits to api and executes proper commit when called without payload', async () => { 
            const context = {
                commit: jest.fn(),
                state: {
                    activeComment: { test: 'comment' }
                }
            };
            commentsStore.actions.post(context);
            expect(mockAxios.post).toHaveBeenCalledWith('comments/', context.state.activeComment);
            const response = { data: 'response' };
            mockAxios.mockResponse(response);
            await flushPromises();
            expect(context.commit).toHaveBeenCalledWith('CLEAR_ERRORS');
            mockAxios.reset();
        });

        test('post submits to api and executes properly with payload', async () => { 
            const context = {
                commit: jest.fn()
            };
            const payload = { test: 'comment' };
            commentsStore.actions.post(context, payload);
            expect(mockAxios.post).toHaveBeenCalledWith('comments/', payload);
            const response = { data: 'response' };
            mockAxios.mockResponse(response);
            await flushPromises();
            mockAxios.reset();
        });

        test('put submits to api and executes proper commit', async () => { 
            const context = {
                commit: jest.fn(),
                state: {
                    activeComment: { test: 'comment', id: 1 }
                }
            };
            commentsStore.actions.put(context);
            expect(mockAxios.put).toHaveBeenCalledWith('comments/1/', context.state.activeComment);
            const response = { data: 'response' };
            mockAxios.mockResponse(response);
            await flushPromises();
            expect(context.commit).toHaveBeenCalledWith('CLEAR_ERRORS');
            mockAxios.reset();
        });

        test('delete submits to api and executes proper commit', async () => { 
            const context = {
                commit: jest.fn(),
                state: {
                    activeComment: { test: 'comment', id: 1 }
                }
            };
            commentsStore.actions.delete(context);
            expect(mockAxios.delete).toHaveBeenCalledWith('comments/1/');
            const response = { data: 'response' };
            mockAxios.mockResponse(response);
            await flushPromises();
            expect(context.commit).toHaveBeenCalledWith('CLEAR_ERRORS');
            mockAxios.reset();
        });
    });
});
