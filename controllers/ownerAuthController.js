const asyncWrapper = require("../middlewares/asyncWrapper");
const status = require("../utils/statusText");
const Owner = require("../models/owner.mode");
const AppError = require("../utils/appError");
const generateJWT = require("../utils/generateJWT");

const bcrypt = require("bcrypt");
const userRoles = require("../utils/userRoles");

const cloudinary = require("../utils/cloudinary");

const register = asyncWrapper(async (req, res, next) => {

    let imageUrl = "";
        if (req.file) {
            try {
                const result = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: "owners" },
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
            imageUrl = req.body.gender === "male"
                ? "https://res.cloudinary.com/dfasayt50/image/upload/v1746489736/male_lw8pvo.png"
                : "https://res.cloudinary.com/dfasayt50/image/upload/v1746489735/female_hzognu.png";
            }

    const {
        firstName,
        lastName,
        email,
        password,
        phone,
        address,
        gender,
    } = req.body;

    if (!firstName || !lastName || !email || !password || !gender) {
        return next(
            AppError.create("All fields are required", 400, status.FAIL)
        );
    }

    const existOwner = await Owner.findOne({ email });
    if (existOwner) {
        return next(
            AppError.create("Email is already in use", 400, status.FAIL)
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newOwner = await Owner.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        address,
        gender,
        avatar: imageUrl,
    });

    const token = await generateJWT({
        email: newOwner.email,
        ownerId: newOwner._id,
        role: userRoles.OWNER,
    });

    newOwner.token = token;

    res.status(201).json({
        status: status.SUCCESS,
        message: "User registered successfully",
        data: {
            owner: newOwner,
            token,
        },
    });
});

const login = asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(
            AppError.create(
                "Please provide email and password",
                400,
                status.FAIL
            )
        );
    }

    const owner = await Owner.findOne({ email });

    if (!owner) {
        return next(AppError.create("User not found", 404, status.FAIL));
    }

    const matchedPassword = await bcrypt.compare(password, owner.password);

    if (!matchedPassword) {
        return next(AppError.create("Invalid password", 401, status.FAIL));
    }

    const token = await generateJWT({
        email: owner.email,
        ownerId: owner._id,
        role: owner.role,
    });
    owner.token = token;

    // Delete The Password from response for security reasons
    const ownerData = owner.toObject();
    delete ownerData.password;

    return res.status(200).json({
        status: status.SUCCESS,
        message: "User Logged in Successfully.",
        data: { owner: ownerData, token },
    });
});

module.exports = { register, login };
