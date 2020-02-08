/**
 * Methods for interacting with the Django backend.
 */

import axios from 'axios';

export default () => {
    return axios.create({
        baseURL: `/api/`,
        withCredentials: false,
        headers: {
            'X-CSRFToken': $("[name=csrfmiddlewaretoken]").val()
        }
    });
};
