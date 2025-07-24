const express = require('express');

const router = express.Router();

const Authorization = require("../middlewares/auth.middlewares");

const {getchannelvideos, getchannelstats} = require("../controllers/dashboard.controllers");

router.route("/videos/ChannelId/:channelId").get(Authorization,getchannelvideos);


router.route("/channelstats/channelid/:channelId").get(Authorization,getchannelstats);



module.exports = router;