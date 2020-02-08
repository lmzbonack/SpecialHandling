import Api from './api';

export default {
    /**
     * Return a list of checks
     */
    fetch () {
        return Api().get('checks/');
    },
    /**
     * Return a list of unsigned checks
     */
    fetchUnsigned () {
        return Api().get('checks/unsigned-checks/');
    },
    /**
     * Return a single check by id
     * @param {Number} id the check id
     */
    fetchOne (id) {
        return Api().get(`checks/${id}/`);
    },

    /**
     * Send a post request to the checks endpoint
     * @param {Object} payload a check object
     */
    create (payload) {
        return Api().post('checks/', payload);
    },

    /**
     * Send a put request to the checks endpoint
     * @param {Number} id the check id
     * @param {Object} payload a check object
     */
    update (id, payload) {
        return Api().put(`checks/${id}/`, payload);
    },

    /**
     * Send a put request to the checks endpoint
     * @param {Object} payload an object containing values to modify on multiple checks
     * @param {String} payload.to_modify comma seperated string of check ids
     * @param {String} payload.instructions instructions
     * @param {Boolean} payload.contacted boolean value for customer contacted
     * @param {String} payload.comment a comment to append to each check
     */
    updateMultiple (payload) {
        return Api().patch(`checks/update-multiple/`, payload);
    },

    /**
     * Send a delete request to the checks endpoint
     * @param {Number} id the check id
     */
    delete (id) {
        return Api().delete(`checks/${id}/`);
    },

    /**
     * Send a delete request to the checks endpoint
     * @param {String} toDelete a comma-seperated list of checks to delete
     */
    deleteMultiple (toDelete) {
        return Api().post(`checks/delete-checks/?delete=${toDelete}`);
    },

    /**
     * Archive a signature so that it can be re-signed
     * @param {Object} payload an object containing values to archive a signature
     * @param {Number} payload.check_id the check id to archive
     * @param {String} payload.reason the reason for archiving
     */
    archiveSignature (payload) {
        return Api().patch('checks/archive/', payload);
    },

    userCanArchive () {
        return Api().get('checks/user-can-archive/');
    }
};
