const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(cookieParser());
app.use(express.static("public"));


const userrouter = require('./routes/user.routes');
const videorouter = require('./routes/video.routes');

app.use("/api/v1/users",userrouter);
app.use("/api/v1/videos",videorouter);


module.exports = app;
