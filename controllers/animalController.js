const asyncWrapper = require("../middlewares/asyncWrapper");
const status = require("../utils/statusText");
const Animal = require("../models/animal.model");
const Owner = require("../models/owner.mode");
const AppError = require("../utils/appError");

const getAllAnimals = asyncWrapper(async (req, res, next) => {
    const animals = await Animal.find()
        .populate("ownerId", "firstName lastName")
        .select("-__v");

    res.status(200).json({
        status: status.SUCCESS,
        results: animals.length,
        data: animals,
    });
});

const getAnimalById = asyncWrapper(async (req, res, next) => {
    const animal = await Animal.findById(req.params.animalId)
        .populate("ownerId", "firstName lastName")
        .select("-__v");
    if (!animal)
        return next(
            AppError.create("No animal found with that ID", 404, status.ERROR)
        );

    res.status(200).json({ status: status.SUCCESS, data: animal });
});

const createAnimal = asyncWrapper(async (req, res, next) => {
    const { ownerId } = req.body;

    // Check if owner exists
    const ownerExists = await Owner.findById(ownerId);
    if (!ownerExists) {
        return next(AppError.create("Owner not found", 404, status.ERROR));
    }

    let animal = await Animal.create(req.body);

    // Add the animal to the owner's animals array
    await Owner.findByIdAndUpdate(ownerId, { $push: { animals: animal._id } });

    animal = await Animal.findById(animal._id)
        .populate("ownerId", "firstName lastName")
        .select("-__v");

    res.status(201).json({
        status: status.SUCCESS,
        message: "Animal created successfully",
        data: animal,
    });
});

const updateAnimal = asyncWrapper(async (req, res, next) => {
    const animal = await Animal.findByIdAndUpdate(
        req.params.animalId,
        req.body,
        {
            new: true,
            runValidators: true,
        }
    );

    if (!animal)
        return next(
            AppError.create("No animal found with that ID", 404, status.ERROR)
        );

    res.status(200).json({
        status: status.SUCCESS,
        message: "Animal updated successfully",
        data: animal,
    });
});

const deleteAnimal = asyncWrapper(async (req, res, next) => {
    const animal = await Animal.findById(req.params.animalId);

    if (!animal)
        return next(
            AppError.create("No animal found with that ID", 404, status.ERROR)
        );

    if (animal.ownerId) {
        await Owner.findByIdAndUpdate(animal.ownerId, {
            $pull: { animals: animal._id },
        });
    }

    // Delete the animal to from owner's animals array
    await Animal.findByIdAndDelete(req.params.animalId);

    res.status(200).json({
        status: status.SUCCESS,
        message: "Animal deleted successfully",
        data: null,
    });
});

module.exports = {
    getAllAnimals,
    getAnimalById,
    createAnimal,
    updateAnimal,
    deleteAnimal,
};
