const { default: mongoose } = require('mongoose')
const { Invite } = require('../models/invite,model')
const { _throw401, _throw500, _throw400 } = require("../config/err.handler");

exports.INVITE_USER = async (req, res) => {
    if (!req.body.event_id) {
        return _throw400(res, "event ID is required!")
    }
    if (!req.body.invited_by) {
        return _throw400(res, "invitedby user is required!")
    }
    if (!req.body.invited_to) {
        return _throw400(res, "invited user is required!")
    }
    let new_event = new Invite(req.body)
    new_event.validate().then((_noerr) => {

        new_event.save().then(saved => {
            return res.status(201).json(saved)
        }).catch(err => {
            return _throw400Err(res, err)
        })
    }).catch(err => {
        return _throw400Err(res, err)
    })
}

exports.GET_ALL_EVENTS_FOR_A_USER = async (req, res) => {
    let pipeline=[]
    let page_list = null

    let page = 1
    if (req.query.page) {
        page = parseInt(req.query.page)
    }

    let page_size = 10
    if (req.query.page_size) {
        page_size = parseInt(req.query.page_size)
    }
    pipeline.push( {
        $sort:{createdAt:-1}
    })
    pipeline.push( {
        $match:{"user":mongoose.Types.ObjectId(req.headers.user)}
    })
    if (req.query.search) {
        pipeline.push({
            $match: {
                "event-name": { $regex: '.*' + req.query.search + '.*', $options: 'i' }
            }
        })
    }
    pipeline.push({
        $facet: {
            "records": [{ "$skip": (page - 1) * page_size }, { "$limit": page_size }],
        }
    })
    pipeline.push( {
        $lookup:{
            from:"invite-details",
            let:{
                user:"$event-createdby"
            },
            pipeline:[
                {
                    $match:{
                        $expr:{
                            $eq:["$invited_to","$$event-createdby"]
                        }
                    }
                },
                {
                    $lookup:{
                        from:"event-details",
                        let:{
                            event:"$event_id"
                        },
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $eq:["$_id","$$event"]
                                    }
                                }
                            },
                            {
                                $lookup:{
                                    from:"user-details",
                                    localFiled:"event-createdby",
                                    foreignField:"_id",
                                    as:"event-creator"
                                }
                            }
                        ],
                        as:"event-details"
                    }
                }
            ],
            as:"invited-events"}
    })
    try {
        page_list = await Event.aggregate(pipeline).exec()
    } catch (error) {
        return _throw400(res, error)
    }

    if (!page_list) {
        return _throw404(res,'no event found')
    }

    return res.status(200).json(page_list)  
}

exports.SPECIFIC_EVENT_INVITES=async (req,res)=>{
    let event_list=null
try {
    event_list = await Event.aggregate([
        {
            $lookup:{
                from:"invite-details",
                let:{
                    event:"$_id"
                },
                pipeline:[
                    {
                        $match:{
                            $expr:{
                                $eq:["$event_id","$$event"]
                            }
                        }
                    },
                    {
                        $lookup:{
                            from:"user-details",
                            let:{
                                user:"$invited_to"
                            },
                            pipeline:[
                                {
                                    $match:{
                                        $expr:{
                                            $eq:["$_id","$$user"]
                                        }
                                    }
                                },],
                            as:"event-creator"
                        }
                    }
                ],
                as:"invited-users"
            }
        }
    ]).exec()
    } catch (error) {
        return _throw400(res, error)
    }

    if (!event_list) {
        return _throw404(res,'no event found')
    }

    return res.status(200).json(event_list) 
}