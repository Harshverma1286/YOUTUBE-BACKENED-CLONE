const express = require('express');
const upload = require("../middlewares/multer.middlewares")

const router = express.Router();

const registeruser = require('../controllers/user.controllers')

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverimage",
            maxCount:1,
        },
    ]),
    registeruser);


module.exports = router;

