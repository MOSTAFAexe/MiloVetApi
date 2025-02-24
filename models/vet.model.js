const mongoose  = require("mongoose");
const validator = require("validator");

const userRoles = require("../utils/userRoles");

const vetSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate: [validator.isEmail, "field must be a valid email address"],
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        type: String
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: true
    },
    speciality: {
        type: String,
        require: true,
        trim: true
    },
    experienceYears: {
        type: Number
    },
    clinicAddress: {
        type: String
    },
    token: {
        type: String
    },
    role: {
        type: String,
        default: userRoles.VET
    },
    avatar: {
        type: String,
        default: function () {
            return this.gender == "male"
              ? "uploads/maleVet.png"
              : "uploads/femaleVet.png";
          }
    }
    
})

module.exports = mongoose.model("Vet", vetSchema);