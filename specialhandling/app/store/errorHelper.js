/**
 * Set errors into `state.errors` in a consistent manner, including handling catastrophic errors.
 * @param {Function} commit the action context.commit function to allow setting errors
 * @param {Object} err the error response object from the api request 
 */
function handleErrors (commit, err) {
    // If it actually is an API error
    if (err.response) {
        if (err.response.status == 400) {
            const errors = {};
            errors.server = "Something's not right. Check the form for problems and try again.";
            for (const key in err.response.data) {
                errors[key] = err.response.data[key].join('\n');
            }
            commit('SET_ERRORS', errors);
        } else {
            commit('SET_ERRORS', {
                server: `Uh oh! Server returned error status: ${err.response.status} ${err.response.statusText}`
            });
        }
    }
}

export default handleErrors;
