let axios = require('axios');

const config = {
    auth: {
        username: 'nightwatch',
        password: 'password'
    }
};

exports.command = function () {
    let id = this.globals.createdCheckExternal;
    this.execute (
        axios.delete(`http://localhost:8000/api/checks/${id}/`, config)
            .catch(error => console.log(error)) 
    );
    return this;
};
