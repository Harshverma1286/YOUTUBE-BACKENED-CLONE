const express = require('express');

const Authorization = require("../middlewares/auth.middlewares");
const { addcomments, updatecomment, deletecomment,getallcomments } = require('../controllers/comment.controllers');

const router = express.Router();

router.route("/getallcomments/:videoId").get(Authorization, getallcomments);

router.route("/c/:videoId").post(Authorization,addcomments);

router.route("/c/:commentId").patch(Authorization,updatecomment);

router.route("/c/:commentid").delete(Authorization,deletecomment);


module.exports = router;