const express = require('express');

const router = express.Router();

const Authorization = require("../middlewares/auth.middlewares");

const {createtweet, updatetweet, deletetweet, getuseralltweets} = require("../controllers/tweet.controllers");

router.route("/createtweet").post(Authorization,createtweet);

router.route("/c/TweetId/:TweetId").patch(Authorization,updatetweet);

router.route("/delete/TweetId/:TweetId").delete(Authorization,deletetweet);

router.route("/getallusertweets/UserId/:UserId/page/:page/limit/:limit").get(Authorization,getuseralltweets);

module.exports = router;