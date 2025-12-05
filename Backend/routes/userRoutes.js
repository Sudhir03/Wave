const express = require("express");
const userController = require("../controllers/userController");
const { requireAuth } = require("../middlewares/requireAuth");

const router = express.Router();

router.post("/sync", userController.clerkUserSync);

router.get("/search", requireAuth, userController.searchUsers);

module.exports = router;
