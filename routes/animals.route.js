const express = require("express");

const router = express.Router();
const animalController = require("../controllers/animalController");
const verifyToken = require("../middlewares/verifyToken");
const allowedTo = require("../middlewares/allowedTo");
const userRoles = require("../utils/userRoles");
const upload = require("../middlewares/multer");

router.route("/")
    .get(animalController.getAllAnimals)

router.route("/create")
    .post(verifyToken, allowedTo(userRoles.OWNER), upload.single("avatar"), animalController.createAnimal);

router.get("/filter", animalController.filterAnimals);

router.get("/:ownerId", animalController.getAnimalsByOwner);

router.route("/:animalId")
    .get(animalController.getAnimalById)
    .patch(animalController.updateAnimal)
    .delete(animalController.deleteAnimal);

module.exports = router;
