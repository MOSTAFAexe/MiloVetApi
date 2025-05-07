const express = require("express");

const upload = require("../middlewares/multer");

const router = express.Router();
const ownerAuthController = require("../controllers/ownerAuthController");

router.route("/register")
    .post(upload.single("avatar"), ownerAuthController.register);
    
router.post("/login", ownerAuthController.login);

module.exports = router;
