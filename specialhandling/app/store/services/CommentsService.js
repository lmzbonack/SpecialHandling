import Api from './api';

export default {
    /**
     * Return a list of comments
     */
    fetch () {
        return Api().get('comments/');
    },

    /**
     * Return a single comment by id
     * @param {Number} id the comment id
     */
    fetchOne (id) {
        return Api().get(`comments/${id}/`);
    },

    /**
     * Send a post request to the comments endpoint
     * @param {Object} comment a comment object
     */
    create (comment) {
        return Api().post('comments/', comment);
    },

    /**
     * Send a put request to the comments endpoint
     * @param {Number} id the comment id
     * @param {Object} comment a comment object
     */
    update (id, comment) {
        return Api().put(`comments/${id}/`, comment);
    },

    /**
     * Send a delete request to the comments endpoint
     * @param {Number} id the comment id
     */
    delete (id) {
        return Api().delete(`comments/${id}/`);
    }
};
