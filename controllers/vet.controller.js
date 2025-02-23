const bcrypt = require("bcryptjs");

const Vet = require("../models/vet.model");
const asyncWrapper = require("../middlewares/asyncWrapper");
const appError = require("../utils/appError");
const generateJWT = require("../utils/generateJWT");
const statusText = require("../utils/statusText");

const getAllVets = asyncWrapper(async (req, res)=>{
    query = req.query;

    const limit = query.limit || 15;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    const vets = await Vet.find({}, {"__v": 0, "password": 0}).limit(limit).skip(skip);
    res.status(200).json({status: statusText.SUCCESS, data: {vets}})
})

const getVetById = asyncWrapper(async (req, res, next)=>{
    const vet = await Vet.findById(req.params.id).select("-password -__v");
    if(!vet){
        return next(appError.create("vet not found!", 404, statusText.FAIL));
    }
    return res.status(200).json({status: statusText.SUCCESS, data: {vet}});
});

const updateVet = asyncWrapper(async (req, res, next)=>{
    const oldVet = await Vet.findById(req.params.id).select("-password -__v");
    if(!oldVet){
        return next(appError.create("vet not found!", 404, statusText.FAIL));
    }

    await Vet.updateOne({_id: req.params.id}, {$set: {...req.body}});

    const newVet = await Vet.findById(req.params.id).select("-password -__v");

    return res.status(200).json({status: statusText.SUCCESS, data: {newVet}});
})

const deleteVet = asyncWrapper(async (req, res, next)=>{
    const vet = await Vet.findById(req.params.id);
    if(!vet){
        return next(appError.create("vet not found!", 404, statusText.FAIL));
    }
    await Vet.deleteOne({_id: req.params.id});
    return res.status(200).json({status: statusText.SUCCESS, data: null});
})

const searchVet = asyncWrapper(async (req, res, next) => {
    const squery = req.query.squery; 
    const limit = req.query.limit || 15;
    const page = req.query.page || 1;
    const skip = (page - 1) * limit;

    if (!squery) {
        return next(appError.create("Search query is required", 400, statusText.FAIL));
    }

    const vets = await Vet.find({
        $or: [
            { firstName: { $regex: squery, $options: "i" } }, 
            { lastName: { $regex: squery, $options: "i" } }, 
            { speciality: { $regex: squery, $options: "i" } } 
        ]
    }).select("-password -__v").limit(limit).skip(skip);

    if (vets.length === 0) {
        return next(appError.create("No vets found", 404, statusText.FAIL));
    }

    res.status(200).json({ status: statusText.SUCCESS, data: { vets } });
});

const getVetsByExperience = async (req, res, next) => {
    try {
        const minExperience = +req.query.minExperience || 0; 
        const limit = req.query.limit || 15;
        const page = req.query.page || 1;
        const skip = (page - 1) * limit;

        const exists = !(minExperience == 0)
        console.log(exists);

        const vets = await Vet.find({
            $or: [
            { experienceYears: { $gte: Number(minExperience) } }, // Vets with experienceYears >= minExperience
            { experienceYears: { $exists: exists } } // Vets without experienceYears field
            ] 
        }).sort({ experienceYears: -1 }).select("-password -__v").skip(skip).limit(limit); 

        if (vets.length === 0) {
            return next(appError.create("No vets found", 404, statusText.FAIL));
        }

        res.status(200).json({ status: statusText.SUCCESS, data: vets });
    } 
    catch (error) {
        next(error);
    }
};



module.exports = {
    getAllVets,
    getVetById,
    updateVet,
    deleteVet,
    searchVet,
    getVetsByExperience
}