const express = require('express');

const router = express.Router();

const registeruser = require('../controllers/user.controllers')

router.route("/register").post(registeruser);


module.exports = router;

