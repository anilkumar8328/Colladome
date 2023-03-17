const mongoose = require('mongoose');
const { event_db } = require('../config/db.connection');

const Schema = new mongoose.Schema({
    'event-createdby':{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user-details'
    },
    'event-name': {
        type: String,
        required: true
    },
    'event-speaker': {
        type: String,
        required: true
    },
    'event-price': {
        type: String,
        required: true
    },
    'event-date':{
        type:Date,
        required:true
    }
}, {timestamps: true});

module.exports.Event = event_db.model('event-details',Schema,'event-details');