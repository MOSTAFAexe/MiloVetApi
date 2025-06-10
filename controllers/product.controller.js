const Product = require("../models/product.model");
const asyncWrapper = require("../middlewares/asyncWrapper");
const appError = require("../utils/appError");
const statusText = require("../utils/statusText");
const cloudinary = require("../utils/cloudinary");

const createProduct = asyncWrapper(async (req, res, next) => {
    const { title, description, price, category, quantity, rating } = req.body;
    const uploadedImages = [];

    if (!req.files || req.files.length === 0) {
        return next(appError.create("At least one image is required", 400, statusText.FAIL));
    }


    for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
            if (error) reject(error);
            else resolve(result);
            }
        );
        stream.end(file.buffer);
        });

        uploadedImages.push(result.secure_url);
    }

    const newProduct = new Product({
        title,
        description,
        price: Number(price),
        quantity: Number(quantity),
        rating: Number(rating),
        category,
        images: uploadedImages,
    });

    await newProduct.save();
    delete newProduct.__v;
    res.status(201).json({ status: statusText.SUCCESS, data: { product: newProduct } });
});

const updateProduct = asyncWrapper(async (req, res, next) => {
    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) {
        return next(appError.create("Product not found", 404, statusText.FAIL));
    }

    const updates = {
        ...req.body,
        updatedAt: Date.now()
    };

    if (updates.price) updates.price = Number(updates.price);
    if (updates.quantity) updates.quantity = Number(updates.quantity);
    if (updates.rating) updates.rating = Number(updates.rating);
    if (updates.sold) updates.sold = Number(updates.sold);

    await Product.updateOne({ _id: req.params.id }, { $set: updates });
    const newProduct = await Product.findById(req.params.id).select("-__v");

    res.status(200).json({ status: statusText.SUCCESS, data: { newProduct } });
});

const removeProduct = asyncWrapper(async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
        return next(appError.create("Product not found", 404, statusText.FAIL));
    }

    res.status(200).json({ status: statusText.SUCCESS, message: "Product deleted successfully" });
});

// const searchByName = asyncWrapper(async (req, res, next) => {
//     const { name } = req.query;
//     const products = await Product.find({ title: { $regex: name, $options: "i" } }).select("-__v");;
//     res.status(200).json({ status: statusText.SUCCESS, data: { products } });
// });

// const filterByCategory = asyncWrapper(async (req, res, next) => {
//     const { category } = req.query;
//     const products = await Product.find({ category }).select("-__v");
//     res.status(200).json({ status: statusText.SUCCESS, data: { products } });
// });

const filterAndSearch = asyncWrapper(async (req, res, next) => {
    const { category, name } = req.query;
    let products;

    if(!category){
        if(name) {
            products = await Product.find({ title: { $regex: name, $options: "i" } }).select("-__v");
        } 
        else {
            products = await Product.find().select("-__v");
        }

        return res.status(200).json({ status: statusText.SUCCESS, data: { products } });
    }
    else{
        let filter = { category };
        if(name) {
            filter.title = { $regex: name, $options: "i" };
        }
        products = await Product.find(filter).select("-__v");

        return res.status(200).json({ status: statusText.SUCCESS, data: { products } });
    }
});

const getAllProducts = asyncWrapper(async (req, res, next) => {
    const products = await Product.find().select("-__v");
    res.status(200).json({ status: statusText.SUCCESS, data: { products } });
});

const getProductById = asyncWrapper(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(appError.create("Product not found", 404, statusText.FAIL));
    }

    delete product.__v;
    res.status(200).json({ status: statusText.SUCCESS, data: { product } });
});

module.exports = {
    createProduct,
    updateProduct,
    removeProduct,
    // searchByName,
    // filterByCategory,
    getAllProducts,
    getProductById,
    filterAndSearch,
};
