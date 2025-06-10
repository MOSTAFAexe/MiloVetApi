const express = require("express");
const router = express.Router();

const upload = require("../middlewares/multer");
const verifyToken = require("../middlewares/verifyToken");
const productController = require("../controllers/product.controller");
const allowedTo = require("../middlewares/allowedTo");
const userRoles = require("../utils/userRoles")

router.route("/")
    .get(productController.getAllProducts);
    
// router.route("/search")
//     .get(productController.searchByName);
    
// router.route("/filter")
//     .get(productController.filterByCategory);

router.route("/filterandsearch")
    .get(productController.filterAndSearch);

// admin
router.route("/create")
    .post(verifyToken, upload.array("images", 5), allowedTo(userRoles.ADMIN, userRoles.MANAGER), productController.createProduct)

router.route("/:id")
    .get(productController.getProductById)
    // admin
    .patch(verifyToken, allowedTo(userRoles.ADMIN, userRoles.MANAGER), productController.updateProduct)
    .delete(verifyToken, allowedTo(userRoles.ADMIN, userRoles.MANAGER), productController.removeProduct);

module.exports = router;
