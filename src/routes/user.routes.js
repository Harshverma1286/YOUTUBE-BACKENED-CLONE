const express = require('express');
const upload = require("../middlewares/multer.middlewares")

const Authorization = require("../middlewares/auth.middlewares");

const router = express.Router();

const {registeruser,loginuser,logoutuser,refreshacesstoken, changecurrentpassword, getcurrentuser, updateaccountdetails, updateavatarorfiles, updatecoverimageorfiles, getuserchannelprofile, getuserwatchhistory} = require('../controllers/user.controllers')

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

router.route("/refresh-token").post(refreshacesstoken);

router.route("/changepassword").post(Authorization,changecurrentpassword);

router.route("/getcurrentuser").post(Authorization,getcurrentuser);

router.route("/updateaccountdetails").patch(updateaccountdetails);

router.route("/updateavatar").patch(Authorization,upload.single("avatar"),updateavatarorfiles);

router.route("/updatecoverimage").patch(Authorization,upload.single("coverimage"),updatecoverimageorfiles);

router.route("/c/:username").get(Authorization,getuserchannelprofile);

router.route("/watchhistory").get(Authorization,getuserwatchhistory);

module.exports = router;

