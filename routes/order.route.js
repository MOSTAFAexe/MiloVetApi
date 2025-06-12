const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orders.controller");
const verifyToken = require("../middlewares/verifyToken");

router.route("/")
    .get(orderController.getAllOrders);

router.route("/status")
    .get(orderController.getOrdersByStatusAndTotalAmount);

router.route("/status/:id")
    .patch(orderController.updateOrderStatus);

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

router.route("/:id")
    .get(orderController.getOrderById)
    .delete(orderController.deleteOrder);

module.exports = router;