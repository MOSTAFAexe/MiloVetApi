const Disease = require("../models/disease.model");
const asyncWrapper = require("../middlewares/asyncWrapper");
const appError = require("../utils/appError");
const statusText = require("../utils/statusText");
const userRoles = require("../utils/userRoles");
const { query } = require("express");

const cloudinary = require("../utils/cloudinary");

const createDisease = asyncWrapper( async (req, res, next)=>{

    let imageUrl = "";
    if (req.file) {
        try {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "diseases" },
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
            return next(appError.create("Image upload failed", 500, statusText.FAIL));
        }
    } else {
        const photos = [
            "https://res.cloudinary.com/dfasayt50/image/upload/v1746489740/d1_pslk8w.jpg",
            "https://res.cloudinary.com/dfasayt50/image/upload/v1746489741/d2_wyajw3.jpg",
            "https://res.cloudinary.com/dfasayt50/image/upload/v1746489735/d3_zkq43l.jpg",
            "https://res.cloudinary.com/dfasayt50/image/upload/v1746489739/d4.png_breo7g.jpg"
        ];
        imageUrl = photos[Math.floor(Math.random() * photos.length)];
        }

    const {title, content} = req.body;

    const newDisease = new Disease({
        title,
        content,
        photo: imageUrl
    });

    await newDisease.save();
    res.status(201).json({status: statusText.SUCCESS, data: {Disease: newDisease}})
});

const getAllDiseases = asyncWrapper(async (req, res, next)=>{
    let query = req.query;
    
    let limit = query.limit || 15;
    let page = query.page || 1;
    let skip = (page - 1) * limit;

    let diseases = await Disease.find({}, {"__v": 0}).limit(limit).skip(skip);
    res.status(200).json({status: statusText.SUCCESS, data: {diseases}})
});

module.exports = {
    createDisease,
    getAllDiseases
}