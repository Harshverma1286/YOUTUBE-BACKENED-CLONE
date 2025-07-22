const express = require('express');

const router = express.Router();

const Authorization = require("../middlewares/auth.middlewares");


const { togglevideolike, togglecommentlike, togletweetlike } = require("../controllers/like.controllers");


router.route("/togglevideolike/videoid/:VideoId").post(Authorization,togglevideolike);

router.route("/togglecommentlike/commentid/:CommentId").post(Authorization,togglecommentlike);

router.route("/toggletweetlike/tweetid/:TweetId").post(Authorization,togletweetlike);



module.exports = router;