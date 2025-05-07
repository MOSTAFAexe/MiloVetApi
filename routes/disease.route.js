const express = require("express");

const router = express.Router();
const diseaseController = require("../controllers/disease.controller");

const upload = require("../middlewares/multer");

router.route("/")
    .get(diseaseController.getAllDiseases);

router.route("/create")
    .post(upload.single("photo"), diseaseController.createDisease);

module.exports = router;