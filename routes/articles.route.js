const express = require("express");
const {body} = require("express-validator");

const router = express.Router();  
const articleController = require("../controllers/article.controller");
const verifyToken = require("../middlewares/verifyToken");
const allowedTo = require("../middlewares/allowedTo");
const userRoles = require("../utils/userRoles");

router.route("/")
    .get(verifyToken, allowedTo(userRoles.OWNER), articleController.getAllArticles);

router.route("/search")
    .get(verifyToken, allowedTo(userRoles.OWNER), articleController.searchArticles);

router.route("/create")
    .post(verifyToken, allowedTo(userRoles.VET), articleController.createArticle);

router.route("/vetarticles")
    .get(verifyToken, articleController.getVetArticles);

router.route("/:id")
    .patch(verifyToken, allowedTo(userRoles.VET), articleController.updateArticle)
    .delete(verifyToken, allowedTo(userRoles.VET), articleController.deleteArticle)
    .get(verifyToken, articleController.getArticleById);

module.exports = router;