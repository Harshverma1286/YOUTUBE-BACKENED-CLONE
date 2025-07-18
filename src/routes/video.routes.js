const express = require('express');


const upload = require("../middlewares/multer.middlewares")

const{publishavideo,getvideobyid,updateavideo, deleteavideo, togglepublishstatus, getallvideos} = require("../controllers/video.controllers");

const Authorization = require("../middlewares/auth.middlewares");

const router = express.Router();

router.route("/publishvideo").post(// so working fine
    Authorization,
    upload.fields([
        {
            name: "videofile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
    ]),
    publishavideo
);

router.route("/getvideo/:videoid").get(Authorization,getvideobyid);//working fine

router.route("/c/:videoid").patch(
    Authorization,
    upload.single("thumbnail"),
    updateavideo);//working fine


router.route("/c/:videoid").delete(Authorization,deleteavideo); //working fine

router.route("/toggle/:videoid").patch(Authorization,togglepublishstatus); // working fine

router.route("/c/page/:page/limit/:limit/sortBy/:sortBy/sortType/:sortType/userId/:userId").get(Authorization,getallvideos);//working fine



module.exports = router;