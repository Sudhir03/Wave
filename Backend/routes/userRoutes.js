const express = require("express");

const userController = require("../controllers/userController");
const { requireAuth } = require("../middlewares/requireAuth");
const upload = require("../middlewares/upload");

const router = express.Router();

router.post("/sync", userController.clerkUserSync);

router.get("/me", requireAuth, userController.getMe);

router.patch("/me", requireAuth, userController.updateMe);

router.patch(
  "/me/avatar",
  requireAuth,
  upload.single("avatar"),
  userController.updateAvatar
);

router.patch("/me/password", requireAuth, userController.updatePassword);

router.get("/search", requireAuth, userController.searchUsers);

module.exports = router;
