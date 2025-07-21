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
const commentrouter = require("./routes/comments.routes");
const tweetrouter = require("./routes/tweet.routes");

app.use("/api/v1/users",userrouter);
app.use("/api/v1/videos",videorouter);
app.use("/api/v1/comments",commentrouter);
app.use("/api/v1/tweets",tweetrouter);


module.exports = app;
