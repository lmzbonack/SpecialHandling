import Api from './api';

export default {
    /**
     * Return a list of signatures
     */
    fetch () {
        return Api().get('signatures/');
    },

    /**
     * Send a post request to the signatures endpoint
     * @param {Object} payload a signature object
     */
    create (payload) {
        return Api().post('signatures/', payload);
    },

    /**
     * Send a post request to the signatures/create-multiple endpoint to add a signature to multiple checks
     * @param {Object} payload a signature object
     * @param {Array} payload.checks a list of checks to add the signature to
     * @param {String} payload.first_name first name
     * @param {String} payload.last_name last name
     * @param {String} payload.signature the signature svg
      */
    createForMultipleChecks (payload) {
        return Api().post('signatures/create-multiple/', payload);
    },
};
