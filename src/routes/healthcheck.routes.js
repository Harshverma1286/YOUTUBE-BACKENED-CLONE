const express = require('express');

const router = express.Router();

const { healthcheck } = require("../controllers/healthcheck.controllers");

router.route("/c/healthcheck").get(healthcheck);


module.exports = router;