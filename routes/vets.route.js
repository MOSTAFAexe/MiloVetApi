const express = require("express");
const {body} = require("express-validator");

const router = express.Router();  
const vetController = require("../controllers/vet.controller")
const verifyToken = require("../middlewares/verifyToken");

router.route("/")
    .get(vetController.getAllVets);

router.route("/search")
    .get(vetController.searchVet);

router.route("/experience")
    .get(vetController.getVetsByExperience);

router.route("/:id")
    .get(vetController.getVetById)
    .patch(vetController.updateVet)
    .delete(vetController.deleteVet);

module.exports = router;