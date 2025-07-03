const express = require('express');
const upload = require("../middlewares/multer.middlewares")

const Authorization = require("../middlewares/auth.middlewares");

const router = express.Router();

const {registeruser,loginuser,logoutuser} = require('../controllers/user.controllers')

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

router.route("/login").post(loginuser);

router.route("/logout").post(Authorization,logoutuser);


module.exports = router;

