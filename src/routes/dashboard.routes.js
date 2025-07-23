const express = require('express');

const router = express.Router();

const Authorization = require("../middlewares/auth.middlewares");

const {getchannelvideos} = require("../controllers/dashboard.controllers");

router.route("/videos/ChannelId/:channelId").get(Authorization,getchannelvideos);



module.exports = router;