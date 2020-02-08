let axios = require('axios');

const config = {
    auth: {
        username: 'nightwatch',
        password: 'password'
    }
};

const checkThree = {
    check_number: "1456789",
    check_identifier: "accounts payable",
    contact_email: "jeff@email.arizona.edu",
    contact_name: "Jeff",
    contact_number: "111-000-0000",
    contacted: true,
    edoc_number: "2132443",
    instructions: "ups",
    org_code: "124Z",
    payee_name: "Margret",
    payee_number: "5201234567"
};


exports.command = function (payload) {
    if (payload === "default") {
        payload = checkThree;
    }
    this.execute (
        // axios({
        //     method: 'POST',
        //     url: 'http://localhost:8000/api/checks/',
        //     data: payload,
        //     auth: {
        //         username: 'nightwatch',
        //         password: 'password'
        //     }
        // })
        axios.post('http://localhost:8000/api/checks/', payload, config)
            .then(response => {
                this.globals.createdCheckExternal = response.data.id;
                console.log(this.globals.createdCheckExternal);
            })
            .catch(error => console.log(error))
    );
    return this;
};


