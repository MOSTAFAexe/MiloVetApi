const express = require("express");

const router = express.Router();

const ownerController = require("../controllers/ownerController");

router.route("/").get(ownerController.getAllOwners);

router
    .route("/:ownerId")
    .get(ownerController.getOwnerById)
    .patch(ownerController.updateOwner)
    .delete(ownerController.deleteOwner);

module.exports = router;
