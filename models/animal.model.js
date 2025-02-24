const mongoose = require("mongoose");

const animalSchema = new mongoose.Schema({
    animalName: {
        type: String,
        required: true,
        trim: true,
    },

    species: {
        type: String,
        enum: ["dog", "cat", "horse"],
        required: true,
    },

    breed: {
        type: String,
        required: true,
        trim: true,
    },

    age: {
        type: Number,
        required: true,
        min: 0,
    },

    gender: {
        type: String,
        enum: ["male", "female"],
        required: true,
    },

    status: {
        type: String,
        enum: ["healthy", "sick", "injured", "under treatment"],
        default: "healthy",
    },

    medicalHistory: {
        type: String,
        default: "No medical history available",
    },

    avatar: {
        type: String,

        // Use function() instead of () => {} in avatar's default to access "this" correctly,because "this" inside an arrow function does not refer to the document instance
        default: function () {
            return `uploads/${this.species}.png`;
        },
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Owner",
        required: true,
    },
});

module.exports = mongoose.model("Animal", animalSchema);
