const express = require("express");

const router = express.Router();

const animalController = require("../controllers/animalController");

router
    .route("/")
    .get(animalController.getAllAnimals)
    .post(animalController.createAnimal);

router
    .route("/:animalId")
    .get(animalController.getAnimalById)
    .patch(animalController.updateAnimal)
    .delete(animalController.deleteAnimal);

module.exports = router;
