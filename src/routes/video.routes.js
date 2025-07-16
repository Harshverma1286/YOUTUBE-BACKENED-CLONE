const express = require('express');


const upload = require("../middlewares/multer.middlewares")

const{publishavideo,getvideobyid,updateavideo} = require("../controllers/video.controllers");

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

router.route("/getvideo").get(Authorization,getvideobyid);

router.route("/c/:videoid").patch(
    Authorization,
    upload.single("thumbnail"),
    updateavideo);

    



module.exports = router;