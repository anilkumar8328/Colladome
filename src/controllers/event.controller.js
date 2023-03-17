const { Event } = require('../models/event.model')
const { _throw401, _throw500, _throw400 } = require("../config/err.handler");

exports.CREATE_EVENT = async (req, res) => {
  
    let new_event = new Event(req.body)
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

exports.GET_EVENT = async (req, res) => {
    if (!req.query.event_id) {
        return _throw400(res, "event ID is required!")
    }

    let event_details = null
    try {
        event_details = await Event.findOne({ "_id": req.query.event_id }).exec()
    } catch (error) {
        return _throw400(res, error)
    }

    if (!event_details) {
        return _throw404(res,'no page found')
    }

    return res.status(200).json(event_details)  
}

exports.SPECIFIC_USERS_EVENT = async (req, res) => {
    if (!req.query.user_id) {
        return _throw400(res, "event ID is required!")
    }

    let event_details = null
    try {
        event_details = await Event.find({ "event-createdby": req.query.user_id }).exec()
    } catch (error) {
        return _throw400(res, error)
    }

    if (!event_details) {
        return _throw404(res,'no page found')
    }

    return res.status(200).json(event_details)  
}

exports.GET_ALL_EVENTS = async (req, res) => {
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
    try {
        page_list = await Event.aggregate(pipeline).exec()
    } catch (error) {
        return _throw400(res, error)
    }

    if (!page_list) {
        return _throw404(res,'no page found')
    }

    return res.status(200).json(page_list)  
}

exports.GET_EVENT = async (req, res) => {
    if (!req.query.event_id) {
        return _throw400(res, "event ID is required!")
    }

    let event_details = null
    try {
        event_details = await Event.findOne({ "_id": req.query.event_id }).exec()
    } catch (error) {
        return _throw400(res, error)
    }

    if (!event_details) {
        return _throw404(res,'no page found')
    }

    let update_event=null
    try {
        update_event = await Event.findByIdAndUpdate({ "_id": req.query.event_id },req.body,{new:true}).exec()
    } catch (error) {
        return _throw400(res, error)
    } 
    return res.status(200).json(update_event) 
}

exports.DELETE_EVENT = async (req, res) => {
    if (!req.query.event_id) {
        return _throw400(res, "event ID is required!")
    }

    let event_details = null
    try {
        event_details = await Event.findOne({ "_id": req.query.event_id }).exec()
    } catch (error) {
        return _throw400(res, error)
    }

    if (!event_details) {
        return _throw404(res,'no page found')
    }
    let delete_event = null
    try {
        delete_event = await Event.findByIdAndDelete({ "_id": req.query.event_id }).exec()
    } catch (error) {
        return _throw400(res, error)
    }
    return res.status(200).json({message:"event deleted succesful",data:delete_event})  
}