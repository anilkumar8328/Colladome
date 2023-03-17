const router = require('express').Router()
const eventController = require("../src/controllers/event.controller")
const inviteController = require("../src/controllers/invite.controller")
const userController = require("../src/controllers/user.controller")



router.get('/test',(req, res) => {
    console.log(req)
    return res.status(200).json({
        "message": "success"
    })
})



module.exports.AppRoutes = router