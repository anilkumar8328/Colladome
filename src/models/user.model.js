const mongoose = require('mongoose');
const { event_db } = require('../config/db.connection');

const Schema = new mongoose.Schema({
    'name': {
        type: String,
        required: true
    },
    'email': {
        type: String,
        unique:true,
        required: true
    },
    'password': {
        type: String,
        required: true
    }
}, {timestamps: true});

module.exports.User = event_db.model('user-details',Schema,'user-details');