const express = require('express');

const router = express.Router();

const Authorization = require('../middlewares/auth.middlewares');

const { togglesubscription, getuserchannelsubscribers,getsubscribedchannels } = require("../controllers/subscription.controllers");


router.route("/togglesubscription/channelid/:ChannelId").post(Authorization,togglesubscription);

router.route("/channels/:channelId/subscribers").get(Authorization,getuserchannelsubscribers);

router.route("/channels/subscribed/:subscriberId").get(Authorization,getsubscribedchannels);


module.exports = router;