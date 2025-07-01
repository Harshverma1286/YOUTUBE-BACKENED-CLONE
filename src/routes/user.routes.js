const express = require('express');
const upload = require("../middlewares/multer.middlewares")

const router = express.Router();

const registeruser = require('../controllers/user.controllers')

router.route("/register").post(
    upload.fields(
        {
            name:"avatar",
            maxcount:1
        },
        {
            name:"coverimage",
            maxcount:1,
        },
    ),
    registeruser);


module.exports = router;

