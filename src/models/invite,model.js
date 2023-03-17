const mongoose = require('mongoose');
const { event_db } = require('../config/db.connection');

const Schema = new mongoose.Schema({
    'event_id': {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'event-details'
    },
    'invited_by': {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user-details'
    },
    'invited_to': {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user-details'
    }
}, { timestamps: true });

module.exports.Invite = event_db.model('invite-details', Schema, 'invite-details');