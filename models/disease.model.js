const mongoose = require("mongoose");

const diseaseSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true, 
        trim: true 
    },

    content: { 
        type: String, 
        required: true 
    },

    createdTime: { 
        type: Date, 
        default: Date.now 
    },

    photo: { 
        type: String,
        default: function getRandomNumber() {
            const n = Math.floor(Math.random() * 4) + 1;
            return `uploads/d${n}.png`
        }
    },
});

module.exports = mongoose.model("Disease", diseaseSchema);
