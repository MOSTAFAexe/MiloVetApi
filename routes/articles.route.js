const express = require("express");
const {body} = require("express-validator");

const router = express.Router();  
const articleController = require("../controllers/article.controller");
const verifyToken = require("../middlewares/verifyToken");
const allowedTo = require("../middlewares/allowedTo");
const userRoles = require("../utils/userRoles");
const upload = require("../middlewares/multer");

router.route("/")
    .get(verifyToken, articleController.getAllArticles);

router.route("/search")
    .get(verifyToken, articleController.searchArticles);

router.route("/create")
    .post(verifyToken, upload.single("photo"), articleController.createArticle);

router.route("/vetarticles")
    .get(verifyToken, articleController.getVetArticles);

router.route("/:id")
    .patch(verifyToken, articleController.updateArticle)
    .delete(verifyToken, articleController.deleteArticle)
    .get(verifyToken, articleController.getArticleById);

module.exports = router;