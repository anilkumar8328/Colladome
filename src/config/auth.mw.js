const jwt = require('jsonwebtoken');
const {env} = require('../env')
const { _throw401, _throw500, _throw400 } = require("../config/err.handler");

exports.IS_AUTHENTICATED = (req, res, next)=>{
    if(!req.headers){
        return _throw401(res,'Headers missing.')
    }

    if(!req.headers.authorization){
        return _throw401(res, 'Authentication required!')
    }

    try{
        token_type = req.headers.authorization.split(" ")[0]
        token = req.headers.authorization.split(" ")[1]
    }catch(err){
        return _throw401(res, 'Invalid token')
    }

    if(!token){
        return _throw401(res,'Token is missing.')
    }
    if(token_type!='Bearer'){
        return _throw401(res, 'Invalid Token Type')
    }

    let payload;
    try {
        payload = jwt.verify(token,env.access_secretkey)
    } catch (error) {
        return _throw401(res,
            {
            code: "token_not_valid",
            detail: "Given token not valid for any token type"
        })
    }
    console.log(payload)

    if (payload.exp <= Date.now()/1000 ) {
        return _throw400(res,"Token has expired");
      }
    req.payload = payload
    // if(payload.is_active!=true){
    //     return _throw401(res,'User not active.')
    // }
    
    req.headers.user = payload.user;
    next()
}
