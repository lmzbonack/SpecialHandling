import ChecksService from '../services/ChecksService';
import SignaturesService from '../services/SignaturesService';
import handleErrors from '../errorHelper';
import Vue from 'vue';

const state = {
    checks: [],
    unsignedChecks: [],
    activeCheck: {
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
        comments: []
    },
    errors: {},
    activeUser: {
        username: '',
        canArchive: false
    }
};

const resetCheck = {
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
    comments: []
};

const mutations = {
    SET_CHECK (state, { ...fields }) {
        state.activeCheck = {
            ...fields
        };
    },
    CLEAR_CHECK (state) {
        state.activeCheck = {
            ...resetCheck
        };
    },
    CLEAR_CHECK_KEEP_ID (state) {
        // preserve ID on clear
        const id = state.activeCheck.id;
        state.activeCheck = {
            id,
            ...resetCheck
        };
    },
    ADD_CHECKS (state, payload) {
        state.checks = payload;
    },
    ADD_UNSIGNED_CHECK (state, payload) {
        state.unsignedChecks.push(payload);
    },
    ADD_UNSIGNED_CHECKS(state, payload) {
        state.unsignedChecks = payload;
    },
    DELETE_CHECK (state, id) {
        let deleteCheckIndex = state.unsignedChecks.findIndex(check => check.id === id);
        if (deleteCheckIndex !== -1) {
            state.unsignedChecks.splice(deleteCheckIndex,1);
        }
    },
    UPDATE_ACTIVE_CHECK (state, payload) {
        const id = state.activeCheck.id;
        let unsignedCheckIndex = state.unsignedChecks.findIndex(check => check.id === id);
        if (unsignedCheckIndex !== -1) {
            Vue.set(state.unsignedChecks, unsignedCheckIndex, payload);
        }
        else {
            let checkIndex = state.checks.findIndex(check => check.id === id);
            Vue.set(state.checks, checkIndex, payload);
        }
    },
    SET_ERRORS (state, errors) {
        state.errors = errors;
    },
    CLEAR_ERRORS (state) {
        state.errors = {};
    },
    SET_EDOC_NULL (state) {
        state.activeCheck.edoc_number = null;
    },
    SET_USER (state, { ...fields }) {
        state.activeUser = {
            ...fields
        };
    }
};

