const express = require('express');


const upload = require("../middlewares/multer.middlewares")

const{publishavideo} = require("../controllers/video.controllers");

const Authorization = require("../middlewares/auth.middlewares");

const router = express.Router();

router.route("/publishvideo").post(Authorization,
    upload.fields([
        {
            name:"videofile",
            maxCount:1,
        },
        {
            name:"thumbnail",
            maxCount:1
        }
]),
publishavideo);

module.exports = router;