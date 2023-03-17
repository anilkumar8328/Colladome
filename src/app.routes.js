const router = require('express').Router()
const eventController = require("../src/controllers/event.controller")
const inviteController = require("../src/controllers/invite.controller")
const userController = require("../src/controllers/user.controller")
const auth = require('../src/config/auth.mw')



router.get('/test',(req, res) => {
    console.log(req)
    return res.status(200).json({
        "message": "success"
    })
})

router.post('/userSignUp',userController.USER_SIGNUP)

router.post('/userLogin',userController.USER_LOGIN)

router.post('/userChangePassword',userController.CHANGE_USER_PASSWORD)

router.post('/userLogOut',auth.IS_AUTHENTICATED,userController.ADMIN_LOGOUT)

router.post('/userSignUp',auth.IS_AUTHENTICATED,userController.DELETE_USER)

router.post('/createAcessToken',auth.IS_AUTHENTICATED,userController.ACCESSTOKEN_FROM_REFRESHTOKEN)

router.post('/createEvent',auth.IS_AUTHENTICATED,eventController.CREATE_EVENT)

router.delete('/deleteEvent',auth.IS_AUTHENTICATED,eventController.DELETE_EVENT)

router.get('/getAllEvents',eventController.GET_ALL_EVENTS)

router.get('/getEvent',auth.IS_AUTHENTICATED,eventController.GET_EVENT)

router.get('/getUserEvent',auth.IS_AUTHENTICATED,eventController.SPECIFIC_USERS_EVENT)

router.post('/inviteUser',auth.IS_AUTHENTICATED,inviteController.INVITE_USER)

router.get('/getAllEventsForUser',auth.IS_AUTHENTICATED,inviteController.GET_ALL_EVENTS_FOR_A_USER)

router.post('/getSpecificEvent',auth.IS_AUTHENTICATED,inviteController.SPECIFIC_EVENT_INVITES)




module.exports.AppRoutes = router