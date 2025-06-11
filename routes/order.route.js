const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orders.controller");
const verifyToken = require("../middlewares/verifyToken");

// router.use(verifyToken); // All routes below require auth

router.route("/additem")
    .post(verifyToken, orderController.addItemToOrder);

router.route("/removeitem/:productId")
    .delete(verifyToken, orderController.removeItemFromOrder);

router.route("/decreaseitem/:productId")
    .patch(verifyToken, orderController.decreaseItemQuantity);

router.route("/confirm/:id")
    .patch(verifyToken, orderController.confirmOrder);

router.route("/lastpending")
    .get(verifyToken, orderController.getLastPendingOrder);

module.exports = router;