const actions = {
    /**
     * Set a check as the `state.activeCheck`
     * @param {Object} context the context
     * @param {Object} payload a check object 
     */
    setCheck ({ commit }, payload) {
        commit('SET_CHECK', payload);
    },
    /** 
     * Set a user as the `state.activeUser`
     * @param {Object} payload a user object
    */
    setUser ({ commit }, payload){
        commit('SET_USER', payload);
    },
    /** 
     * Updates the activeCheck in either state.checks or state.unsignedChecks
     * @param payload the updated activeCheck object
     * TODO: Might just make this not take a payload and instead use activeCheck
    */
    updateActiveCheck ({ commit }, payload){
        commit('UPDATE_ACTIVE_CHECK', payload);
    },
    /**
     * Set a check as the `state.activeCheck` by Id
     * @param {Object} context the context
     * @param {Number} id a check id
     */
    setCheckById ({ commit, state }, id) {
        let selectedCheck = state.checks.find(check => check.id === id);
        commit('SET_CHECK', selectedCheck);
    },
    /** 
     * Adds a newly created check into state.unsignedChecks
     * @param {Object} payload a newly created check 
    */
    addUnsignedCheck ({ commit }, payload) {
        commit('ADD_UNSIGNED_CHECK', payload);
    },
    /**
     * Reset the `state.activeCheck`. Setting `preserveId` to `true` will presist the current `state.activeCheck.id`
     * @param {Object} context the context
     * @param {Boolean} preserveId set to true to keep the current id
     */
    clearCheck ({ commit }, preserveId) {
        if (preserveId && preserveId === true) {
            commit('CLEAR_CHECK_KEEP_ID');
        } else {
            commit('CLEAR_CHECK');
        }
    },
    /**
     * Clear errors from `state.errors`
     * @param {Object} context the context
     */
    clearErrors ({ commit }) {
        commit('CLEAR_ERRORS');
    },
    /**
     * Set the activeCheck's `edoc_number` to null if the `check_identifier` is "payroll"
     * @param {Object} context the context
     */
    verifyEdoc ({ commit, state }) {
        if (state.activeCheck.check_identifier === "payroll") {
            commit('SET_EDOC_NULL');
        }
    },
    /**
     * Fetch a check from the api by its id
     * @param {Object} context the context
     * @param {Number} id a check id
     */
    async fetchCheckById ({ commit }, id) {
        try {
            const response = await ChecksService.fetchOne(id);
            commit('SET_CHECK', response.data);
        } catch (error) {
            console.error(`GET /api/check/${id} failed: ${error.response.status} - ${error.response.data}`);
        }
    },
    /**
     * Fetch all checks from the api
     * @param {Object} context the context
     */
    async fetchChecks ({ commit }) {
        try {
            const responseCheck = await ChecksService.fetch();
            commit('ADD_CHECKS', responseCheck.data);
        } catch (error) {
            console.error('GET /api/checks failed: ' + error.response.status + ' - ' + error.response.data);
        }
    },
    /**
     * Fetch all unsigned checks from the api
     * @param {Object} context the context
     */
    async fetchUnsignedChecks ({ commit }) {
        try {
            const responseCheck = await ChecksService.fetchUnsigned();
            commit('ADD_UNSIGNED_CHECKS', responseCheck.data);
        } catch (error) {
            console.error('GET /api/checks failed: ' + error.response.status + ' - ' + error.response.data);
        }
    },
    /**
     * Create a check
     * @param {Object} context the context
     */
    async postCheck ({ commit, state }) {
        try { 
            const response = await ChecksService.create(state.activeCheck);
            commit('CLEAR_ERRORS');
            return response;
        } catch (error) {
            handleErrors(commit, error);
            return null;
        }
    },
    /**
     * Create signatures based on a payload provided by the method call. Errors will be saved to the state.
     * @param {Function} context.commit 
     * @param {Object} payload 
     */
    async postSignatures ({ commit }, payload) {
        if (payload !== undefined) {
            try {
                const response = await SignaturesService.createForMultipleChecks(payload);
                commit('CLEAR_ERRORS');
                return response;
            } catch (error) {
                handleErrors(commit, error);
                return null;
            }
        }
    },
    /**
     * Edit the `state.activeCheck`
     * @param {Object} context the context
     */
    async putCheck ({ commit, state }) {
        try {
            const response = await ChecksService.update(state.activeCheck.id, state.activeCheck);
            commit('CLEAR_ERRORS');
            return response;
        } catch (error) {
            handleErrors(commit, error);
            return null;
        }
    },
    /**
     * Update common values of several checks in the api
     * @param {Object} context the context
     * @param {Object} updateData
     * @param {String} updateData.to_modify comma-seperated list of checks to modify
     * @param {String} updateData.instructions check instructions
     * @param {Boolean} updateData.contacted contacted status
     * @param {String} updateData.comment a comment to add to each check
     */
    async putChecks ({ commit }, updateData) {
        try {
            const response = await ChecksService.updateMultiple(updateData);
            commit('CLEAR_ERRORS');
            // Make sure this does not run if the update is not successful
            let toUpdate = updateData.to_modify.split(',');
            toUpdate.forEach( (checkId) => {
                const response = ChecksService.fetchOne(checkId)
                    .then(() => commit('UPDATE_ACTIVE_CHECK', response.data));
            });
            return response;
        } catch (error) {
            handleErrors(commit, error);
            return null;
        }
    },
    /**
     * Delete the `state.activeCheck` from the api 
     * @param {Object} context the context
     */
    async deleteCheck ({ commit, state }) {
        try {
            const response = await ChecksService.delete(state.activeCheck.id);
            commit('CLEAR_ERRORS');
            // Make sure that this does not run if the delete is not successful
            commit('DELETE_CHECK', state.activeCheck.id);
            return response;
        } catch (error) {
            handleErrors(commit, error);
            return null;
        }
    },
    /**
     * Delete multiple checks from the api
     * @param {Object} context the context
     * @param {String} deleteCheckString a comma-seperated list of checks to delete
     */
    async deleteChecks ({ commit }, deleteCheckString) {
        try {
            const response = await ChecksService.deleteMultiple(deleteCheckString);
            commit('CLEAR_ERRORS');
            // Make sure that this does not run if the delete is not successful
            let toDelete = deleteCheckString.split(',');
            toDelete.forEach( (checkId) => {
                commit('DELETE_CHECK', Number(checkId));
            });
            return response;
        } catch (error) {
            handleErrors(commit, error);
            return null;
        }
    }
};

const getters = {
    checks: state => state.checks,
    activeCheck: state => state.activeCheck,
    errors: state => state.errors,
    signatures: state => state.signatures,
    unsignedChecks: state => state.unsignedChecks,
    signedChecks: state => state.checks.filter(check => check.signature != null)
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
