const express = require("express");
const router = express.Router();
const ownerAuthController = require("../controllers/ownerAuthController");

router.post("/register", ownerAuthController.register);
router.post("/login", ownerAuthController.login);

module.exports = router;
