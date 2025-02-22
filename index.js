require("dotenv").config();

const statusText = require("./utils/statusText");

const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const express = require("express");

const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// connect to the database
mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("mongoDB sever started");
});

app.use(cors());
app.use(express.json());

// Routers
const ownersRouter = require("./routes/owners.route");
const vetsRouter = require("./routes/vets.route");
const animalsRouter = require("./routes/animals.route");
const articlesRouter = require("./routes/articles.route");

app.use("/api/owners", ownersRouter);
app.use("/api/vets", vetsRouter);
app.use("/api/animals", animalsRouter);
app.use("/api/articles", articlesRouter);

// default route
// global middleware for not found routes
app.all("*", (req, res, next)=>{
    res.json({status: statusText.ERROR, msg: "this resource is not availablee"});
});

// global error handler
app.use((err, req, res, next) => {
    
    res.status(err.statusCode || 500)
        .json({status: err.statusText || statusText.ERROR, data: null, code: err.statusCode || 500, msg: err.message});
})

app.listen(process.env.PORT || 5001, ()=>{
    console.log("listening on port 5001")
})