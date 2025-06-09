const bcrypt = require("bcryptjs");
const Admin = require("../models/admin.model");
const asyncWrapper = require("../middlewares/asyncWrapper");
const appError = require("../utils/appError");
const generateJWT = require("../utils/generateJWT");
const statusText = require("../utils/statusText");

const createAdmin = asyncWrapper(async (req, res, next) => {
    const { username, password } = req.body;

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
        return next(appError.create("Username already exists", 400, statusText.FAIL));
    }

    const hashedPassword = await bcrypt.hash(password, 5);

    const newAdmin = new Admin({
        username,
        password: hashedPassword,
    });

    newAdmin.token = await generateJWT({ id: newAdmin._id, role: newAdmin.role });
    await newAdmin.save();

    const adminData = newAdmin.toObject();
    delete adminData.password;
    delete adminData.__v;

    res.status(201).json({ status: statusText.SUCCESS, data: { admin: adminData } });
});

const loginAdmin = asyncWrapper(async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return next(appError.create("Username and password are required", 400, statusText.FAIL));
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
        return next(appError.create("Invalid username", 400, statusText.FAIL));
    }

    const isMatched = await bcrypt.compare(password, admin.password);
    if (!isMatched) {
        return next(appError.create("Invalid password", 400, statusText.FAIL));
    }

    admin.token = await generateJWT({ id: admin._id, role: admin.role });
    await admin.save();

    const adminData = admin.toObject();
    delete adminData.password;
    delete adminData.__v;

    res.status(200).json({ status: statusText.SUCCESS, data: { admin: adminData } });
});

// Update admin
const updateAdmin = asyncWrapper(async (req, res, next) => {
    const oldAdmin = await Admin.findById(req.params.id).select("-password -__v");
    if (!oldAdmin) {
        return next(appError.create("Admin not found", 404, statusText.FAIL));
    }

    await Admin.updateOne({ _id: req.params.id }, { $set: { ...req.body } });

    const newAdmin = await Admin.findById(req.params.id).select("-password -__v");

    res.status(200).json({ status: statusText.SUCCESS, data: { newAdmin } });
});

// Delete admin
const deleteAdmin = asyncWrapper(async (req, res, next) => {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
        return next(appError.create("Admin not found", 404, statusText.FAIL));
    }
    res.status(200).json({ status: statusText.SUCCESS, message: "Admin deleted successfully" });
});

// Get all admins
const getAllAdmins = asyncWrapper(async (req, res, next) => {
    const admins = await Admin.find().select("-password -__v");
    res.status(200).json({ status: statusText.SUCCESS, data: { admins } });
});

module.exports = {
  createAdmin,
  loginAdmin,
  updateAdmin,
  deleteAdmin,
  getAllAdmins,
};
