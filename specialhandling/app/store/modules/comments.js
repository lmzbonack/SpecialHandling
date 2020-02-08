import CommentsService from '../services/CommentsService';
import handleErrors from '../errorHelper';

const state = {
    comments: [],
    activeComment: {
        related_check: "",
        comment: ""
    },
    errors: {}
};

const mutations = {
    ADD_COMMENTS (state, payload) {
        state.comments = payload;
    },
    SET_ITEM (state, { ...fields }) {
        state.activeComment = {
            ...fields
        };
    },
    SET_ERRORS (state, errors) {
        state.errors = errors;
    },
    CLEAR_ERRORS (state) {
        state.errors = {};
    }
};

const actions = {
    /**
     * Set a comment as the `state.activeComment`
     * @param {Object} context the context
     * @param {Object} payload a comment object 
     */
    setItem ({ commit }, payload) {
        commit('SET_ITEM', payload);
    },
    /**
     * Clear errors from `state.errors`
     * @param {Object} context the context 
     */
    clearErrors ({ commit }) {
        commit('CLEAR_ERRORS');
    },
    /**
     * Fetch all comments from the api
     * @param {Object} context the context
     */
    async fetchAll ({ commit }) {
        try {
            const response = await CommentsService.fetch();
            commit('ADD_COMMENTS', response.data);
        } catch(error) {
            handleErrors(commit, error);
            return null;
        }
    },
    /**
     * Fetch a comment from the api by id
     * @param {Object} context the context
     * @param {Number} id a comment's id 
     */
    async fetchOne ({commit}, id) {
        try {
            const response = await CommentsService.fetchOne(id);
            commit('SET_ITEM', response.data);
            return response;
        } catch (error) {
            handleErrors(commit, error);
            return null;
        }
    },
    /**
     * Create a comment to the api. Including a payload sends that instead of the `state.activeComment`
     * @param {Object} context the context
     * @param {Object} payload a comment object (optional)
     */
    async post ({ commit, state }, payload) {
        // Send a payload to post, or send the active comment if there is no payload
        if (payload !== undefined) {
            try {
                const response = await CommentsService.create(payload);
                return response;
            } catch (error) {
                return error;                
            }
        } else {
            try {
                const response = await CommentsService.create(state.activeComment);
                commit('CLEAR_ERRORS');
                return response; 
            } catch (error) {
                handleErrors(commit, error);
                return null;
            }
        }
    },
    /**
     * Edit to the `state.activeComment`
     * @param {Object} context the context
     */
    async put ({ commit, state }) {
        try {
            const response = await CommentsService.update(state.activeComment.id, state.activeComment);
            commit('CLEAR_ERRORS');
            return response;
        } catch (error) {
            handleErrors(commit, error);
            return null;
        }
    },
    /**
     * Delete the `state.activeComment` from the api
     * @param {Object} context the context
     */
    async delete ({ commit, state }) {
        try {
            const response = await CommentsService.delete(state.activeComment.id);
            commit('CLEAR_ERRORS');
            return response;
        } catch (error) {
            handleErrors(commit, error);
            return null;
        }
    }
};

const getters = {
    comments: state => state.comments,
    errors: state => state.errors,
    activeComment: state => state.activeComment
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
