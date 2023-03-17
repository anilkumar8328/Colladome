const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User } = require('../models/user.model')
let invalidate = new Set()
const { _throw401, _throw500, _throw400 } = require("../config/err.handler");

exports.USER_SIGNUP = async (req, res) => {
    let check_user_existance = null
    check_user_existance = await User.findOne({ 'email': req.body.email })
    if (check_user_existance) {
        return _throw400(res, 'User Alreday Exists')
    }
    let hashed_password = await bcrypt.hash(req.body.password, env.saltround)
    req.body.password = hashed_password
  
    let newUser = new User(req.body)
    newUser.validate().then((_noerr) => {
        newUser.save().then(saved_user => {

            return res.status(201).json(saved_user)
        }).catch(err => {
            return _throw400Err(res, err)
        })
    }).catch(err => {
        return _throw400Err(res, err)
    })
}

exports.USER_LOGIN = async (req, res) => {
    if (!req.body.email) {
        return _throw400(res, 'Email Required')
    }
    if (!req.body.password) {
        return _throw400(res, 'Password Required')
    }

    let user_details = null
    try {
        user_details = await User.findOne({ 'email': req.body.email ,isActive:true}).exec()
    } catch (error) {
        return _throw400(res, error)
    }
    if (!user_details) {
        return _throw404(res, 'user not found')
    }

    let password_match = null
    try {
        password_match = await bcrypt.compare(req.body.password, user_details.password)
    } catch (error) {
        return _throw400(res, error)
    }
    if (!password_match) {
        return _throw400Err(res, 'password not match')
    }

    let access_token = null
    let refresh_token = null
    let payload = {
        email: user_details.email,
        role: user_details.role,
        is_active: user_details.isActive,
        iat: Date.now()
    }
    refresh_token = jwt.sign(payload, env.refresh_secretkey, { expiresIn: env.refresh_exp_time })
    access_token = jwt.sign(payload, env.access_secretkey, { expiresIn: env.access_exp_time })

    return res.status(200).json({
        "access Token": access_token,
        "refresh Token": refresh_token,
        "user": {
            firstName: user_details.name,
            email: user_details.email,
            role: user_details.role,
            isActive: user_details.isActive
        },
    })
}

exports.CHANGE_USER_PASSWORD = async (req, res) => {
    if (!req.query.user_id) {
        return _throw400(res, "User ID is required!")
    }

    let user_details = null
    try {
        user_details = await User.findOne({ "_id": req.query.user_id }).exec()
    } catch (error) {
        return _throw400(res, error)
    }

    if (!user_details) {
        return _throw404(res,'user not found')
    }
    let hashed_password = await bcrypt.hash(req.body.password, env.saltround)
  
    let update_password= null
    try {
        update_password = await User.findOneAndUpdate({ "_id": req.query.user_id },{
            $set:{password:hashed_password}},{new:true}
        ).exec()
    } catch (error) {
        return _throw400Err(res, error)
    }
    console.log(update_password)
    return res.status(200).json({ message: 'password updated successful' })
}

exports.DELETE_USER = async (req, res) => {
    if (!req.query.user_id) {
        return _throw400(res, "User ID is required!")
    }

    let user_details = null
    try {
        user_details = await User.findOne({ "_id": req.query.user_id }).exec()
    } catch (error) {
        return _throw400(res, error)
    }

    if (!user_details) {
        return _throw404(res,'user not found')
    }

    let delete_user_details= null
    try {
        delete_user_details = await User.findOneAndDelete({ "_id": req.query.user_id }).exec()
    } catch (error) {
        return _throw400Err(res, error)
    }
    console.log(delete_user_details)
    return res.status(200).json({ message: 'member deleted successful' })
}

exports.ADMIN_LOGOUT = async (req, res) => {
    invalidate.add(req.body.refreshToken)
    return res.status(200).json({ message: 'logout sucessful' })
}

exports.FORGET_PASSWORD = async (req, res) => {

    let user_details = null
    let update_password = null
    try {
        user_details = await User.findOne({ "name": req.body.name, "email": req.body.email }).exec()
    } catch (error) {
        return _throw400(res, error)
    }
    if (!user_details) {
        return _throw404(res, 'user not found')
    }
   
    let hashed_password = await bcrypt.hash(req.body.password, env.saltround)

    update_password = await User.findByIdAndUpdate(user_details._id,{password:hashed_password},
        { new: true }).exec()
    console.log(update_password)
    if (!update_password) {
        return _throw400(res, 'fail to update password')
    }
    return res.status(200).json({ message: 'password update successful' })
}

exports.ACCESSTOKEN_FROM_REFRESHTOKEN = (req, res, next) => {
    const refresh_token = req.body.refreshToken;
    if (!refresh_token) {
        return _throw400(res, "Refresh token not found, login again");
    }
    if (invalidate.has(refresh_token)) {
        return _throw400(res, "unauthorized");
    }
    jwt.verify(refresh_token, env.refresh_secretkey, (err, user) => {
        if (user) {
            let payload = {
                email: user.email,
                role: user.role,
                is_active:user.isActive,
                iat: Date.now()
            }
            const access_token = jwt.sign(payload, env.access_secretkey, { expiresIn: env.access_exp_time });
            return res.json({ success: true, access_token });
        } else {
            return res.json({
                success: false,
                message: "Invalid refresh token"
            });
        }
    });
};
