const express = require('express');


const upload = require("../middlewares/multer.middlewares")

const{publishavideo,getvideobyid,updateavideo, deleteavideo, togglepublishstatus} = require("../controllers/video.controllers");

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


router.route("/c/:videoid").patch(Authorization,deleteavideo);

router.route("/c/:videoid").patch(Authorization,togglepublishstatus);





module.exports = router;