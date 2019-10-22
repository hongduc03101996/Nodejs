const CustomerModel = require("../models/model.customer");
const PasswordModel = require("../models/model.password");
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/local',{ useNewUrlParser: true, useUnifiedTopology: true })

const user = mongoose.model('user', userSchema)
const user_password = mongoose.model('password', passwordSchema)

class db {
    static postUser(data) {
        
    }
}