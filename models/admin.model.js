const mongoose = require("mongoose");
const userRoles = require("../utils/userRoles");

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: userRoles.ADMIN,
    },
    token: {
        type: String,
    },
});

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
