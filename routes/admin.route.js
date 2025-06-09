const express = require("express");
const { body } = require("express-validator");

const router = express.Router();
const adminController = require("../controllers/admin.controller");
const verifyToken = require("../middlewares/verifyToken");
const allowedTo = require("../middlewares/allowedTo");
const userRoles = require("../utils/userRoles")

router.route("/login")
    .post(adminController.loginAdmin);

// allowed to MANAGER
router.route("/create")
    .post(
        verifyToken,
        allowedTo(userRoles.MANAGER),
        body("username").notEmpty().withMessage("Username is required"),
        body("password").isLength({ min: 5 }).withMessage("Password must be at least 5 characters"),
        adminController.createAdmin
    );

router.route("/")
    .get(verifyToken, allowedTo(userRoles.MANAGER), adminController.getAllAdmins);    

router.route("/:id")
    .patch(verifyToken, allowedTo(userRoles.MANAGER), adminController.updateAdmin)
    .delete(verifyToken, allowedTo(userRoles.MANAGER), adminController.deleteAdmin);

module.exports = router;
