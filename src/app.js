const express = require('express');
const { AppRoutes } = require('./app.routes');
const app = express();
const {event_db} = require('./config/db.connection');

app.use(express.json())
const multer=require('multer')
app.use(multer().any())


app.use('/',(req,res,next)=>{
    console.log(req.url)
    next()
},AppRoutes)

app.listen(env.port,()=>{
    console.log('Server running on port ',env.port);
})
