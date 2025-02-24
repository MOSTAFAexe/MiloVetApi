const asyncWrapper = require("../middlewares/asyncWrapper");
const status = require("../utils/statusText");
const Owner = require("../models/owner.mode");
const Animal = require("../models/animal.model");
const AppError = require("../utils/appError");

const getAllOwners = asyncWrapper(async (req, res, next) => {
    const owners = await Owner.find()
        .populate({
            path: "animals",
            select: "animalName species _id",
        })
        .select("-__v");

    res.status(200).json({
        status: status.SUCCESS,
        results: owners.length,
        data: owners,
    });
});

const getOwnerById = asyncWrapper(async (req, res, next) => {
    const owner = await Owner.findById(req.params.ownerId).populate({
        path: "animals",
        select: "animalName species _id",
    });

    if (!owner)
        return next(AppError.create("Owner not found", 404, status.ERROR));

    res.status(200).json({ status: status.SUCCESS, data: owner });
});

const updateOwner = asyncWrapper(async (req, res, next) => {
    const owner = await Owner.findByIdAndUpdate(req.params.ownerId, req.body, {
        new: true,
        runValidators: true,
    });

    if (!owner)
        return next(AppError.create("Owner not found", 404, status.ERROR));

    res.status(200).json({
        status: status.SUCCESS,
        message: "Owner updated successfully",
        data: owner,
    });
});

const deleteOwner = asyncWrapper(async (req, res, next) => {
    const owner = await Owner.findById(req.params.ownerId);

    if (!owner)
        return next(AppError.create("Owner not found", 404, status.ERROR));

    // This updates all animals that belong to the deleted owner, setting their ownerId to null
    await Animal.updateMany({ ownerId: owner._id }, { ownerId: null });

    await owner.deleteOne();

    res.status(200).json({
        status: status.SUCCESS,
        message: "Owner deleted successfully",
        data: null,
    });
});

module.exports = {
    getAllOwners,
    getOwnerById,
    updateOwner,
    deleteOwner,
};
