const express = require("express");
const {body} = require("express-validator");

const router = express.Router();  
const vetAuthController = require("../controllers/vetAuth.controller")
const verifyToken = require("../middlewares/verifyToken");

router.route("/register")
    .post(vetAuthController.register);

router.route("/login")
    .post(vetAuthController.login);

module.exports = router;