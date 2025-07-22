const express = require('express');

const router = express.Router();

const Authorization = require("../middlewares/auth.middlewares");

const {createplaylist, getplaylistbyid, addvideotoplaylist, deletevideosfromplaylist, deleteplaylist, updateplaylist, getuserplaylists} = require("../controllers/playlist.controllers");

router.route("/createplaylist").post(Authorization,createplaylist);

router.route("/getplaylist/playlistid/:PlaylistId").get(Authorization,getplaylistbyid);

router.route("/addvideosintheplaylist/playlistid/:PlaylistId/videoid/:videoId").post(Authorization,addvideotoplaylist);

router.route("/deletevideofromplaylist/playlistid/:PlaylistId/videoid/:videoId").delete(Authorization,deletevideosfromplaylist);

router.route("/deleteplaylist/playlistid/:PlaylistId").delete(Authorization,deleteplaylist);

router.route("/updateplaylist/playlistid/:PlaylistId").patch(Authorization,updateplaylist);

router.route("/getallplaylist/userid/:userId").get(Authorization,getuserplaylists);




module.exports = router;