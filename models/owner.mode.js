const mongoose = require("mongoose");
const validator = require("validator");

const userRoles = require("../utils/userRoles");

const ownerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate: [validator.isEmail, "field must be a valid email address"],
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    address: {
        type: String,
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: true,
    },
    token: {
        type: String,
    },
    role: {
        type: String,
        default: userRoles.OWNER,
    },
    avatar: {
        type: String,

        // Use function() instead of () => {} in avatar's default to access "this" correctly,because "this" inside an arrow function does not refer to the document instance
        default: function () {
            return this.gender === "male"
                ? "uploads/male.png"
                : "uploads/female.png";
        },
    },
    animals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Animal" }],
});

module.exports = mongoose.model("Owner", ownerSchema);
