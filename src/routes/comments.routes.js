const express = require('express');

const Authorization = require("../middlewares/auth.middlewares");
const { addcomments } = require('../controllers/comment.controllers');

const router = express.Router();


router.route("/c/:videoId").post(Authorization,addcomments);


module.exports = router;