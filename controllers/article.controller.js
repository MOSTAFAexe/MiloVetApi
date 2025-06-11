const Article = require("../models/article.model");
const asyncWrapper = require("../middlewares/asyncWrapper");
const appError = require("../utils/appError");
const statusText = require("../utils/statusText");
const userRoles = require("../utils/userRoles");
const { query } = require("express");
const cloudinary = require("../utils/cloudinary");

const createArticle = asyncWrapper( async (req, res, next)=>{

    let imageUrl = "";
    if (req.file) {
        try {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "articles" },
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
        imageUrl = "https://res.cloudinary.com/dfasayt50/image/upload/v1746489731/article_dhbwwu.webp";
        }

    const {title, content, category } = req.body;

    const newArticle = new Article({
        title,
        content,
        category,
        photo: imageUrl,
        vetId: req.currentUser.id
    });

    await newArticle.save();
    res.status(201).json({status: statusText.SUCCESS, data: {article: newArticle}})
});

const getAllArticles = asyncWrapper(async (req, res, next)=>{
    let query = req.query;
    
    let limit = query.limit || 15;
    let page = query.page || 1;
    let skip = (page - 1) * limit;

    let articles = await Article.find({}, {"__v": 0}).limit(limit).skip(skip);
    res.status(200).json({status: statusText.SUCCESS, results: articles.length,  data: {articles}})
});

const getVetArticles = asyncWrapper(async (req, res, next)=>{
    const query = req.query;
    let vetId = req.currentUser.id;

    if (req.currentUser.role == userRoles.VET){
        vetId = req.currentUser.id;
    }
    else{
        if(!query.id){
            return next(appError.create("please enter vet id", 400, statusText.FAIL))
        }
        else{
            vetId = query.id;
        }
    }
    
    const limit = query.limit || 15;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    const articles = await Article.find({vetId: vetId}, {"__v": 0}).limit(limit).skip(skip);
    res.status(200).json({status: statusText.SUCCESS, data: {articles}})
})

const updateArticle = asyncWrapper(async (req, res, next)=>{
    const oldArticle = await Article.findById(req.params.id);
    if(!oldArticle){
        return next(appError.create("article not found!", 404, statusText.FAIL));
    }

    if(req.currentUser.id != oldArticle.vetId){
        return next(appError.create("you cant update an article you did not create!!", 401, statusText.FAIL));
    }

    await Article.updateOne({_id: req.params.id}, {$set: {...req.body}});
    
    const newArticle = await Article.findById(req.params.id).select("-__v");
    
    return res.status(200).json({status: statusText.SUCCESS, data: {newArticle}});
});

const deleteArticle = asyncWrapper(async (req, res, next)=>{
    const article = await Article.findById(req.params.id);
    if(!article){
        return next(appError.create("article not found!", 404, statusText.FAIL));
    }

    if(req.currentUser.id != article.vetId){
        return next(appError.create("you cant delete an article you did not create!!", 401, statusText.FAIL));
    }

    await Article.deleteOne({_id: req.params.id});
    return res.status(200).json({status: statusText.SUCCESS, data: null});
})

const getArticleById = asyncWrapper(async (req, res, next)=>{
    const article = await Article.findById(req.params.id).select("-__v");
        if(!article){
            return next(appError.create("article not found!", 404, statusText.FAIL));
        }
    return res.status(200).json({status: statusText.SUCCESS, data: {article}});
})

const searchArticles = asyncWrapper(async(req, res, next)=>{
    const squery = req.query.squery; 
    const limit = req.query.limit || 15;
    const page = req.query.page || 1;
    const skip = (page - 1) * limit;

    if (!squery) {
        const articles = await Article.find({}, {"__v": 0}).limit(limit).skip(skip);
        return res.status(200).json({status: statusText.SUCCESS, data: {articles}})
    }

    const searchedArticles = await Article.find({
        $or: [
            { title: { $regex: squery, $options: "i" } }, 
            { category: { $regex: squery, $options: "i" } }
        ]
    }).select("-__v").limit(limit).skip(skip);

    if (searchedArticles.length === 0) {
        return next(appError.create("No articles found", 404, statusText.FAIL));
    }
    
    res.status(200).json({ status: statusText.SUCCESS, data: { searchedArticles } });
})

module.exports = {
    createArticle,
    getAllArticles,
    getVetArticles,
    updateArticle,
    deleteArticle,
    getArticleById,
    searchArticles
}