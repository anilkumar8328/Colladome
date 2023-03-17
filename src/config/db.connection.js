const mongoose = require('mongoose')
const { env } = require('../env')

var inst= mongoose.createConnection(env.mongoDb_String)
module.exports = {
    event_db: inst,
}