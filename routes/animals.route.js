const express = require("express");

const router = express.Router();

const upload = require("../middlewares/multer");

const animalController = require("../controllers/animalController");

router.route("/")
    .get(animalController.getAllAnimals)

router.route("/create")
    .post(upload.single("avatar"), animalController.createAnimal);

router.get("/filter", animalController.filterAnimals);

router.get("/:ownerId", animalController.getAnimalsByOwner);

router.route("/:animalId")
    .get(animalController.getAnimalById)
    .patch(animalController.updateAnimal)
    .delete(animalController.deleteAnimal);

module.exports = router;
