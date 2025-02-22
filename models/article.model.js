const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true, 
        trim: true },

    content: { 
        type: String, 
        required: true 
    },

    Category: { 
        type: String, 
        required: true, 
        trim: true 
    },

    createdTime: { 
        type: Date, 
        default: Date.now 
    },

    vetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vet", 
        required: true,
    },
});

module.exports = mongoose.model("Article", articleSchema);
