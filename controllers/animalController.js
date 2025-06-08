const asyncWrapper = require("../middlewares/asyncWrapper");
const statusCode = require("../utils/statusText");
const Animal = require("../models/animal.model");
const Owner = require("../models/owner.mode");
const AppError = require("../utils/appError");

const cloudinary = require("../utils/cloudinary");

const getAllAnimals = asyncWrapper(async (req, res, next) => {
    const animals = await Animal.find()
        .populate("ownerId", "firstName lastName")
        .select("-__v");

    res.status(200).json({
        status: statusCode.SUCCESS,
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
            AppError.create(
                "No animal found with that ID",
                404,
                statusCode.ERROR
            )
        );

    res.status(200).json({ status: statusCode.SUCCESS, data: animal });
});

const createAnimal = asyncWrapper(async (req, res, next) => {
    const { animalName, species, breed, age, gender, status, medicalHistory, ownerId } = req.body;

    // "animalName": "Luna",
    // "species": "dog",
    // "breed": "Siamese",
    // "age": 1,
    // "gender": "female",
    // "status": "healthy",
    // "medicalHistory": "No medical history",
    // "ownerId": "67ba7a3a80fd30f185243f4d"
    let imageUrl = "";
    if (req.file) {
        try {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "animals" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
            stream.end(req.file.buffer); 
        });

        imageUrl = result.secure_url;
        }
        catch (error) {
            return next(AppError.create("Image upload failed", 500, status.FAIL));
        }
    } 
    else {
        imageUrl = req.body.species === "cat"
            ? "https://res.cloudinary.com/dfasayt50/image/upload/v1746489732/cat_td0d1r.png"
            : req.body.species === "dog"
            ? "https://res.cloudinary.com/dfasayt50/image/upload/v1746489735/dog_oi26sm.png"
            : "https://res.cloudinary.com/dfasayt50/image/upload/v1746489736/horse_klhoao.png";
        }

    // Check if owner exists
    const ownerExists = await Owner.findById(ownerId);
    if (!ownerExists) {
        return next(AppError.create("Owner not found", 404, statusCode.ERROR));
    }

    let animal = await Animal.create(
        {
            animalName, 
            species, 
            breed, 
            age, 
            gender, 
            status, 
            medicalHistory,
            ownerId,
            avatar: imageUrl
        }
    );

    // Add the animal to the owner's animals array
    await Owner.findByIdAndUpdate(ownerId, { $push: { animals: animal._id } });

    animal = await Animal.findById(animal._id)
        .populate("ownerId", "firstName lastName")
        .select("-__v");

    res.status(201).json({
        status: statusCode.SUCCESS,
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
            AppError.create(
                "No animal found with that ID",
                404,
                statusCode.ERROR
            )
        );

    res.status(200).json({
        status: statusCode.SUCCESS,
        message: "Animal updated successfully",
        data: animal,
    });
});

const deleteAnimal = asyncWrapper(async (req, res, next) => {
    const animal = await Animal.findById(req.params.animalId);

    if (!animal)
        return next(
            AppError.create(
                "No animal found with that ID",
                404,
                statusCode.ERROR
            )
        );

    if (animal.ownerId) {
        await Owner.findByIdAndUpdate(animal.ownerId, {
            $pull: { animals: animal._id },
        });
    }

    // Delete the animal to from owner's animals array
    await Animal.findByIdAndDelete(req.params.animalId);

    res.status(200).json({
        status: statusCode.SUCCESS,
        message: "Animal deleted successfully",
        data: null,
    });
});

const filterAnimals = asyncWrapper(async (req, res, next) => {
    const { species, status } = req.query;

    let filter = {};

    if (species) filter.species = species;
    if (status) filter.status = status;

    const animals = await Animal.find(filter).populate({
        path: "ownerId",
        select: "firstName lastName",
    });

    if (animals.length === 0) {
        let message = "";

        if (species) {
            message = `There are no ${species}s in the database`;
        } else if (status) {
            message = `There are no animals with the status '${status}' `;
        } else {
            message = "No animals found.";
        }

        return next(AppError.create(message, 400, status.FAIL));
    }

    res.status(200).json({
        status: statusCode.SUCCESS,
        results: animals.length,
        data: animals,
    });
});

const getAnimalsByOwner = asyncWrapper(async (req, res, next) => {
    const { ownerId } = req.params;

    if (!ownerId) {
        return next(AppError.create("Owner not found.", 400, statusCode.FAIL));
    }

    const animals = await Animal.find({ ownerId }).populate({
        path: "ownerId",
        select: "firstName lastName ",
    });

    if (animals.length === 0) {
        return next(
            AppError.create(
                "This owner has no registered animals.",
                404,
                statusCode.FAIL
            )
        );
    }

    res.status(200).json({
        status: statusCode.SUCCESS,
        results: animals.length,
        data: animals,
    });
});

module.exports = {
    getAllAnimals,
    getAnimalById,
    createAnimal,
    updateAnimal,
    deleteAnimal,
    filterAnimals,
    getAnimalsByOwner,
};
