const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    password: {
        type: String,
        select: false
    },
    token: {
        type: String,
        select: false
    }
});

module.exports = mongoose.model('User',userSchema);